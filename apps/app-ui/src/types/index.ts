export type ExecutionMode = 'structured' | 'vision' | 'hybrid';
export type RuntimeStatus = 'offline' | 'starting' | 'online' | 'error';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'requires_confirmation' | 'skipped';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  steps?: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  title: string;
  description?: string;
  tool?: string;
  action?: string;
  status: StepStatus;
  startedAt?: string;
  endedAt?: string;
  output?: unknown;
  risk?: 'low' | 'medium' | 'high';
}

export interface TaskRequest {
  prompt: string;
  auto_execute: boolean;
  execution_mode: ExecutionMode;
  confirm_risky?: boolean;
  attachments?: string[];
}

export interface TaskResponse {
  task_id: string;
  status: StepStatus | 'success' | 'failed';
  summary: string;
  steps: ExecutionStep[];
  artifacts?: Record<string, string>;
}

export interface RuntimeHealth {
  ok: boolean;
  status: RuntimeStatus;
  version?: string;
  base_url?: string;
  message?: string;
}

export interface AppSettings {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  executionMode: ExecutionMode;
  autoExecute: boolean;
  requireConfirmation: boolean;
}

export interface SystemInfo {
  os: string;
  os_display?: string;
  arch: string;
  user: string;
  computer: string;
  current_dir: string;
}

export interface TaskContext {
  currentApp: string;
  currentWindow: string;
  currentMode: string;
  lastScreenshot?: string;
  commandOutput?: string;
  permissionStatus: Array<{ name: string; value: string; level: 'ok' | 'warn' | 'error' }>;
}
