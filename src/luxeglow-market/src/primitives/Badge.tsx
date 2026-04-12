import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'sale' | 'new' | 'limited';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    sale: 'bg-red-100 text-red-600 font-bold animate-pulse',
    new: 'bg-blue-100 text-blue-600 font-semibold',
    limited: 'bg-amber-100 text-amber-700 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
