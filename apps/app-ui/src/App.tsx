import { useEffect } from 'react';
import { Bot } from 'lucide-react';
import { apiClient } from './services/apiClient';
import { useAppStore } from './stores/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { TaskCenterPage } from './pages/TaskCenterPage';
import { HistoryPage } from './pages/HistoryPage';
import { ToolManagerPage } from './pages/ToolManagerPage';
import { PermissionPage } from './pages/PermissionPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

export default function App() {
  const activePage = useAppStore((state) => state.activePage);
  const runtimeStatus = useAppStore((state) => state.runtimeStatus);
  const setRuntimeStatus = useAppStore((state) => state.setRuntimeStatus);
  const setSystemInfo = useAppStore((state) => state.setSystemInfo);
  const updateSettings = useAppStore((state) => state.updateSettings);

  useEffect(() => {
    let cancelled = false;

    async function ensureRuntime() {
      try {
        const health = await apiClient.health();
        if (cancelled) return;
        if (health.ok) {
          setRuntimeStatus('online');
          return;
        }
        setRuntimeStatus('starting');
        const started = await apiClient.startRuntime();
        if (!cancelled) setRuntimeStatus(started.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setRuntimeStatus('error');
      }
    }

    void ensureRuntime();
    void apiClient.getSystemInfo().then((info) => {
      if (!cancelled) setSystemInfo(info);
    }).catch(() => undefined);
    void apiClient.readSettings().then((settings) => {
      if (!cancelled) updateSettings(settings);
    }).catch(() => undefined);
    const timer = window.setInterval(() => {
      void apiClient.health().then((health) => {
        if (!cancelled) setRuntimeStatus(health.ok ? 'online' : 'offline');
      }).catch(() => {
        if (!cancelled) setRuntimeStatus('offline');
      });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [setRuntimeStatus, setSystemInfo, updateSettings]);

  return (
    <div className="app-shell">
      <header className="window-header">
        <div className="brand-mini">
          <Bot size={22} />
          <strong>PC-Use Agent</strong>
          <span>v0.2.0 本地模式</span>
        </div>
        <div className={`status-pill status-${runtimeStatus}`}>
          <span className="dot" />
          {runtimeStatus === 'online' ? '本机运行中' : runtimeStatus === 'starting' ? '启动 Runtime 中' : runtimeStatus}
        </div>
      </header>
      <main className="main-layout">
        <Sidebar />
        <section className="content-area">
          {activePage === 'chat' && <ChatPage />}
          {activePage === 'tasks' && <TaskCenterPage />}
          {activePage === 'history' && <HistoryPage />}
          {activePage === 'tools' && <ToolManagerPage />}
          {activePage === 'permissions' && <PermissionPage />}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'help' && <HelpPage />}
        </section>
      </main>
    </div>
  );
}
