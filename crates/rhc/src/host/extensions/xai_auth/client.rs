use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;

use chrono::Utc;

use super::grok_import::import_oauth_from_grok;
use super::http::{UreqHttp, XaiHttp};
use super::oidc::{refresh_grant, run_loopback_flow};
use super::session::OAuthSession;
use super::store::TokenStore;
use crate::host::ports::auth::{Auth, AuthError, CredentialSnapshot, Subscription};

pub struct AuthClient {
    store: TokenStore,
    http: Arc<dyn XaiHttp>,
    grok_auth_path: PathBuf,
}

impl AuthClient {
    pub(super) fn new(rhc_home: &Path, grok_auth_path: PathBuf) -> Self {
        Self {
            store: TokenStore::in_dir(rhc_home),
            http: Arc::new(UreqHttp),
            grok_auth_path,
        }
    }

    #[cfg(test)]
    pub(crate) fn with_http(mut self, http: Arc<dyn XaiHttp>) -> Self {
        self.http = http;
        self
    }

    pub(super) fn http(&self) -> &dyn XaiHttp {
        self.http.as_ref()
    }

    pub fn login_from_grok(&self) -> Result<CredentialSnapshot, AuthError> {
        let session = import_oauth_from_grok(&self.grok_auth_path)?;
        let _lock = self.store.lock()?;
        self.store.save(&session)?;
        Ok(session.into_snapshot())
    }

    pub(super) fn login_with_browser(
        &self,
        stderr: &mut dyn Write,
        open_browser: &dyn Fn(&str),
    ) -> Result<CredentialSnapshot, AuthError> {
        let session = run_loopback_flow(self.http.as_ref(), stderr, open_browser)?;
        let _lock = self.store.lock()?;
        self.store.save(&session)?;
        Ok(session.into_snapshot())
    }
}

impl Auth for AuthClient {
    fn subscription(&self) -> Subscription {
        Subscription::SuperGrok
    }

    fn snapshot(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        Ok(self.store.load()?.map(OAuthSession::into_snapshot))
    }

    fn login(&self) -> Result<CredentialSnapshot, AuthError> {
        self.login_with_browser(&mut io::stderr(), &|url| {
            let _ = webbrowser::open(url);
        })
    }

    fn logout(&self) -> Result<(), AuthError> {
        let _lock = self.store.lock()?;
        self.store.clear()
    }

    fn refresh_if_needed(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        let Some(current) = self.store.load()? else {
            return Ok(None);
        };
        if current.is_fresh(Utc::now()) {
            return Ok(Some(current.into_snapshot()));
        }
        if current.refresh_token.is_none() {
            return Err(AuthError::NeedLogin);
        }
        let _lock = self.store.lock()?;
        let Some(latest) = self.store.load()? else {
            return Err(AuthError::NeedLogin);
        };
        if latest.is_fresh(Utc::now()) {
            return Ok(Some(latest.into_snapshot()));
        }
        let Some(refresh) = latest.refresh_token.as_deref() else {
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
            refresh_token: grant.refresh_token.or(latest.refresh_token),
            expires_at: grant.expires_at,
            email: grant.email.or(latest.email),
            subject: if grant.subject.is_empty() {
                latest.subject
            } else {
                grant.subject
            },
            issuer: latest.issuer,
            client_id: latest.client_id,
        };
        self.store.save(&new)?;
        Ok(Some(new.into_snapshot()))
    }
}

#[cfg(test)]
#[path = "client_tests.rs"]
mod tests;
