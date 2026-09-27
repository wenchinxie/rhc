use chrono::{DateTime, Utc};
use serde_json::Value;

use crate::host::ports::auth::{CredentialSnapshot, Identity};

const FRESHNESS_SKEW_SECS: i64 = 30;
pub(super) const DEFAULT_EXPIRES_IN_SECS: i64 = 3600;

#[derive(Debug, Clone)]
pub struct OAuthSession {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub subject: String,
    pub email: Option<String>,
    pub issuer: String,
    pub client_id: String,
}

impl OAuthSession {
    pub fn is_fresh(&self, now: DateTime<Utc>) -> bool {
        self.expires_at > now + chrono::Duration::seconds(FRESHNESS_SKEW_SECS)
    }

    pub fn into_snapshot(self) -> CredentialSnapshot {
        CredentialSnapshot {
            token: self.access_token,
            identity: Identity {
                subject: self.subject,
                email: self.email,
                issuer: self.issuer,
            },
        }
    }
}

pub(crate) fn claims_from_jwt(token: &str) -> serde_json::Map<String, Value> {
    let Some(payload) = token.split('.').nth(1) else {
        return serde_json::Map::new();
    };
    let padded = match payload.len() % 4 {
        0 => payload.to_string(),
        2 => format!("{payload}=="),
        3 => format!("{payload}="),
        _ => return serde_json::Map::new(),
    };
    let Ok(raw) = base64::Engine::decode(&base64::engine::general_purpose::URL_SAFE, padded) else {
        return serde_json::Map::new();
    };
    match serde_json::from_slice::<Value>(&raw) {
        Ok(Value::Object(map)) => map,
        _ => serde_json::Map::new(),
    }
}
