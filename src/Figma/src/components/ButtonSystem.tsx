import { cn } from '../lib/cn';
import { IconArrowRight, IconThumbUp } from './designSystem';
import { ArrowRevealButton, ExpandableActionButton } from './shared';

type ButtonTone = 'solid' | 'soft' | 'outline';
type ButtonSize = 'lg' | 'md' | 'sm';

function IconCartPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="20" r="1.55" />
      <circle cx="17" cy="20" r="1.55" />
      <path d="M3 4h2l2.15 10.1a2 2 0 0 0 1.95 1.6h8.6a2 2 0 0 0 1.92-1.45L22 8H7.2" />
      <path d="M18 2v5" />
      <path d="M15.5 4.5h5" />
    </svg>
  );
}

function SystemButton({ tone, size }: { tone: ButtonTone; size: ButtonSize }) {
  const toneClasses: Record<ButtonTone, string> = {
    solid: 'bg-brand text-brand-contrast border border-brand shadow-elevation-04 hover:bg-brand-strong hover:border-brand-strong',
    soft: 'bg-surface text-fg border border-fg/70 shadow-elevation-02 hover:bg-surface-soft hover:border-fg',
    outline: 'bg-transparent text-fg border border-stroke hover:bg-brand/10 hover:border-brand/45'
  };

  const sizeClasses: Record<ButtonSize, string> = {
    lg: 'h-14 px-8 text-base',
    md: 'h-12 px-6 text-base',
    sm: 'h-11 px-5 text-base'
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex w-[192px] flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-lg font-poppins font-semibold uppercase leading-5',
        toneClasses[tone],
        sizeClasses[size]
      )}
    >
      <IconCartPlus className="h-6 w-6 shrink-0" />
      <span className="leading-none">BUTTON</span>
      <IconArrowRight className="h-5 w-5 shrink-0" />
    </button>
  );
}

function LikeButton({ liked }: { liked: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-11 w-[117px] items-center justify-center gap-2 rounded-lg px-5 font-poppins text-base font-semibold uppercase',
        liked
          ? 'bg-brand text-brand-contrast border border-brand shadow-elevation-04 hover:bg-brand-strong hover:border-brand-strong'
          : 'bg-surface text-fg border border-fg/70 shadow-elevation-02 hover:bg-brand/10 hover:border-brand/45'
      )}
    >
      <IconThumbUp className="h-6 w-6" />
      <span>{liked ? 'LIKED' : 'LIKE'}</span>
    </button>
  );
}

export default function ButtonSystem() {
  return (
    <main className="min-h-screen overflow-auto bg-bg p-8">
      <div className="relative mx-auto h-[475px] w-[768px]">
        <section className="absolute left-[35px] top-[45px] h-[214px] w-[679px] rounded-[6px] border border-dashed border-accent p-2">
          <div className="grid grid-cols-3 gap-x-5 gap-y-6">
            <SystemButton tone="solid" size="lg" />
            <SystemButton tone="soft" size="lg" />
            <SystemButton tone="outline" size="lg" />

            <SystemButton tone="solid" size="md" />
            <SystemButton tone="soft" size="md" />
            <SystemButton tone="outline" size="md" />

            <SystemButton tone="solid" size="sm" />
            <SystemButton tone="soft" size="sm" />
            <SystemButton tone="outline" size="sm" />
          </div>
        </section>

        <section className="absolute left-[35px] top-[284px] h-[120px] w-[133px] rounded-[6px] border border-dashed border-accent p-2">
          <div className="space-y-8">
            <LikeButton liked={false} />
            <LikeButton liked />
          </div>
        </section>

        <button
          type="button"
          className="absolute left-[187px] top-[284px] inline-flex flex-col items-center gap-1 font-poppins text-[32px] font-medium uppercase leading-[20px] text-fg"
        >
          <span>SHOP NOW</span>
          <span className="h-px w-full bg-fg" />
        </button>

        <section className="absolute left-[360px] top-[284px] rounded-[6px] border border-dashed border-accent p-3">
          <div className="space-y-6">
            <ExpandableActionButton label="Add To Cart" />
            <ExpandableActionButton label="Choose Options" tone="ink" />
            <ArrowRevealButton label="Shop All" />
          </div>
        </section>
      </div>
    </main>
  );
}
