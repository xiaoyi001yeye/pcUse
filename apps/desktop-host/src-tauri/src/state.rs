use std::sync::Mutex;
use tokio::process::Child;

pub struct RuntimeState {
    pub child: Mutex<Option<Child>>,
    pub base_url: String,
}

impl Default for RuntimeState {
    fn default() -> Self {
        let host = std::env::var("PC_USE_AGENT_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = std::env::var("PC_USE_AGENT_PORT").unwrap_or_else(|_| "8765".to_string());
        Self {
            child: Mutex::new(None),
            base_url: format!("http://{}:{}", host, port),
        }
    }
}
