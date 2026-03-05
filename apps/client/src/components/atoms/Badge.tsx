import type { ReactNode } from 'react';
import { classNames } from '@/lib/utils.js';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  neutral: 'bg-secondary-100 text-secondary-700',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps): JSX.Element {
  return (
    <span className={classNames('badge', variantStyles[variant], className)}>
      {children}
    </span>
  );
}
