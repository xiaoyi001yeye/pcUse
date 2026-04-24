export interface SharedTaskRequest {
  prompt: string;
  auto_execute: boolean;
  execution_mode: 'structured' | 'vision' | 'hybrid';
  confirm_risky?: boolean;
  attachments?: string[];
}
