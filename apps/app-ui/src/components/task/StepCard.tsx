import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import type { ExecutionStep } from '../../types';

function StepIcon({ status }: { status: ExecutionStep['status'] }) {
  if (status === 'success') return <CheckCircle2 className="ok" size={18} />;
  if (status === 'failed') return <XCircle className="error" size={18} />;
  if (status === 'requires_confirmation') return <AlertTriangle className="warn" size={18} />;
  return <CircleDashed className="muted" size={18} />;
}

export function StepCard({ step, index }: { step: ExecutionStep; index: number }) {
  return (
    <article className="step-card">
      <div className="step-header">
        <StepIcon status={step.status} />
        <strong>Step {index} · {step.title}</strong>
        <span className={`step-status ${step.status}`}>{step.status}</span>
      </div>
      {step.description && <p>{step.description}</p>}
      {(step.tool || step.action) && <p className="muted-text">{step.tool} / {step.action}</p>}
      {step.output !== undefined && (
        <pre className="output-box">{typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}</pre>
      )}
    </article>
  );
}
