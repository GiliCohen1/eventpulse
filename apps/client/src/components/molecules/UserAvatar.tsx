import { Avatar } from '@/components/atoms/Avatar.js';
import type { IUserPublicProfile } from '@/types';

interface UserAvatarProps {
  user: Pick<IUserPublicProfile, 'firstName' | 'lastName' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ user, size = 'md', showName = false, className }: UserAvatarProps): JSX.Element {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Avatar
        src={user.avatarUrl}
        firstName={user.firstName}
        lastName={user.lastName}
        size={size}
      />
      {showName && (
        <span className="text-sm font-medium text-secondary-900">
          {user.firstName} {user.lastName}
        </span>
      )}
    </div>
  );
}
