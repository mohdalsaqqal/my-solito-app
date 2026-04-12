import type { ButtonHTMLAttributes } from 'react';
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { Icon, type IconSize } from './Icon';

type IconButtonTone = 'soft' | 'ghost' | 'solid';
type IconButtonSize = 'md' | 'lg';

const BUTTON_SIZE_CLASS: Record<IconButtonSize, string> = {
  md: 'h-11 w-11',
  lg: 'h-12 w-12'
};

const DEFAULT_ICON_SIZE_BY_BUTTON_SIZE: Record<IconButtonSize, IconSize> = {
  md: 'md',
  lg: 'lg'
};

const BUTTON_TONE_CLASS: Record<IconButtonTone, { idle: string; active: string }> = {
  soft: {
    idle: 'border-fg/25 bg-surface text-fg hover:bg-brand/10 hover:border-brand/45',
    active: 'border-brand bg-brand text-brand-contrast hover:bg-brand-strong hover:border-brand-strong'
  },
  ghost: {
    idle: 'border-transparent bg-transparent text-fg hover:bg-brand/10 hover:text-brand',
    active: 'border-brand/45 bg-brand/10 text-brand hover:bg-brand/15'
  },
  solid: {
    idle: 'border-brand bg-brand text-brand-contrast hover:bg-brand-strong hover:border-brand-strong',
    active: 'border-brand-strong bg-brand-strong text-brand-contrast hover:bg-brand hover:border-brand'
  }
};

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: PhosphorIcon;
  label: string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  active?: boolean;
  iconSize?: IconSize;
  weight?: IconWeight;
};

export function IconButton({
  icon,
  label,
  size = 'md',
  tone = 'soft',
  active = false,
  iconSize,
  weight,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  const stateClass = active ? BUTTON_TONE_CLASS[tone].active : BUTTON_TONE_CLASS[tone].idle;
  const resolvedWeight = weight ?? (active ? 'fill' : 'regular');
  const resolvedIconSize = iconSize ?? DEFAULT_ICON_SIZE_BY_BUTTON_SIZE[size];

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid min-h-11 min-w-11 place-items-center rounded-full border shadow-elevation-02 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_SIZE_CLASS[size],
        stateClass,
        className
      )}
      {...props}
    >
      <Icon icon={icon} size={resolvedIconSize} weight={resolvedWeight} decorative />
    </button>
  );
}
