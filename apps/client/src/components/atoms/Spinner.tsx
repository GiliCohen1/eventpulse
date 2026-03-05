import { Loader2 } from 'lucide-react';
import { classNames } from '@/lib/utils.js';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps): JSX.Element {
  return (
    <Loader2
      className={classNames('animate-spin text-primary-600', sizeStyles[size], className)}
    />
  );
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps): JSX.Element {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-secondary-500">{message}</p>
    </div>
  );
}
