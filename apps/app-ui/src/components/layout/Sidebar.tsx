import { Bot, FolderOpen, Globe, HelpCircle, History, KeyRound, MessageCircle, Settings, ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const navItems = [
  { id: 'chat', label: '对话', icon: MessageCircle },
  { id: 'tasks', label: '任务中心', icon: TerminalSquare },
  { id: 'history', label: '历史记录', icon: History },
  { id: 'tools', label: '工具管理', icon: Wrench },
  { id: 'permissions', label: '权限与安全', icon: ShieldCheck },
  { id: 'settings', label: '设置', icon: Settings },
  { id: 'help', label: '帮助与反馈', icon: HelpCircle },
];

const quickTools = [
  { label: '打开文件', icon: FolderOpen },
  { label: '运行命令', icon: TerminalSquare },
  { label: '打开网页', icon: Globe },
  { label: 'API Key', icon: KeyRound },
];

export function Sidebar() {
  const activePage = useAppStore((state) => state.activePage);
  const runtimeStatus = useAppStore((state) => state.runtimeStatus);
  const systemInfo = useAppStore((state) => state.systemInfo);
  const setActivePage = useAppStore((state) => state.setActivePage);

  const osLabel = systemInfo?.os_display || systemInfo?.os || '检测中';
  const archLabel = systemInfo?.arch ? ` · ${systemInfo.arch}` : '';
  const userLabel = systemInfo?.user || '-';
  const computerLabel = systemInfo?.computer || '-';
  const isOnline = runtimeStatus === 'online';

  return (
    <aside className="sidebar">
      <div className="product-card">
        <div className="bot-avatar"><Bot size={28} /></div>
        <strong>PC-Use Agent</strong>
      </div>
      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={activePage === item.id ? 'active' : ''} onClick={() => setActivePage(item.id)}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-section">
        <h4>快捷工具</h4>
        {quickTools.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="quick-tool"
              onClick={() => {
                if (item.label === 'API Key') setActivePage('settings');
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="machine-card">
        <div className="machine-status">
          <span className={`dot ${isOnline ? '' : 'muted-dot'}`} />
          <strong>{isOnline ? '在线' : runtimeStatus === 'starting' ? '启动中' : '离线'}</strong>
        </div>
        <p>{osLabel}{archLabel}</p>
        <p>本地模式</p>
        <p>用户 {userLabel}</p>
        <p title={computerLabel}>设备 {computerLabel}</p>
      </div>
    </aside>
  );
}
