use serde_json::{json, Value};

#[tauri::command]
pub fn get_system_info() -> Result<Value, String> {
    Ok(json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "user": std::env::var("USERNAME").or_else(|_| std::env::var("USER")).unwrap_or_default(),
        "computer": std::env::var("COMPUTERNAME").unwrap_or_default(),
        "current_dir": std::env::current_dir().map(|p| p.display().to_string()).unwrap_or_default()
    }))
}
