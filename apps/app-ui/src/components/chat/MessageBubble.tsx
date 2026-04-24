import type { ChatMessage } from '../../types';
import { StepCard } from '../task/StepCard';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  return (
    <div className={`message-row ${message.role}`}>
      <div className="message-bubble">
        <div className="message-meta">
          <strong>{message.role === 'user' ? '\u6211' : 'PC-Use Agent'}</strong>
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <p>{message.content}</p>
        {message.steps && message.steps.length > 0 && (
          <div className="step-list">
            {message.steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
