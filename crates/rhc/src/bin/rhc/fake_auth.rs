use std::sync::Mutex;

use rhc::ports::auth::{Auth, AuthError, CredentialSnapshot, Identity, Subscription};

pub struct FakeAuth {
    identity: Mutex<Option<Identity>>,
}

impl FakeAuth {
    pub fn new() -> Self {
        Self {
            identity: Mutex::new(None),
        }
    }

    pub fn signed_in(email: &str) -> Self {
        let auth = Self::new();
        *auth.identity.lock().unwrap() = Some(Identity {
            subject: "sub".to_string(),
            email: Some(email.to_string()),
            issuer: "https://issuer.example".to_string(),
        });
        auth
    }
}

impl Auth for FakeAuth {
    fn subscription(&self) -> Subscription {
        Subscription::SuperGrok
    }

    fn snapshot(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        Ok(self
            .identity
            .lock()
            .unwrap()
            .clone()
            .map(|identity| CredentialSnapshot {
                token: "tok".to_string(),
                identity,
            }))
    }

    fn login(&self) -> Result<CredentialSnapshot, AuthError> {
        let identity = Identity {
            subject: "sub".to_string(),
            email: Some("logged-in@x.ai".to_string()),
            issuer: "https://issuer.example".to_string(),
        };
        *self.identity.lock().unwrap() = Some(identity.clone());
        Ok(CredentialSnapshot {
            token: "tok".to_string(),
            identity,
        })
    }

    fn logout(&self) -> Result<(), AuthError> {
        *self.identity.lock().unwrap() = None;
        Ok(())
    }

    fn refresh_if_needed(&self) -> Result<Option<CredentialSnapshot>, AuthError> {
        self.snapshot()
    }
}
