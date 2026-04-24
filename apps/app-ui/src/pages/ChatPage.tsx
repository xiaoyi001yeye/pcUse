import { FormEvent, useMemo, useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAppStore } from '../stores/useAppStore';
import { createId } from '../utils/id';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TaskContextPanel } from '../components/context/TaskContextPanel';

export function ChatPage() {
  const [input, setInput] = useState('');
  const settings = useAppStore((state) => state.settings);
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const clearConversation = useAppStore((state) => state.clearConversation);

  const hasMessages = messages.length > 0;
  const placeholder = useMemo(
    () => '\u8f93\u5165\u4f60\u7684\u6307\u4ee4\uff0c\u4f8b\u5982\uff1a\u6253\u5f00\u8bb0\u4e8b\u672c\u3001\u8fd0\u884c ipconfig\u3001\u6253\u5f00\u6d4f\u89c8\u5668\u8bbf\u95ee\u767e\u5ea6',
    [],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    setInput('');
    addMessage({ id: createId('msg'), role: 'user', content: prompt, createdAt: new Date().toISOString() });
    const assistantId = createId('msg');
    addMessage({ id: assistantId, role: 'assistant', content: '\u6b63\u5728\u89e3\u6790\u5e76\u6267\u884c\u4efb\u52a1...', createdAt: new Date().toISOString() });
    try {
      const health = await apiClient.health();
      if (!health.ok) {
        useAppStore.getState().setRuntimeStatus('starting');
        const started = await apiClient.startRuntime();
        useAppStore.getState().setRuntimeStatus(started.ok ? 'online' : 'offline');
      }
      const result = await apiClient.sendTask({
        prompt,
        auto_execute: settings.autoExecute,
        execution_mode: settings.executionMode,
        confirm_risky: false,
      });
      useAppStore.getState().updateLastAssistant({ content: result.summary, steps: result.steps });
      const commandStep = result.steps.find((step) => step.tool === 'cmd' && step.output);
      useAppStore.getState().updateTaskContext({
        currentMode: settings.executionMode,
        commandOutput: commandStep ? JSON.stringify(commandStep.output, null, 2) : undefined,
      });
    } catch (error) {
      useAppStore.getState().updateLastAssistant({
        content: error instanceof Error ? error.message : '\u4efb\u52a1\u6267\u884c\u5931\u8d25',
      });
    }
  }

  return (
    <div className="chat-layout">
      <section className="chat-main">
        <div className="toolbar-card">
          <label>
            <span>\u5f53\u524d\u6a21\u578b</span>
            <select value={settings.model} onChange={(event) => updateSettings({ model: event.target.value })}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="openai-compatible">OpenAI Compatible</option>
            </select>
          </label>
          <label>
            <span>\u6267\u884c\u6a21\u5f0f</span>
            <select value={settings.executionMode} onChange={(event) => updateSettings({ executionMode: event.target.value as never })}>
              <option value="structured">\u7ed3\u6784\u5316\u4f18\u5148</option>
              <option value="hybrid">\u6df7\u5408\u6a21\u5f0f</option>
              <option value="vision">\u89c6\u89c9\u6a21\u5f0f</option>
            </select>
          </label>
          <label>
            <span>\u81ea\u52a8\u6267\u884c</span>
            <select value={settings.autoExecute ? 'on' : 'off'} onChange={(event) => updateSettings({ autoExecute: event.target.value === 'on' })}>
              <option value="off">\u5173\u95ed</option>
              <option value="on">\u5f00\u542f</option>
            </select>
          </label>
          <span className="safe-tag"><ShieldCheck size={16} /> \u672c\u673a\u8fd0\u884c</span>
        </div>
        <div className="conversation">
          {!hasMessages && (
            <div className="empty-state">
              <h2>\u4f60\u597d\uff0c\u6211\u662f PC-Use Agent</h2>
              <p>\u6211\u53ef\u4ee5\u5728\u672c\u673a\u4e0a\u6253\u5f00\u6587\u4ef6\u3001\u8fd0\u884c\u547d\u4ee4\u3001\u64cd\u4f5c\u6d4f\u89c8\u5668\uff0c\u9ad8\u98ce\u9669\u64cd\u4f5c\u4f1a\u5148\u5411\u4f60\u786e\u8ba4\u3002</p>
            </div>
          )}
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </div>
        <form className="chat-input" onSubmit={onSubmit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
          <button type="submit" aria-label="send"><Send size={18} /></button>
        </form>
        <div className="bottom-actions">
          <span>\u9ed8\u8ba4\u4e0d\u663e\u793a\u5b9e\u65f6\u5c4f\u5e55\u9884\u89c8\uff0c\u4ec5\u5728\u8c03\u8bd5\u6216\u89c6\u89c9\u6a21\u5f0f\u4e0b\u5c55\u5f00</span>
          <button className="danger">\u505c\u6b62\u4efb\u52a1</button>
          <button onClick={clearConversation} type="button">\u6e05\u7a7a\u5bf9\u8bdd</button>
          <button type="button">\u65b0\u5efa\u4efb\u52a1</button>
        </div>
      </section>
      <TaskContextPanel />
    </div>
  );
}
