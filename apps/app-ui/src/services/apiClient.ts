import { invoke } from '@tauri-apps/api/core';
import type { AppSettings, RuntimeHealth, SystemInfo, TaskRequest, TaskResponse } from '../types';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    return invoke<T>(command, args);
  }
  return mockInvoke<T>(command, args);
}

async function mockInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (command === 'runtime_health') {
    return { ok: true, status: 'online', version: '0.2.0-dev', base_url: 'mock://runtime' } as T;
  }
  if (command === 'get_system_info') {
    return {
      os: navigator.platform.toLowerCase().includes('mac') ? 'macos' : 'browser',
      os_display: navigator.platform.toLowerCase().includes('mac') ? 'macOS' : navigator.platform,
      arch: navigator.userAgent.includes('arm') ? 'aarch64' : 'unknown',
      user: 'Local User',
      computer: 'Local Machine',
      current_dir: '',
    } as T;
  }
  if (command === 'read_settings') {
    return {
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      executionMode: 'structured',
      autoExecute: false,
      requireConfirmation: true,
    } as T;
  }
  if (command === 'write_settings') {
    return { ok: true } as T;
  }
  if (command === 'send_task') {
    const payload = args?.payload as TaskRequest | undefined;
    return {
      task_id: `mock-${Date.now()}`,
      status: 'success',
      summary: payload?.prompt ? `已完成: ${payload.prompt}` : '已完成任务',
      steps: [
        { id: 's1', title: '解析用户指令', status: 'success', tool: 'planner', action: 'plan', output: { prompt: payload?.prompt } },
        { id: 's2', title: '执行本地工具', status: 'success', tool: 'mock', action: 'run' },
      ],
    } as T;
  }
  if (command === 'start_runtime') {
    return { ok: true, status: 'online', version: '0.2.0-dev' } as T;
  }
  throw new Error(`Mock command not implemented: ${command}`);
}

export const apiClient = {
  health: () => tauriInvoke<RuntimeHealth>('runtime_health'),
  startRuntime: () => tauriInvoke<RuntimeHealth>('start_runtime'),
  stopRuntime: () => tauriInvoke<{ ok: boolean }>('stop_runtime'),
  sendTask: (payload: TaskRequest) => tauriInvoke<TaskResponse>('send_task', { payload }),
  readSettings: () => tauriInvoke<AppSettings>('read_settings'),
  writeSettings: (settings: AppSettings) => tauriInvoke<{ ok: boolean }>('write_settings', { settings }),
  getSystemInfo: () => tauriInvoke<SystemInfo>('get_system_info'),
};
