use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use chrono::Utc;

use crate::error::AuthError;
use crate::grok_import::import_oauth_from_grok;
use crate::http::{FormPoster, UreqPoster};
use crate::oidc::{refresh_grant, run_device_code_flow};
use crate::session::{OAuthSession, Session};
use crate::store::TokenStore;

pub struct AuthClient {
    store: TokenStore,
    http: Arc<dyn FormPoster>,
    grok_path: Option<PathBuf>,
    sleep: Arc<dyn Fn(Duration) + Send + Sync>,
}

impl Default for AuthClient {
    fn default() -> Self {
        Self::new(TokenStore::default_path())
    }
}

impl AuthClient {
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self {
            store: TokenStore::new(path),
            http: Arc::new(UreqPoster),
            grok_path: None,
            sleep: Arc::new(std::thread::sleep),
        }
    }

    #[cfg(test)]
    pub(crate) fn with_http(mut self, http: Arc<dyn FormPoster>) -> Self {
        self.http = http;
        self
    }

    #[cfg(test)]
    pub(crate) fn with_sleep(mut self, sleep: Arc<dyn Fn(Duration) + Send + Sync>) -> Self {
        self.sleep = sleep;
        self
    }

    #[cfg(test)]
    pub(crate) fn with_grok_path(mut self, path: impl Into<PathBuf>) -> Self {
        self.grok_path = Some(path.into());
        self
    }

    pub fn load(&self) -> Result<Session, AuthError> {
        self.store.load()
    }

    pub fn login(&self) -> Result<OAuthSession, AuthError> {
        let mut stderr = io::stderr();
        self.login_with_stderr(&mut stderr)
    }

    pub fn login_with_stderr(&self, stderr: &mut dyn Write) -> Result<OAuthSession, AuthError> {
        let session = run_device_code_flow(self.http.as_ref(), self.sleep.as_ref(), stderr)?;
        let _lock = self.store.lock()?;
        self.store.save(&session)?;
        Ok(session)
    }

    pub fn login_from_grok(&self) -> Result<OAuthSession, AuthError> {
        let session = import_oauth_from_grok(self.grok_path.as_deref())?;
        let _lock = self.store.lock()?;
        self.store.save(&session)?;
        Ok(session)
    }

    pub fn logout(&self) -> Result<(), AuthError> {
        let _lock = self.store.lock()?;
        self.store.clear()
    }

    pub fn refresh_if_needed(&self, session: Session) -> Result<Session, AuthError> {
        let Session::OAuth(current) = session else {
            return Ok(Session::LoggedOut);
        };
        if current.is_fresh(Utc::now()) {
            return Ok(Session::OAuth(current));
        }
        if current.refresh_token.is_none() {
            return Err(AuthError::NeedLogin);
        }
        let _lock = self.store.lock()?;
        let latest = self.store.load()?;
        if let Session::OAuth(ref s) = latest
            && s.is_fresh(Utc::now())
        {
            return Ok(latest);
        }
        let Session::OAuth(latest_oauth) = latest else {
            return Err(AuthError::NeedLogin);
        };
        let Some(refresh) = latest_oauth.refresh_token.as_deref() else {
            return Err(AuthError::NeedLogin);
        };
        let grant = match refresh_grant(self.http.as_ref(), refresh) {
            Ok(g) => g,
            Err(AuthError::RefreshRevoked) => {
                self.store.clear()?;
                return Err(AuthError::RefreshRevoked);
            }
            Err(e) => return Err(e),
        };
        let new = OAuthSession {
            access_token: grant.access_token,
            refresh_token: grant.refresh_token.or(latest_oauth.refresh_token),
            expires_at: grant.expires_at,
            email: grant.email.or(latest_oauth.email),
            subject: if grant.subject.is_empty() {
                latest_oauth.subject
            } else {
                grant.subject
            },
            issuer: latest_oauth.issuer,
            client_id: latest_oauth.client_id,
        };
        self.store.save(&new)?;
        Ok(Session::OAuth(new))
    }

    pub fn store_path(&self) -> &Path {
        self.store.path()
    }
}

#[cfg(test)]
#[path = "client_tests.rs"]
mod tests;
