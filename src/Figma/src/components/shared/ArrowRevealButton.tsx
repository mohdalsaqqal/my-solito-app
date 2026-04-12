import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ArrowRevealButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
};

function ArrowRevealIcon() {
  return (
    <svg viewBox="0 0 13 10" className="h-[10px] w-[15px]" aria-hidden>
      <path d="M1 5h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline
        points="8 1 12 5 8 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRevealButton({
  label,
  className,
  type = 'button',
  ...props
}: ArrowRevealButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative inline-flex items-center gap-2 border-0 bg-transparent px-[18px] py-3 font-jost text-lg font-bold tracking-[0.05em] text-fg transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-95',
        className
      )}
      {...props}
    >
      <span className="absolute inset-y-0 left-0 w-[45px] rounded-full bg-brand/15 transition-all duration-300 group-hover:w-full" />
      <span className="relative">{label}</span>
      <span className="relative transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRevealIcon />
      </span>
    </button>
  );
}
