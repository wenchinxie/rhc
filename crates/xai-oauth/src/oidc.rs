use std::io::Write;
use std::time::{Duration, Instant};

use chrono::{Duration as ChronoDuration, Utc};
use serde_json::Value;

use crate::constants::{
    CLIENT_ID, DEFAULT_EXPIRES_IN_SECS, DEFAULT_POLL_INTERVAL_SECS, DEVICE_CODE_URL,
    DEVICE_GRANT_TYPE, ISSUER, REFERRER, SCOPES, SLOW_DOWN_INCREMENT_SECS, TOKEN_URL,
};
use crate::error::AuthError;
use crate::http::FormPoster;
use crate::session::{OAuthSession, claims_from_jwt};

pub(crate) struct TokenGrant {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: chrono::DateTime<Utc>,
    pub email: Option<String>,
    pub subject: String,
}

pub(crate) fn run_device_code_flow(
    http: &dyn FormPoster,
    sleep: &dyn Fn(Duration),
    stderr: &mut dyn Write,
) -> Result<OAuthSession, AuthError> {
    let device = request_device_code(http)?;
    if let Some(complete) = device.verification_uri_complete.as_deref() {
        writeln!(stderr, "{complete}").map_err(AuthError::from)?;
    } else {
        writeln!(stderr, "{}", device.verification_uri).map_err(AuthError::from)?;
    }
    writeln!(stderr, "{}", device.user_code).map_err(AuthError::from)?;
    let grant = poll_token(http, &device, sleep)?;
    Ok(session_from_grant(grant))
}

pub(crate) fn refresh_grant(
    http: &dyn FormPoster,
    refresh_token: &str,
) -> Result<TokenGrant, AuthError> {
    let (status, data) = http.post_form(
        TOKEN_URL,
        &[
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh_token),
            ("client_id", CLIENT_ID),
        ],
    )?;
    if data.get("error").and_then(Value::as_str) == Some("invalid_grant") {
        return Err(AuthError::RefreshRevoked);
    }
    if status != 200 {
        return Err(AuthError::msg(error_message(
            &data,
            status,
            "refresh failed",
        )));
    }
    grant_from_token_payload(&data)
}

struct DevicePending {
    device_code: String,
    user_code: String,
    verification_uri: String,
    verification_uri_complete: Option<String>,
    interval: u64,
    expires_in: u64,
}

fn request_device_code(http: &dyn FormPoster) -> Result<DevicePending, AuthError> {
    let (status, data) = http.post_form(
        DEVICE_CODE_URL,
        &[
            ("client_id", CLIENT_ID),
            ("scope", SCOPES),
            ("referrer", REFERRER),
        ],
    )?;
    if status != 200 {
        return Err(AuthError::msg(error_message(
            &data,
            status,
            "device code request failed",
        )));
    }
    let device_code = require_str(&data, "device_code")?;
    let user_code = require_str(&data, "user_code")?;
    if !user_code
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-')
    {
        return Err(AuthError::msg("server returned invalid user_code"));
    }
    let verification_uri = require_str(&data, "verification_uri")?;
    validate_verification_uri(&verification_uri)?;
    let complete = match data.get("verification_uri_complete") {
        None | Some(Value::Null) => None,
        Some(Value::String(s)) if !s.is_empty() => {
            validate_verification_uri(s)?;
            Some(s.clone())
        }
        _ => return Err(AuthError::msg("invalid verification_uri_complete")),
    };
    let expires_in = as_u64(data.get("expires_in"), "expires_in")?;
    let interval = match data.get("interval") {
        None | Some(Value::Null) => DEFAULT_POLL_INTERVAL_SECS,
        Some(v) => as_u64(Some(v), "interval")?,
    };
    Ok(DevicePending {
        device_code,
        user_code,
        verification_uri,
        verification_uri_complete: complete,
        interval,
        expires_in,
    })
}

fn poll_token(
    http: &dyn FormPoster,
    device: &DevicePending,
    sleep: &dyn Fn(Duration),
) -> Result<TokenGrant, AuthError> {
    let mut poll_interval = Duration::from_secs(device.interval);
    let deadline = Instant::now() + Duration::from_secs(device.expires_in);
    loop {
        sleep(poll_interval);
        if Instant::now() >= deadline {
            return Err(AuthError::msg("device code expired"));
        }
        let (status, data) = http.post_form(
            TOKEN_URL,
            &[
                ("grant_type", DEVICE_GRANT_TYPE),
                ("device_code", &device.device_code),
                ("client_id", CLIENT_ID),
            ],
        )?;
        if status == 200 {
            return grant_from_token_payload(&data);
        }
        let error = data.get("error").and_then(Value::as_str);
        match error {
            Some("authorization_pending") => {}
            Some("slow_down") => {
                poll_interval += Duration::from_secs(SLOW_DOWN_INCREMENT_SECS);
            }
            Some("access_denied") => return Err(AuthError::DeviceCodeDenied),
            Some("expired_token") => return Err(AuthError::msg("device code expired")),
            _ => {
                return Err(AuthError::msg(error_message(
                    &data,
                    status,
                    "token poll failed",
                )));
            }
        }
    }
}

fn session_from_grant(grant: TokenGrant) -> OAuthSession {
    OAuthSession {
        access_token: grant.access_token,
        refresh_token: grant.refresh_token,
        expires_at: grant.expires_at,
        email: grant.email,
        subject: grant.subject,
        issuer: ISSUER.to_string(),
        client_id: CLIENT_ID.to_string(),
    }
}

fn grant_from_token_payload(data: &Value) -> Result<TokenGrant, AuthError> {
    let access = data
        .get("access_token")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| AuthError::msg("token response missing access_token"))?
        .to_string();
    let refresh = data
        .get("refresh_token")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_string);
    let seconds = match data.get("expires_in") {
        None | Some(Value::Null) => DEFAULT_EXPIRES_IN_SECS,
        Some(v) => as_u64(Some(v), "expires_in")? as i64,
    };
    let expires_at = Utc::now() + ChronoDuration::seconds(seconds);
    let id_token = data.get("id_token").and_then(Value::as_str);
    let mut claims = id_token.map(claims_from_jwt).unwrap_or_default();
    if claims.is_empty() {
        claims = claims_from_jwt(&access);
    }
    let subject = claims
        .get("sub")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();
    let email = claims
        .get("email")
        .and_then(Value::as_str)
        .map(str::to_string);
    Ok(TokenGrant {
        access_token: access,
        refresh_token: refresh,
        expires_at,
        email,
        subject,
    })
}

fn require_str(data: &Value, key: &str) -> Result<String, AuthError> {
    data.get(key)
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .ok_or_else(|| AuthError::msg(format!("device code response missing {key}")))
}

fn as_u64(value: Option<&Value>, name: &str) -> Result<u64, AuthError> {
    match value {
        Some(Value::Number(n)) => n
            .as_u64()
            .or_else(|| n.as_f64().map(|f| f as u64))
            .ok_or_else(|| AuthError::msg(format!("invalid {name}"))),
        _ => Err(AuthError::msg(format!("invalid {name}"))),
    }
}

fn validate_verification_uri(uri: &str) -> Result<(), AuthError> {
    if uri.chars().any(|c| (c as u32) < 32) {
        return Err(AuthError::msg("invalid verification_uri"));
    }
    let https = uri.starts_with("https://");
    let http_loopback = uri.starts_with("http://127.0.0.1") || uri.starts_with("http://localhost");
    if https || http_loopback {
        Ok(())
    } else {
        Err(AuthError::msg("unsupported verification_uri scheme"))
    }
}

fn error_message(data: &Value, status: u16, fallback: &str) -> String {
    data.get("error_description")
        .or_else(|| data.get("error"))
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .unwrap_or_else(|| format!("{fallback} (HTTP {status})"))
}

#[cfg(test)]
#[path = "oidc_tests.rs"]
mod tests;
