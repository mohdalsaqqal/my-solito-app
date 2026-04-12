import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import {
  type UiButtonSize,
  type UiButtonVariant,
  uiButtonSizeClass,
  uiButtonVariantClass,
} from '../design/variantMaps';

type UiButtonProps = {
  children: ReactNode;
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
};

export function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconCart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="20" r="1.7" />
      <circle cx="17" cy="20" r="1.7" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 1.95 1.58h8.58a2 2 0 0 0 1.94-1.52L22 8H7.2" />
    </svg>
  );
}

export function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 20s-7-4.3-7-10a4.1 4.1 0 0 1 7-2.7A4.1 4.1 0 0 1 19 10c0 5.7-7 10-7 10Z" />
    </svg>
  );
}

export function IconCompare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M7 7h10" />
      <path d="m13 3 4 4-4 4" />
      <path d="M17 17H7" />
      <path d="m11 13-4 4 4 4" />
    </svg>
  );
}

export function IconThumbUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 11V5.7A2.7 2.7 0 0 1 11.7 3l.9 5H19a2 2 0 0 1 2 2l-1.1 6.1a2 2 0 0 1-2 1.7H9V11Z" />
      <path d="M5 10h3v8H5z" />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function UiButton({
  children,
  variant = 'solid',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  onClick
}: UiButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'inline-flex w-max flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold uppercase tracking-token-12 transition',
        uiButtonVariantClass[variant],
        uiButtonSizeClass[size],
        className
      )}
    >
      {leftIcon ? <span className="shrink-0 leading-none">{leftIcon}</span> : null}
      <span className="leading-none">{children}</span>
      {rightIcon ? <span className="shrink-0 leading-none">{rightIcon}</span> : null}
    </button>
  );
}

export function ShopNowLink({ className }: { className?: string }) {
  return (
    <button type="button" className={cn('text-xl font-medium uppercase text-fg underline underline-offset-8', className)}>
      Shop Now
    </button>
  );
}

export function LikeToggle({ liked, onClick, className }: { liked: boolean; onClick?: () => void; className?: string }) {
  return (
    <UiButton
      variant={liked ? 'solid' : 'soft'}
      size="md"
      leftIcon={<IconThumbUp />}
      className={cn('min-w-action', className)}
      onClick={onClick}
    >
      {liked ? 'Liked' : 'Like'}
    </UiButton>
  );
}

export function StatusBadges({ showNew = true, showSale = true }: { showNew?: boolean; showSale?: boolean }) {
  return (
    <div className="inline-flex flex-col items-start gap-1">
      {showNew ? <span className="rounded bg-mint px-2 py-1 text-token-micro font-semibold uppercase tracking-token-12 text-white">New</span> : null}
      {showSale ? <span className="rounded bg-sun px-2 py-1 text-token-micro font-semibold uppercase tracking-token-12 text-fg">Sale</span> : null}
    </div>
  );
}

type ActionItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function ProductActionRail({ items, className }: { items: ActionItem[]; className?: string }) {
  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          title={item.label}
          aria-label={item.label}
          onClick={item.onClick}
          className={cn(
            'grid h-9 w-9 place-items-center rounded-full border shadow-elevation-02 transition',
            item.active
              ? 'border-brand bg-brand text-brand-contrast hover:bg-brand-strong hover:border-brand-strong'
              : 'border-fg/25 bg-surface text-fg hover:bg-brand/10 hover:border-brand/45'
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Placeholder',
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn('flex h-9 items-center gap-2 rounded border border-stroke bg-surface px-3 text-muted', className)}>
      <IconSearch className="h-4 w-4" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-fg outline-none placeholder:text-muted/70"
      />
    </label>
  );
}

export function PaymentBadges({ className }: { className?: string }) {
  const items = [
    { label: 'AMEX', classes: 'bg-payment-amex text-white' },
    { label: 'MC', classes: 'bg-payment-mastercard text-white' },
    { label: 'VISA', classes: 'bg-payment-visa text-white' },
    { label: 'PAY', classes: 'bg-surface text-fg border border-stroke' }
  ];

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {items.map((item) => (
        <span key={item.label} className={cn('rounded px-2 py-1 text-token-micro font-semibold uppercase', item.classes)}>
          {item.label}
        </span>
      ))}
    </div>
  );
}
