import { Bot, FolderOpen, Globe, HelpCircle, History, KeyRound, MessageCircle, Settings, ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const navItems = [
  { id: 'chat', label: '\u5bf9\u8bdd', icon: MessageCircle },
  { id: 'tasks', label: '\u4efb\u52a1\u4e2d\u5fc3', icon: TerminalSquare },
  { id: 'history', label: '\u5386\u53f2\u8bb0\u5f55', icon: History },
  { id: 'tools', label: '\u5de5\u5177\u7ba1\u7406', icon: Wrench },
  { id: 'permissions', label: '\u6743\u9650\u4e0e\u5b89\u5168', icon: ShieldCheck },
  { id: 'settings', label: '\u8bbe\u7f6e', icon: Settings },
  { id: 'help', label: '\u5e2e\u52a9\u4e0e\u53cd\u9988', icon: HelpCircle },
];

const quickTools = [
  { label: '\u6253\u5f00\u6587\u4ef6', icon: FolderOpen },
  { label: '\u8fd0\u884c\u547d\u4ee4', icon: TerminalSquare },
  { label: '\u6253\u5f00\u7f51\u9875', icon: Globe },
  { label: 'API Key', icon: KeyRound },
];

export function Sidebar() {
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);

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
        <h4>\u5feb\u6377\u5de5\u5177</h4>
        {quickTools.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="quick-tool">
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="machine-card">
        <span className="dot" />
        <strong>\u5728\u7ebf</strong>
        <p>Windows 11 Pro</p>
        <p>\u672c\u5730\u6a21\u5f0f</p>
        <p>\u7528\u6237 Administrator</p>
      </div>
    </aside>
  );
}
