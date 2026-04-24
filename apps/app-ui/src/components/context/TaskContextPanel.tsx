import { ClipboardList, Image, Monitor, ShieldCheck, TerminalSquare } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export function TaskContextPanel() {
  const context = useAppStore((state) => state.taskContext);

  return (
    <aside className="context-panel">
      <div className="panel-header">
        <h3>任务上下文</h3>
      </div>
      <div className="context-card">
        <Monitor size={18} />
        <span>当前应用</span>
        <strong>{context.currentApp}</strong>
      </div>
      <div className="context-card">
        <ClipboardList size={18} />
        <span>当前窗口</span>
        <strong>{context.currentWindow}</strong>
      </div>
      <div className="context-card">
        <ShieldCheck size={18} />
        <span>当前模式</span>
        <strong>{context.currentMode}</strong>
      </div>
      <section className="panel-section">
        <h4><Image size={16} /> 最近截图（可选）</h4>
        <div className="screenshot-placeholder">
          {context.lastScreenshot ? <img src={context.lastScreenshot} alt="latest screenshot" /> : <span>默认不显示实时屏幕，仅在调试或失败时展开</span>}
        </div>
      </section>
      <section className="panel-section">
        <h4><TerminalSquare size={16} /> 命令输出</h4>
        <pre className="small-output">{context.commandOutput || '暂无命令输出'}</pre>
      </section>
      <section className="panel-section">
        <h4>权限状态</h4>
        {context.permissionStatus.map((item) => (
          <div key={item.name} className="permission-row">
            <span>{item.name}</span>
            <strong className={item.level}>{item.value}</strong>
          </div>
        ))}
      </section>
    </aside>
  );
}
