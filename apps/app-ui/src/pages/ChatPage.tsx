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
    () => '输入你的指令，例如：打开记事本、运行 ipconfig、打开浏览器访问百度',
    [],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    setInput('');
    addMessage({ id: createId('msg'), role: 'user', content: prompt, createdAt: new Date().toISOString() });
    const assistantId = createId('msg');
    addMessage({ id: assistantId, role: 'assistant', content: '正在解析并执行任务...', createdAt: new Date().toISOString() });
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
        content: error instanceof Error ? error.message : '任务执行失败',
      });
    }
  }

  return (
    <div className="chat-layout">
      <section className="chat-main">
        <div className="toolbar-card">
          <label>
            <span>当前模型</span>
            <select value={settings.model} onChange={(event) => updateSettings({ model: event.target.value })}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="openai-compatible">OpenAI Compatible</option>
            </select>
          </label>
          <label>
            <span>执行模式</span>
            <select value={settings.executionMode} onChange={(event) => updateSettings({ executionMode: event.target.value as never })}>
              <option value="structured">结构化优先</option>
              <option value="hybrid">混合模式</option>
              <option value="vision">视觉模式</option>
            </select>
          </label>
          <label>
            <span>自动执行</span>
            <select value={settings.autoExecute ? 'on' : 'off'} onChange={(event) => updateSettings({ autoExecute: event.target.value === 'on' })}>
              <option value="off">关闭</option>
              <option value="on">开启</option>
            </select>
          </label>
          <span className="safe-tag"><ShieldCheck size={16} /> 本机运行</span>
        </div>
        <div className="conversation">
          {!hasMessages && (
            <div className="empty-state">
              <h2>你好，我是 PC-Use Agent</h2>
              <p>我可以在本机上打开文件、运行命令、操作浏览器，高风险操作会先向你确认。</p>
            </div>
          )}
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </div>
        <form className="chat-input" onSubmit={onSubmit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
          <button type="submit" aria-label="send"><Send size={18} /></button>
        </form>
        <div className="bottom-actions">
          <span>默认不显示实时屏幕预览，仅在调试或视觉模式下展开</span>
          <button className="danger">停止任务</button>
          <button onClick={clearConversation} type="button">清空对话</button>
          <button type="button">新建任务</button>
        </div>
      </section>
      <TaskContextPanel />
    </div>
  );
}
