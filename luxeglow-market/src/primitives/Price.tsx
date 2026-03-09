import React from 'react';
import { cn } from './Button';

interface PriceProps {
  current: number;
  original?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Price = ({ current, original, currency = '$', size = 'md', className }: PriceProps) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const format = (val: number) => `${currency}${val.toFixed(2)}`;
  const discount = original ? Math.round(((original - current) / original) * 100) : 0;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-secondary font-display', sizes[size])}>
        {format(current)}
      </span>
      {original && (
        <>
          <span className="text-gray-400 line-through text-sm decoration-gray-400/60">
            {format(original)}
          </span>
          <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
};
