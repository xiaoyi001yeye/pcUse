import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '../types';

export async function readSettings(): Promise<AppSettings> {
  return invoke<AppSettings>('read_settings');
}

export async function writeSettings(settings: AppSettings): Promise<{ ok: boolean }> {
  return invoke<{ ok: boolean }>('write_settings', { settings });
}
