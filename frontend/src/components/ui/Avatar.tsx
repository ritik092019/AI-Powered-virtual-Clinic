import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  roleBadge?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  roleBadge,
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (n[0] || 'A').toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden font-bold bg-teal-100 text-teal-800 border border-teal-200/80 shadow-2xs select-none',
          sizes[size],
          className
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {roleBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 text-[9px] font-extrabold bg-teal-800 text-white rounded-full border border-white">
          {roleBadge}
        </span>
      )}
    </div>
  );
};
