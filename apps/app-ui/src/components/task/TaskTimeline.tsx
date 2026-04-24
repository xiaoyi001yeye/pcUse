import type { ExecutionStep } from '../../types';
import { StepCard } from './StepCard';

export function TaskTimeline({ steps }: { steps: ExecutionStep[] }) {
  return <div className="step-list">{steps.map((step, index) => <StepCard key={step.id} step={step} index={index + 1} />)}</div>;
}
