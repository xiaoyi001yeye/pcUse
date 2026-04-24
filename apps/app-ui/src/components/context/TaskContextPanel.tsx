import { ClipboardList, Image, Monitor, ShieldCheck, TerminalSquare } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export function TaskContextPanel() {
  const context = useAppStore((state) => state.taskContext);

  return (
    <aside className="context-panel">
      <div className="panel-header">
        <h3>\u4efb\u52a1\u4e0a\u4e0b\u6587</h3>
      </div>
      <div className="context-card">
        <Monitor size={18} />
        <span>\u5f53\u524d\u5e94\u7528</span>
        <strong>{context.currentApp}</strong>
      </div>
      <div className="context-card">
        <ClipboardList size={18} />
        <span>\u5f53\u524d\u7a97\u53e3</span>
        <strong>{context.currentWindow}</strong>
      </div>
      <div className="context-card">
        <ShieldCheck size={18} />
        <span>\u5f53\u524d\u6a21\u5f0f</span>
        <strong>{context.currentMode}</strong>
      </div>
      <section className="panel-section">
        <h4><Image size={16} /> \u6700\u8fd1\u622a\u56fe\uff08\u53ef\u9009\uff09</h4>
        <div className="screenshot-placeholder">
          {context.lastScreenshot ? <img src={context.lastScreenshot} alt="latest screenshot" /> : <span>\u9ed8\u8ba4\u4e0d\u663e\u793a\u5b9e\u65f6\u5c4f\u5e55\uff0c\u4ec5\u5728\u8c03\u8bd5\u6216\u5931\u8d25\u65f6\u5c55\u5f00</span>}
        </div>
      </section>
      <section className="panel-section">
        <h4><TerminalSquare size={16} /> \u547d\u4ee4\u8f93\u51fa</h4>
        <pre className="small-output">{context.commandOutput || '\u6682\u65e0\u547d\u4ee4\u8f93\u51fa'}</pre>
      </section>
      <section className="panel-section">
        <h4>\u6743\u9650\u72b6\u6001</h4>
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
