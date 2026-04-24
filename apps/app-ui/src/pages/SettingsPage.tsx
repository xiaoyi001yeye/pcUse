import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, Save } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAppStore } from '../stores/useAppStore';
import type { AppSettings } from '../types';

const providerPresets = [
  {
    provider: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  {
    provider: 'OpenAI Compatible',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  {
    provider: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  {
    provider: 'Moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
  {
    provider: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
  },
  {
    provider: '火山引擎（OpenAI 协议）',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/coding/v3',
    model: 'doubao-seed-1-6',
  },
  {
    provider: '火山引擎（Anthropic 协议）',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/coding',
    model: 'doubao-seed-1-6',
  },
];

const modelOptions = [
  'ark-code-latest',
  'Doubao-Seed-2.0-Code',
  'Doubao-Seed-Code',
  'GLM-5.1',
  'MiniMax-M2.7',
  'Kimi-K2.6',
];

export function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [form, setForm] = useState<AppSettings>(settings);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const maskedKey = useMemo(() => {
    if (!form.apiKey) return '尚未配置';
    if (form.apiKey.length <= 8) return '已配置';
    return `${form.apiKey.slice(0, 4)}...${form.apiKey.slice(-4)}`;
  }, [form.apiKey]);

  function applyProvider(provider: string) {
    const preset = providerPresets.find((item) => item.provider === provider);
    if (!preset) return;
    setForm((current) => ({
      ...current,
      provider: preset.provider,
      baseUrl: preset.baseUrl,
      model: preset.model,
    }));
    setSaveState('idle');
  }

  const selectableModels = useMemo(() => {
    if (!form.model || modelOptions.includes(form.model)) {
      return modelOptions;
    }
    return [form.model, ...modelOptions];
  }, [form.model]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveState('saving');
    try {
      await apiClient.writeSettings(form);
      updateSettings(form);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }

  return (
    <div className="settings-page">
      <section className="settings-header">
        <div>
          <h1>模型接入</h1>
          <p>配置厂商、API Key、兼容端点和默认模型。API Key 会保存到本机应用配置中。</p>
        </div>
        <div className="settings-status">
          <KeyRound size={18} />
          <span>{maskedKey}</span>
        </div>
      </section>

      <form className="settings-form" onSubmit={onSubmit}>
        <label>
          <span>厂商</span>
          <select value={form.provider} onChange={(event) => applyProvider(event.target.value)}>
            {providerPresets.map((item) => (
              <option key={item.provider} value={item.provider}>{item.provider}</option>
            ))}
          </select>
        </label>

        <label>
          <span>API Key</span>
          <input
            type="password"
            value={form.apiKey}
            autoComplete="off"
            placeholder="粘贴你的 API Key"
            onChange={(event) => {
              setForm((current) => ({ ...current, apiKey: event.target.value }));
              setSaveState('idle');
            }}
          />
        </label>

        <label>
          <span>Base URL</span>
          <input
            value={form.baseUrl}
            placeholder="https://api.openai.com/v1"
            onChange={(event) => {
              setForm((current) => ({ ...current, baseUrl: event.target.value }));
              setSaveState('idle');
            }}
          />
        </label>

        <label>
          <span>默认模型</span>
          <select
            value={form.model}
            onChange={(event) => {
              setForm((current) => ({ ...current, model: event.target.value }));
              setSaveState('idle');
            }}
          >
            {selectableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </label>

        <div className="settings-actions">
          <button type="submit" disabled={saveState === 'saving'}>
            {saveState === 'saved' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saveState === 'saving' ? '保存中' : saveState === 'saved' ? '已保存' : '保存配置'}
          </button>
          {saveState === 'error' && <span className="settings-error">保存失败，请检查本地配置权限。</span>}
        </div>
      </form>
    </div>
  );
}
