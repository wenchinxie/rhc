use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;

use serde_json::Value;

use super::http::FormPoster;
use crate::host::ports::auth::AuthError;

type FormFields = Vec<(String, String)>;
type RouteQueue = VecDeque<(u16, Value)>;

pub struct ScriptedHttp {
    routes: Mutex<HashMap<String, RouteQueue>>,
    pub requests: Mutex<Vec<(String, FormFields)>>,
}

impl ScriptedHttp {
    pub fn new(routes: HashMap<String, Vec<(u16, Value)>>) -> Self {
        let mapped = routes
            .into_iter()
            .map(|(k, v)| (k, VecDeque::from(v)))
            .collect();
        Self {
            routes: Mutex::new(mapped),
            requests: Mutex::new(Vec::new()),
        }
    }
}

impl FormPoster for ScriptedHttp {
    fn post_form(&self, url: &str, fields: &[(&str, &str)]) -> Result<(u16, Value), AuthError> {
        self.requests.lock().expect("requests").push((
            url.to_string(),
            fields
                .iter()
                .map(|(k, v)| ((*k).to_string(), (*v).to_string()))
                .collect(),
        ));
        let mut routes = self.routes.lock().expect("routes");
        for (key, queue) in routes.iter_mut() {
            if url.contains(key) {
                let (status, body) = queue
                    .pop_front()
                    .unwrap_or_else(|| panic!("no more responses for {key}"));
                return Ok((status, body));
            }
        }
        panic!("no route for {url}");
    }
}
