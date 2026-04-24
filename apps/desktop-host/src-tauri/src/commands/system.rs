use serde_json::{json, Value};
use std::process::Command;

#[tauri::command]
pub fn get_system_info() -> Result<Value, String> {
    let os = std::env::consts::OS;
    let computer = host_name();

    Ok(json!({
        "os": os,
        "os_display": os_display(os),
        "arch": std::env::consts::ARCH,
        "user": std::env::var("USERNAME").or_else(|_| std::env::var("USER")).unwrap_or_default(),
        "computer": computer,
        "current_dir": std::env::current_dir().map(|p| p.display().to_string()).unwrap_or_default()
    }))
}

fn os_display(os: &str) -> &'static str {
    match os {
        "macos" => "macOS",
        "windows" => "Windows",
        "linux" => "Linux",
        _ => "Unknown OS",
    }
}

fn host_name() -> String {
    if let Ok(name) = std::env::var("COMPUTERNAME") {
        if !name.trim().is_empty() {
            return name;
        }
    }

    if let Ok(name) = std::env::var("HOSTNAME") {
        if !name.trim().is_empty() {
            return name;
        }
    }

    #[cfg(target_os = "macos")]
    if let Some(name) = command_output("scutil", &["--get", "ComputerName"]) {
        return name;
    }

    command_output("hostname", &[]).unwrap_or_default()
}

fn command_output(program: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(program).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    (!text.is_empty()).then_some(text)
}
