import type { Icon as PhosphorIcon, IconProps as PhosphorIconProps, IconWeight } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

const ICON_SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
} as const;

export type IconSize = keyof typeof ICON_SIZE_MAP | number;

export type IconProps = Omit<PhosphorIconProps, 'size' | 'weight' | 'color'> & {
  icon: PhosphorIcon;
  size?: IconSize;
  weight?: IconWeight;
  color?: string;
  decorative?: boolean;
};

function resolveSize(size: IconSize) {
  return typeof size === 'number' ? size : ICON_SIZE_MAP[size];
}

export function Icon({
  icon: Phosphor,
  size = 'md',
  weight = 'regular',
  color = 'currentColor',
  decorative = true,
  className,
  ...props
}: IconProps) {
  const accessibilityProps = decorative ? { 'aria-hidden': true, focusable: false } : undefined;

  return (
    <Phosphor
      size={resolveSize(size)}
      weight={weight}
      color={color}
      className={cn('shrink-0', className)}
      {...accessibilityProps}
      {...props}
    />
  );
}
