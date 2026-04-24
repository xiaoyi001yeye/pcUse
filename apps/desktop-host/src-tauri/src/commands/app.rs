use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Manager, State};
use tokio::process::Command;
use tokio::time::timeout;

use crate::state::RuntimeState;

#[derive(Debug, Serialize, Deserialize)]
pub struct RuntimeHealth {
    pub ok: bool,
    pub status: String,
    pub version: Option<String>,
    pub base_url: Option<String>,
    pub message: Option<String>,
}

fn runtime_dir(app: &AppHandle) -> PathBuf {
    if let Ok(dir) = std::env::var("PC_USE_AGENT_RUNTIME_DIR") {
        return PathBuf::from(dir);
    }
    if cfg!(debug_assertions) {
        return PathBuf::from("../../../agent-runtime");
    }
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| std::env::current_dir().unwrap_or_default())
        .join("agent-runtime")
}

fn runtime_settings(app: &AppHandle) -> Option<Value> {
    let path = app.path().app_config_dir().ok()?.join("settings.json");
    let text = fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

fn apply_runtime_settings(command: &mut Command, settings: Option<&Value>) {
    let Some(settings) = settings else {
        return;
    };

    if let Some(api_key) = settings.get("apiKey").and_then(Value::as_str) {
        if !api_key.trim().is_empty() {
            command.env("OPENAI_API_KEY", api_key);
        }
    }
    if let Some(base_url) = settings.get("baseUrl").and_then(Value::as_str) {
        if !base_url.trim().is_empty() {
            command.env("OPENAI_BASE_URL", base_url);
        }
    }
    if let Some(model) = settings.get("model").and_then(Value::as_str) {
        if !model.trim().is_empty() {
            command.env("OPENAI_MODEL", model);
        }
    }
}

fn runtime_executable(app: &AppHandle) -> Option<PathBuf> {
    if let Ok(exe) = std::env::var("PC_USE_AGENT_RUNTIME_EXE") {
        let path = PathBuf::from(exe);
        if path.exists() {
            return Some(path);
        }
    }

    let resource_dir = app.path().resource_dir().ok();
    let current_exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));

    let mut candidates = Vec::new();
    let names = runtime_candidate_names();
    if let Some(dir) = resource_dir {
        for name in &names {
            candidates.push(dir.join(name));
            candidates.push(dir.join("bin").join(name));
        }
    }
    if let Some(dir) = current_exe_dir {
        for name in &names {
            candidates.push(dir.join(name));
        }
    }

    candidates.into_iter().find(|candidate| candidate.exists())
}

fn runtime_candidate_names() -> Vec<&'static str> {
    let mut names = Vec::new();

    #[cfg(target_os = "windows")]
    {
        names.push("pc-use-agent-runtime.exe");
        names.push("pc-use-agent-runtime-x86_64-pc-windows-msvc.exe");
    }

    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    {
        names.push("pc-use-agent-runtime-aarch64-apple-darwin");
    }

    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    {
        names.push("pc-use-agent-runtime-x86_64-apple-darwin");
    }

    #[cfg(target_os = "macos")]
    {
        names.push("pc-use-agent-runtime");
    }

    names
}

async fn probe_runtime(base_url: &str) -> Result<RuntimeHealth, String> {
    let url = format!("{}/health", base_url);
    let client = reqwest::Client::new();
    match timeout(Duration::from_secs(2), client.get(&url).send()).await {
        Ok(Ok(response)) if response.status().is_success() => {
            let body: Value = response.json().await.map_err(|err| err.to_string())?;
            Ok(RuntimeHealth {
                ok: true,
                status: "online".into(),
                version: body
                    .get("version")
                    .and_then(Value::as_str)
                    .map(str::to_string),
                base_url: Some(base_url.to_string()),
                message: None,
            })
        }
        _ => Ok(RuntimeHealth {
            ok: false,
            status: "offline".into(),
            version: None,
            base_url: Some(base_url.to_string()),
            message: Some("runtime is not reachable".into()),
        }),
    }
}

#[tauri::command]
pub async fn runtime_health(state: State<'_, RuntimeState>) -> Result<RuntimeHealth, String> {
    probe_runtime(&state.base_url).await
}

#[tauri::command]
pub async fn start_runtime(
    app: AppHandle,
    state: State<'_, RuntimeState>,
) -> Result<RuntimeHealth, String> {
    let health = probe_runtime(&state.base_url).await?;
    if health.ok {
        return Ok(health);
    }

    let dir = runtime_dir(&app);
    let mut command = if let Some(runtime_exe) = runtime_executable(&app) {
        Command::new(runtime_exe)
    } else {
        let python = std::env::var("PC_USE_AGENT_PYTHON").unwrap_or_else(|_| "python".into());
        let mut command = Command::new(python);
        command
            .arg("-m")
            .arg("agent_runtime.server")
            .current_dir(dir);
        command
    };

    let settings = runtime_settings(&app);
    apply_runtime_settings(&mut command, settings.as_ref());

    let child = command
        .env("PC_USE_AGENT_HOST", "127.0.0.1")
        .env("PC_USE_AGENT_PORT", "8765")
        .spawn()
        .map_err(|err| format!("failed to start runtime: {err}"))?;

    {
        let mut guard = state
            .child
            .lock()
            .map_err(|_| "runtime lock poisoned".to_string())?;
        *guard = Some(child);
    }

    tokio::time::sleep(Duration::from_millis(800)).await;
    probe_runtime(&state.base_url).await
}

#[tauri::command]
pub async fn stop_runtime(state: State<'_, RuntimeState>) -> Result<Value, String> {
    let child = {
        let mut guard = state
            .child
            .lock()
            .map_err(|_| "runtime lock poisoned".to_string())?;
        guard.take()
    };
    if let Some(mut child) = child {
        child.kill().await.map_err(|err| err.to_string())?;
    }
    Ok(json!({ "ok": true }))
}

#[tauri::command]
pub async fn send_task(state: State<'_, RuntimeState>, payload: Value) -> Result<Value, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/task", state.base_url);
    let response = client
        .post(url)
        .json(&payload)
        .send()
        .await
        .map_err(|err| format!("failed to call runtime: {err}"))?;
    let status = response.status();
    let body = response.text().await.map_err(|err| err.to_string())?;
    if !status.is_success() {
        return Err(format!("runtime returned {status}: {body}"));
    }
    serde_json::from_str::<Value>(&body).map_err(|err| format!("invalid runtime response: {err}"))
}
