use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::{Duration, Instant};

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use chrono::{Duration as ChronoDuration, Utc};
use serde_json::Value;
use sha2::{Digest, Sha256};

use super::http::FormPoster;
use super::provider::XAI;
use super::session::{DEFAULT_EXPIRES_IN_SECS, OAuthSession, claims_from_jwt};
use crate::host::ports::auth::AuthError;

const CALLBACK_TIMEOUT: Duration = Duration::from_secs(600);

pub(crate) struct Pkce {
    pub code_verifier: String,
    pub code_challenge: String,
}

pub(crate) struct TokenGrant {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: chrono::DateTime<Utc>,
    pub email: Option<String>,
    pub subject: String,
}

pub(crate) fn run_loopback_flow(
    http: &dyn FormPoster,
    stderr: &mut dyn Write,
    open_browser: &dyn Fn(&str),
) -> Result<OAuthSession, AuthError> {
    let listener = TcpListener::bind(("127.0.0.1", 0))?;
    let port = listener.local_addr()?.port();
    let redirect_uri = format!("http://127.0.0.1:{port}/callback");
    let pkce = generate_pkce()?;
    let state = random_token()?;
    let nonce = random_token()?;
    let url = authorize_url(&redirect_uri, &pkce, &state, &nonce);
    writeln!(stderr, "{url}")?;
    let grant = thread::scope(|scope| {
        let waiter =
            scope.spawn(|| accept_callback(listener, &state, Instant::now() + CALLBACK_TIMEOUT));
        open_browser(&url);
        let code = waiter
            .join()
            .map_err(|_| AuthError::msg("login waiter panicked"))??;
        exchange_code(http, &code, &redirect_uri, &pkce.code_verifier)
    })?;
    Ok(session_from_grant(grant))
}

pub(crate) fn authorize_url(redirect_uri: &str, pkce: &Pkce, state: &str, nonce: &str) -> String {
    format!(
        "{}?response_type=code&client_id={}&redirect_uri={}&scope={}\
         &code_challenge={}&code_challenge_method=S256&state={}&nonce={}&referrer={}",
        XAI.authorize_url,
        percent_encode(XAI.client_id),
        percent_encode(redirect_uri),
        percent_encode(XAI.scopes),
        percent_encode(&pkce.code_challenge),
        percent_encode(state),
        percent_encode(nonce),
        percent_encode(XAI.referrer),
    )
}

pub(crate) fn refresh_grant(
    http: &dyn FormPoster,
    refresh_token: &str,
) -> Result<TokenGrant, AuthError> {
    let (status, data) = http.post_form(
        XAI.token_url,
        &[
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh_token),
            ("client_id", XAI.client_id),
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

pub(crate) fn exchange_code(
    http: &dyn FormPoster,
    code: &str,
    redirect_uri: &str,
    code_verifier: &str,
) -> Result<TokenGrant, AuthError> {
    let (status, data) = http.post_form(
        XAI.token_url,
        &[
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", redirect_uri),
            ("client_id", XAI.client_id),
            ("code_verifier", code_verifier),
        ],
    )?;
    if status != 200 {
        return Err(AuthError::msg(error_message(
            &data,
            status,
            "token exchange failed",
        )));
    }
    grant_from_token_payload(&data)
}

pub(crate) fn generate_pkce() -> Result<Pkce, AuthError> {
    let code_verifier = random_token()?;
    let code_challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(code_verifier.as_bytes()));
    Ok(Pkce {
        code_verifier,
        code_challenge,
    })
}

fn random_token() -> Result<String, AuthError> {
    let mut bytes = [0u8; 32];
    getrandom::fill(&mut bytes).map_err(|e| AuthError::msg(format!("random failed: {e}")))?;
    Ok(URL_SAFE_NO_PAD.encode(bytes))
}

fn accept_callback(
    listener: TcpListener,
    expected_state: &str,
    deadline: Instant,
) -> Result<String, AuthError> {
    listener.set_nonblocking(true)?;
    loop {
        if Instant::now() >= deadline {
            return Err(AuthError::msg("login timed out waiting for the browser"));
        }
        match listener.accept() {
            Ok((mut stream, _)) => {
                stream.set_nonblocking(false)?;
                stream.set_read_timeout(Some(Duration::from_secs(10)))?;
                let mut buf = [0u8; 8192];
                let n = stream.read(&mut buf).unwrap_or(0);
                let req = String::from_utf8_lossy(&buf[..n]);
                let first = req.lines().next().unwrap_or("");
                if !first.contains(" /callback") {
                    let _ = write_html(&mut stream, "404 Not Found", "not the login callback");
                    continue;
                }
                match code_from_request_line(first, expected_state) {
                    Ok(code) => {
                        let _ =
                            write_html(&mut stream, "200 OK", "Signed in. You can close this tab.");
                        return Ok(code);
                    }
                    Err(e) => {
                        let _ = write_html(&mut stream, "400 Bad Request", "Login did not finish.");
                        return Err(e);
                    }
                }
            }
            Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                thread::sleep(Duration::from_millis(20));
            }
            Err(e) => return Err(e.into()),
        }
    }
}

pub(crate) fn code_from_request_line(
    line: &str,
    expected_state: &str,
) -> Result<String, AuthError> {
    let target = line
        .split_whitespace()
        .nth(1)
        .ok_or_else(|| AuthError::msg("callback request missing target"))?;
    let query = target.split_once('?').map(|(_, q)| q).unwrap_or("");
    if let Some(err) = query_param(query, "error") {
        if err == "access_denied" {
            return Err(AuthError::msg("authorization denied"));
        }
        return Err(AuthError::msg(format!("authorization failed: {err}")));
    }
    let state = query_param(query, "state").unwrap_or_default();
    if state != expected_state {
        return Err(AuthError::msg("login state did not match"));
    }
    query_param(query, "code")
        .filter(|s| !s.is_empty())
        .ok_or_else(|| AuthError::msg("callback missing code"))
}

pub(crate) fn query_param(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        let (k, v) = pair.split_once('=').unwrap_or((pair, ""));
        if percent_decode(k) == key {
            return Some(percent_decode(v));
        }
    }
    None
}

fn session_from_grant(grant: TokenGrant) -> OAuthSession {
    OAuthSession {
        access_token: grant.access_token,
        refresh_token: grant.refresh_token,
        expires_at: grant.expires_at,
        email: grant.email,
        subject: grant.subject,
        issuer: XAI.issuer.to_string(),
        client_id: XAI.client_id.to_string(),
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

fn as_u64(value: Option<&Value>, name: &str) -> Result<u64, AuthError> {
    match value {
        Some(Value::Number(n)) => n
            .as_u64()
            .or_else(|| n.as_f64().map(|f| f as u64))
            .ok_or_else(|| AuthError::msg(format!("invalid {name}"))),
        _ => Err(AuthError::msg(format!("invalid {name}"))),
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

fn write_html(stream: &mut TcpStream, status: &str, body: &str) -> std::io::Result<()> {
    let bytes = body.as_bytes();
    let header = format!(
        "HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        bytes.len()
    );
    stream.write_all(header.as_bytes())?;
    stream.write_all(bytes)?;
    Ok(())
}

fn percent_encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char);
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

fn percent_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%'
            && i + 2 < bytes.len()
            && let Ok(v) = u8::from_str_radix(&s[i + 1..i + 3], 16)
        {
            out.push(v);
            i += 3;
            continue;
        }
        if bytes[i] == b'+' {
            out.push(b' ');
        } else {
            out.push(bytes[i]);
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

#[cfg(test)]
#[path = "oidc_tests.rs"]
mod tests;
