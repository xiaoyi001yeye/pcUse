mod commands;
mod state;

use state::RuntimeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(RuntimeState::default())
        .invoke_handler(tauri::generate_handler![
            commands::app::runtime_health,
            commands::app::start_runtime,
            commands::app::stop_runtime,
            commands::app::send_task,
            commands::settings::read_settings,
            commands::settings::write_settings,
            commands::system::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running PC-Use Agent");
}
