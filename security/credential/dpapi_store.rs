// Placeholder for Windows DPAPI credential storage.
// MVP recommendation: store API keys via Windows Credential Manager or DPAPI, not plaintext JSON.

pub struct DpapiStore;

impl DpapiStore {
    pub fn is_available() -> bool {
        cfg!(target_os = "windows")
    }
}
