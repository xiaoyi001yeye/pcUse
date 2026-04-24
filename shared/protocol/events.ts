export type RuntimeEventType = 'task_started' | 'step_started' | 'step_completed' | 'task_completed' | 'task_failed';

export interface RuntimeEvent {
  type: RuntimeEventType;
  task_id: string;
  step_id?: string;
  payload?: unknown;
  created_at: string;
}
