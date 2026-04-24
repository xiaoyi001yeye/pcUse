use serde_json::{json, Value};
use std::fs;
use tauri::{AppHandle, Manager};

fn settings_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|err| err.to_string())?;
    fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    Ok(dir.join("settings.json"))
}

#[tauri::command]
pub fn read_settings(app: AppHandle) -> Result<Value, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(json!({
            "provider": "OpenAI",
            "model": "gpt-4o-mini",
            "baseUrl": "https://api.openai.com/v1",
            "executionMode": "structured",
            "autoExecute": false,
            "requireConfirmation": true
        }));
    }
    let text = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&text).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn write_settings(app: AppHandle, settings: Value) -> Result<Value, String> {
    let path = settings_path(&app)?;
    let text = serde_json::to_string_pretty(&settings).map_err(|err| err.to_string())?;
    fs::write(path, text).map_err(|err| err.to_string())?;
    Ok(json!({ "ok": true }))
}
