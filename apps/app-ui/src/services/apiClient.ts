import { invoke } from '@tauri-apps/api/core';
import type { RuntimeHealth, TaskRequest, TaskResponse } from '../types';

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
  if (command === 'send_task') {
    const payload = args?.payload as TaskRequest | undefined;
    return {
      task_id: `mock-${Date.now()}`,
      status: 'success',
      summary: payload?.prompt ? `\u5df2\u5b8c\u6210: ${payload.prompt}` : '\u5df2\u5b8c\u6210\u4efb\u52a1',
      steps: [
        { id: 's1', title: '\u89e3\u6790\u7528\u6237\u6307\u4ee4', status: 'success', tool: 'planner', action: 'plan', output: { prompt: payload?.prompt } },
        { id: 's2', title: '\u6267\u884c\u672c\u5730\u5de5\u5177', status: 'success', tool: 'mock', action: 'run' },
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
  getSystemInfo: () => tauriInvoke<Record<string, unknown>>('get_system_info'),
};
