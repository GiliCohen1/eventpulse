import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.js';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
      {icon && <div className="text-secondary-400">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-secondary-500">{description}</p>}
      </div>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-12 w-12 text-error-500" />
      <div>
        <h3 className="text-lg font-semibold text-secondary-900">Error</h3>
        <p className="mt-1 text-sm text-secondary-500">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
