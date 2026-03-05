import { getInitials, classNames } from '@/lib/utils.js';

interface AvatarProps {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps): JSX.Element {
  const initials = getInitials(firstName, lastName);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={classNames('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={classNames(
        'flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700',
        sizeStyles[size],
        className,
      )}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}
