import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

export function useRuntimeHealth() {
  return useQuery({ queryKey: ['runtime-health'], queryFn: apiClient.health, refetchInterval: 5000 });
}
