import { apiClient } from './apiClient';
import type { TaskRequest } from '../types';

export function runTask(request: TaskRequest) {
  return apiClient.sendTask(request);
}
