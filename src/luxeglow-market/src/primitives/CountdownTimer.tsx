import React, { useState, useEffect } from 'react';
import { cn } from './Button';

interface CountdownTimerProps {
  targetDate: Date;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
  variant?: 'boxed' | 'minimal';
}

export const CountdownTimer = ({ targetDate, size = 'md', className, label, variant = 'boxed' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft as { h: number; m: number; s: number };
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const pad = (n: number) => (n < 10 ? `0${n}` : n);

  const sizes = {
    sm: 'text-xs p-1',
    md: 'text-sm p-2',
    lg: 'text-lg p-3',
    xl: 'text-xl p-4',
  };

  const minimalSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  if (!timeLeft.h && !timeLeft.m && !timeLeft.s) {
    return <span className="text-red-500 font-bold">Ended</span>;
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('font-mono font-bold tabular-nums tracking-widest', minimalSizes[size], className)}>
        {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className="text-xs uppercase font-bold tracking-wider text-red-500 animate-pulse">{label}</span>}
      <div className="flex gap-1 font-mono font-bold text-white">
        <div className={cn('bg-secondary rounded flex flex-col items-center justify-center min-w-[2.5em]', sizes[size])}>
          <span>{pad(timeLeft.h)}</span>
          <span className="text-[0.5em] opacity-60 font-sans font-normal uppercase">Hrs</span>
        </div>
        <span className="text-secondary self-start py-1">:</span>
        <div className={cn('bg-secondary rounded flex flex-col items-center justify-center min-w-[2.5em]', sizes[size])}>
          <span>{pad(timeLeft.m)}</span>
          <span className="text-[0.5em] opacity-60 font-sans font-normal uppercase">Min</span>
        </div>
        <span className="text-secondary self-start py-1">:</span>
        <div className={cn('bg-primary rounded flex flex-col items-center justify-center min-w-[2.5em]', sizes[size])}>
          <span>{pad(timeLeft.s)}</span>
          <span className="text-[0.5em] opacity-60 font-sans font-normal uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
};
