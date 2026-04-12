import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ExpandableActionTone = 'danger' | 'ink';

const TONE_CLASS: Record<ExpandableActionTone, string> = {
  danger: 'border border-white bg-white text-fg hover:border-danger hover:bg-danger hover:text-white',
  ink: 'border border-white bg-white text-fg hover:border-ink hover:bg-ink hover:text-white'
};

type ExpandableActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  icon?: ReactNode;
  tone?: ExpandableActionTone;
};

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="20" r="1.7" />
      <circle cx="17" cy="20" r="1.7" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 1.95 1.58h8.58a2 2 0 0 0 1.94-1.52L22 8H7.2" />
    </svg>
  );
}

function OptionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h10" />
      <path d="M4 17h16" />
      <path d="M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M8 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function getDefaultIcon(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('cart')) {
    return <CartIcon />;
  }

  if (normalizedLabel.includes('option')) {
    return <OptionsIcon />;
  }

  return <ArrowIcon />;
}

export function ExpandableActionButton({
  label,
  icon,
  tone = 'danger',
  className,
  type = 'button',
  ...props
}: ExpandableActionButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'group/button relative inline-flex h-[45px] min-w-[168px] items-center justify-center overflow-hidden rounded-full px-5 shadow-elevation-04 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50',
        TONE_CLASS[tone],
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover/button:opacity-100">
        {icon ?? getDefaultIcon(label)}
      </span>
      <span className="pointer-events-none text-sm font-semibold transition-opacity duration-200 group-hover/button:opacity-0">
        {label}
      </span>
    </button>
  );
}
