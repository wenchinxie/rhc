use std::path::Path;

use chrono::{Duration, TimeZone, Utc};
use serde_json::Value;

use super::session::{DEFAULT_EXPIRES_IN_SECS, OAuthSession, claims_from_jwt};
use super::xai_client::{CLIENT_ID, ISSUER};
use crate::host::ports::auth::AuthError;

const GROK_SCOPE_KEY: &str = "https://auth.x.ai::b1a00492-073a-47ea-816f-4c329264a828";

pub(crate) fn import_oauth_from_grok(auth_path: &Path) -> Result<OAuthSession, AuthError> {
    let raw = std::fs::read_to_string(auth_path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AuthError::msg(format!("grok auth file not found: {}", auth_path.display()))
        } else {
            AuthError::msg(format!(
                "cannot read grok auth file: {}",
                auth_path.display()
            ))
        }
    })?;
    let data: Value = serde_json::from_str(&raw)
        .map_err(|_| AuthError::msg(format!("corrupt grok auth file: {}", auth_path.display())))?;
    let obj = data.as_object().ok_or_else(|| {
        AuthError::msg(format!("corrupt grok auth file: {}", auth_path.display()))
    })?;
    let entry = obj
        .get(GROK_SCOPE_KEY)
        .and_then(Value::as_object)
        .ok_or_else(|| AuthError::msg(format!("no grok OAuth entry for {GROK_SCOPE_KEY}")))?;
    let access = entry
        .get("key")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| AuthError::msg("grok OAuth entry missing key"))?
        .to_string();
    let mut email = entry
        .get("email")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_string);
    let mut subject = entry
        .get("user_id")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .unwrap_or("")
        .to_string();
    let claims = claims_from_jwt(&access);
    if subject.is_empty() {
        subject = claims
            .get("sub")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();
    }
    if subject.is_empty() {
        return Err(AuthError::msg("grok OAuth entry missing user_id"));
    }
    if email.is_none() {
        email = claims
            .get("email")
            .and_then(Value::as_str)
            .map(str::to_string);
    }
    let expires_at = expires_from_grok(entry, &claims)?;
    Ok(OAuthSession {
        access_token: access,
        refresh_token: None,
        expires_at,
        subject,
        email,
        issuer: ISSUER.to_string(),
        client_id: CLIENT_ID.to_string(),
    })
}

fn expires_from_grok(
    entry: &serde_json::Map<String, Value>,
    claims: &serde_json::Map<String, Value>,
) -> Result<chrono::DateTime<Utc>, AuthError> {
    if let Some(raw) = entry
        .get("expires_at")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
    {
        return chrono::DateTime::parse_from_rfc3339(raw)
            .map(|d| d.with_timezone(&Utc))
            .map_err(|e| AuthError::msg(format!("invalid expires_at: {e}")));
    }
    if let Some(exp) = claims.get("exp").and_then(Value::as_i64) {
        return Utc
            .timestamp_opt(exp, 0)
            .single()
            .ok_or_else(|| AuthError::msg("invalid exp claim"));
    }
    Ok(Utc::now() + Duration::seconds(DEFAULT_EXPIRES_IN_SECS))
}

#[cfg(test)]
#[path = "grok_import_tests.rs"]
mod tests;
