use serde_json::Value;

use super::client::AuthClient;
use super::provider::XAI;
use crate::host::ports::auth::{Auth, AuthError};
use crate::host::ports::models::{ModelEntry, ModelLister};

impl ModelLister for AuthClient {
    fn list(&self) -> Result<Option<Vec<ModelEntry>>, AuthError> {
        let Some(snapshot) = self.refresh_if_needed()? else {
            return Ok(None);
        };
        let url = format!("{}/models", XAI.api_base_url);
        let (status, body) = self.http().get_json(&url, &snapshot.token)?;
        if status != 200 {
            return Err(AuthError::msg(format!("model list failed (HTTP {status})")));
        }
        Ok(Some(parse_models(&body)))
    }
}

fn parse_models(body: &Value) -> Vec<ModelEntry> {
    body.get("data")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|row| row.get("id").and_then(Value::as_str))
        .map(|id| ModelEntry {
            id: id.to_string(),
            family: "xai".to_string(),
            name: id.to_string(),
        })
        .collect()
}

#[cfg(test)]
#[path = "model_list_tests.rs"]
mod tests;
