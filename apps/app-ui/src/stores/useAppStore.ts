import { create } from 'zustand';
import type { AppSettings, ChatMessage, ExecutionMode, RuntimeStatus, SystemInfo, TaskContext } from '../types';

interface AppState {
  activePage: string;
  runtimeStatus: RuntimeStatus;
  systemInfo?: SystemInfo;
  settings: AppSettings;
  messages: ChatMessage[];
  taskContext: TaskContext;
  setActivePage: (page: string) => void;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  setSystemInfo: (info: SystemInfo) => void;
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
  apiKey: '',
  executionMode: 'structured',
  autoExecute: false,
  requireConfirmation: true,
};

const defaultContext: TaskContext = {
  currentApp: '-',
  currentWindow: '-',
  currentMode: 'structured',
  permissionStatus: [
    { name: '文件访问', value: '已授权', level: 'ok' },
    { name: '命令执行', value: '已授权', level: 'ok' },
    { name: '浏览器控制', value: '需确认', level: 'warn' },
  ],
};

export const useAppStore = create<AppState>((set) => ({
  activePage: 'chat',
  runtimeStatus: 'offline',
  systemInfo: undefined,
  settings: defaultSettings,
  messages: [],
  taskContext: defaultContext,
  setActivePage: (page) => set({ activePage: page }),
  setRuntimeStatus: (status) => set({ runtimeStatus: status }),
  setSystemInfo: (info) => set({ systemInfo: info }),
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
