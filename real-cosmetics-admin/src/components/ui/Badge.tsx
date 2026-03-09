import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'bg-black text-white hover:bg-gray-800': variant === 'default',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'text-gray-950 border border-gray-200': variant === 'outline',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
}
