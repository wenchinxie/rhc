use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use fs4::fs_std::FileExt;
use serde::Serialize;
use serde_json::Value;

use super::session::OAuthSession;
use super::xai_client::{CLIENT_ID, ISSUER};
use crate::host::ports::auth::AuthError;

const STORE_VERSION: u32 = 1;

#[derive(Serialize)]
struct StoreFile {
    version: u32,
    credential: CredentialWire,
}

#[derive(Serialize)]
struct CredentialWire {
    kind: String,
    access_token: String,
    refresh_token: Option<String>,
    expires_at: String,
    email: Option<String>,
    subject: String,
    issuer: String,
    client_id: String,
}

pub(crate) struct TokenStore {
    path: PathBuf,
}

pub(crate) struct AuthFileLock {
    _file: File,
}

impl TokenStore {
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn in_dir(rhc_home: &Path) -> Self {
        Self::new(rhc_home.join("auth.json"))
    }

    pub fn lock_path(&self) -> PathBuf {
        self.path.with_extension("json.lock")
    }

    pub fn load(&self) -> Result<Option<OAuthSession>, AuthError> {
        let raw = match fs::read_to_string(&self.path) {
            Ok(s) => s,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(e.into()),
        };
        if raw.trim().is_empty() {
            return Ok(None);
        }
        let data: Value = serde_json::from_str(&raw)
            .map_err(|e| AuthError::msg(format!("corrupt auth store: {e}")))?;
        session_from_wire(&data, &self.path).map(Some)
    }

    pub fn save(&self, session: &OAuthSession) -> Result<(), AuthError> {
        let parent = self
            .path
            .parent()
            .ok_or_else(|| AuthError::msg("auth path has no parent"))?;
        fs::create_dir_all(parent)?;
        fs::set_permissions(parent, fs::Permissions::from_mode(0o700))?;
        let payload = serde_json::to_vec_pretty(&to_wire(session))
            .map_err(|e| AuthError::msg(format!("serialize auth store: {e}")))?;
        let mut tmp = tempfile_in(parent)?;
        tmp.file.write_all(&payload)?;
        tmp.file.sync_all()?;
        fs::set_permissions(&tmp.path, fs::Permissions::from_mode(0o600))?;
        fs::rename(&tmp.path, &self.path)?;
        tmp.keep = true;
        if let Ok(dir) = File::open(parent) {
            let _ = dir.sync_all();
        }
        Ok(())
    }

    pub fn clear(&self) -> Result<(), AuthError> {
        match fs::remove_file(&self.path) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(e.into()),
        }
    }

    pub fn lock(&self) -> Result<AuthFileLock, AuthError> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)?;
            fs::set_permissions(parent, fs::Permissions::from_mode(0o700))?;
        }
        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .write(true)
            .truncate(false)
            .open(self.lock_path())?;
        file.lock_exclusive()?;
        Ok(AuthFileLock { _file: file })
    }
}

impl Drop for AuthFileLock {
    fn drop(&mut self) {
        let _ = FileExt::unlock(&self._file);
    }
}

struct Tmp {
    path: PathBuf,
    file: File,
    keep: bool,
}

impl Drop for Tmp {
    fn drop(&mut self) {
        if !self.keep {
            let _ = fs::remove_file(&self.path);
        }
    }
}

fn tempfile_in(parent: &Path) -> Result<Tmp, AuthError> {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let path = parent.join(format!(".auth.json.{nonce}.tmp"));
    let file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)?;
    Ok(Tmp {
        path,
        file,
        keep: false,
    })
}

fn to_wire(session: &OAuthSession) -> StoreFile {
    StoreFile {
        version: STORE_VERSION,
        credential: CredentialWire {
            kind: "oauth".into(),
            access_token: session.access_token.clone(),
            refresh_token: session.refresh_token.clone(),
            expires_at: session
                .expires_at
                .to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
            email: session.email.clone(),
            subject: session.subject.clone(),
            issuer: session.issuer.clone(),
            client_id: session.client_id.clone(),
        },
    }
}

fn session_from_wire(data: &Value, path: &Path) -> Result<OAuthSession, AuthError> {
    let obj = data
        .as_object()
        .ok_or_else(|| AuthError::msg(format!("corrupt auth store: {}", path.display())))?;
    let version = obj.get("version").and_then(Value::as_u64);
    if version != Some(STORE_VERSION as u64) {
        return Err(AuthError::msg(format!(
            "unsupported auth.json version: {:?}",
            obj.get("version")
        )));
    }
    let cred = obj
        .get("credential")
        .and_then(Value::as_object)
        .ok_or_else(|| {
            AuthError::msg(format!("auth.json missing credential: {}", path.display()))
        })?;
    if cred.get("kind").and_then(Value::as_str) != Some("oauth") {
        return Err(AuthError::msg(format!(
            "unsupported credential kind: {:?}",
            cred.get("kind")
        )));
    }
    let access = require_str(cred, "access_token", path)?;
    let subject = require_str(cred, "subject", path)?;
    let issuer = require_str(cred, "issuer", path).unwrap_or_else(|_| ISSUER.to_string());
    let client_id = require_str(cred, "client_id", path).unwrap_or_else(|_| CLIENT_ID.to_string());
    let expires_raw = require_str(cred, "expires_at", path)?;
    let expires_at = DateTime::parse_from_rfc3339(&expires_raw)
        .map_err(|e| AuthError::msg(format!("invalid expires_at: {e}")))?
        .with_timezone(&Utc);
    let refresh = opt_str(cred.get("refresh_token"));
    let email = opt_str(cred.get("email"));
    Ok(OAuthSession {
        access_token: access,
        refresh_token: refresh,
        expires_at,
        subject,
        email,
        issuer,
        client_id,
    })
}

fn require_str(
    cred: &serde_json::Map<String, Value>,
    key: &str,
    path: &Path,
) -> Result<String, AuthError> {
    match cred.get(key).and_then(Value::as_str) {
        Some(s) if !s.is_empty() => Ok(s.to_string()),
        _ => Err(AuthError::msg(format!(
            "auth.json missing {key}: {}",
            path.display()
        ))),
    }
}

fn opt_str(value: Option<&Value>) -> Option<String> {
    value
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

#[cfg(test)]
#[path = "store_tests.rs"]
mod tests;
