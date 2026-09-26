use serde_json::{Value, json};
use ureq::Error as UreqError;

use crate::host::ports::auth::AuthError;

const HTTP_TIMEOUT_SECS: u64 = 30;

pub(crate) trait FormPoster: Send + Sync {
    fn post_form(&self, url: &str, fields: &[(&str, &str)]) -> Result<(u16, Value), AuthError>;
}

pub(crate) struct UreqPoster;

impl FormPoster for UreqPoster {
    fn post_form(&self, url: &str, fields: &[(&str, &str)]) -> Result<(u16, Value), AuthError> {
        let identity = client_identity();
        let request = ureq::post(url)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .set("Accept", "application/json")
            .set("User-Agent", &identity)
            .timeout(std::time::Duration::from_secs(HTTP_TIMEOUT_SECS));
        match request.send_form(fields) {
            Ok(resp) => {
                let status = resp.status();
                let body = read_json(resp);
                Ok((status, body))
            }
            Err(UreqError::Status(status, resp)) => {
                let body = read_json(resp);
                Ok((status, body))
            }
            Err(e) => Err(AuthError::msg(format!("HTTP request failed: {url}: {e}"))),
        }
    }
}

fn read_json(resp: ureq::Response) -> Value {
    resp.into_json().unwrap_or_else(|_| json!({}))
}

fn client_identity() -> String {
    format!("rhc/{}", env!("CARGO_PKG_VERSION"))
}
