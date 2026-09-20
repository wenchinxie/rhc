use std::collections::BTreeMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::constants::{CLIENT_ID, FRESHNESS_SKEW_SECS, ISSUER};
use super::error::AuthError;
use super::headers::proxy_header_map;

#[derive(Debug, Clone)]
pub enum Session {
    LoggedOut,
    OAuth(OAuthSession),
}

impl Session {
    pub fn proxy_headers(&self) -> Result<BTreeMap<String, String>, AuthError> {
        match self {
            Self::LoggedOut => Err(AuthError::NeedLogin),
            Self::OAuth(s) => Ok(s.proxy_headers()),
        }
    }

    pub fn identity(&self) -> Option<Identity> {
        match self {
            Self::LoggedOut => None,
            Self::OAuth(s) => Some(s.identity()),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Identity {
    pub subject: String,
    pub email: Option<String>,
    pub issuer: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthSession {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub subject: String,
    pub email: Option<String>,
    #[serde(default = "default_issuer")]
    pub issuer: String,
    #[serde(default = "default_client_id")]
    pub client_id: String,
}

fn default_issuer() -> String {
    ISSUER.to_string()
}

fn default_client_id() -> String {
    CLIENT_ID.to_string()
}

impl OAuthSession {
    pub fn proxy_headers(&self) -> BTreeMap<String, String> {
        proxy_header_map(&self.access_token)
    }

    pub fn identity(&self) -> Identity {
        Identity {
            subject: self.subject.clone(),
            email: self.email.clone(),
            issuer: self.issuer.clone(),
        }
    }

    pub fn is_fresh(&self, now: DateTime<Utc>) -> bool {
        self.expires_at > now + chrono::Duration::seconds(FRESHNESS_SKEW_SECS)
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
