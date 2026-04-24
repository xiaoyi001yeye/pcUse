import { create } from 'zustand';
import type { AppSettings, ChatMessage, ExecutionMode, RuntimeStatus, TaskContext } from '../types';

interface AppState {
  activePage: string;
  runtimeStatus: RuntimeStatus;
  settings: AppSettings;
  messages: ChatMessage[];
  taskContext: TaskContext;
  setActivePage: (page: string) => void;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistant: (patch: Partial<ChatMessage>) => void;
  setExecutionMode: (mode: ExecutionMode) => void;
  updateTaskContext: (context: Partial<TaskContext>) => void;
  clearConversation: () => void;
}

const defaultSettings: AppSettings = {
  provider: 'OpenAI',
  model: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  executionMode: 'structured',
  autoExecute: false,
  requireConfirmation: true,
};

const defaultContext: TaskContext = {
  currentApp: '-',
  currentWindow: '-',
  currentMode: 'structured',
  permissionStatus: [
    { name: '\u6587\u4ef6\u8bbf\u95ee', value: '\u5df2\u6388\u6743', level: 'ok' },
    { name: '\u547d\u4ee4\u6267\u884c', value: '\u5df2\u6388\u6743', level: 'ok' },
    { name: '\u6d4f\u89c8\u5668\u63a7\u5236', value: '\u9700\u786e\u8ba4', level: 'warn' },
  ],
};

export const useAppStore = create<AppState>((set) => ({
  activePage: 'chat',
  runtimeStatus: 'offline',
  settings: defaultSettings,
  messages: [],
  taskContext: defaultContext,
  setActivePage: (page) => set({ activePage: page }),
  setRuntimeStatus: (status) => set({ runtimeStatus: status }),
  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastAssistant: (patch) =>
    set((state) => {
      const messages = [...state.messages];
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i].role === 'assistant') {
          messages[i] = { ...messages[i], ...patch };
          break;
        }
      }
      return { messages };
    }),
  setExecutionMode: (mode) =>
    set((state) => ({ settings: { ...state.settings, executionMode: mode }, taskContext: { ...state.taskContext, currentMode: mode } })),
  updateTaskContext: (context) => set((state) => ({ taskContext: { ...state.taskContext, ...context } })),
  clearConversation: () => set({ messages: [] }),
}));
