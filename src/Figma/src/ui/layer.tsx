import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/cn';

type LayerDepth =
  | 'base'
  | 'raised'
  | 'floating'
  | 'overlay'
  | 'e00'
  | 'e01'
  | 'e02'
  | 'e03'
  | 'e04'
  | 'e06'
  | 'e08'
  | 'e12'
  | 'e16'
  | 'e24';
type LayerTone = 'neutral' | 'soft' | 'brand' | 'glass' | 'mint' | 'dark' | 'sun';

type LayerProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    depth?: LayerDepth;
    tone?: LayerTone;
  }
>;

const depthMap: Record<LayerDepth, string> = {
  base: 'z-layer-base shadow-elevation-01',
  raised: 'z-layer-raised shadow-elevation-06',
  floating: 'z-layer-floating shadow-elevation-12',
  overlay: 'z-layer-overlay shadow-elevation-24',
  e00: 'z-layer-base shadow-elevation-00',
  e01: 'z-layer-base shadow-elevation-01',
  e02: 'z-layer-base shadow-elevation-02',
  e03: 'z-layer-base shadow-elevation-03',
  e04: 'z-layer-base shadow-elevation-04',
  e06: 'z-layer-raised shadow-elevation-06',
  e08: 'z-layer-raised shadow-elevation-08',
  e12: 'z-layer-floating shadow-elevation-12',
  e16: 'z-layer-floating shadow-elevation-16',
  e24: 'z-layer-overlay shadow-elevation-24'
};

const toneMap: Record<LayerTone, string> = {
  neutral: 'bg-surface text-fg border border-stroke/80',
  soft: 'bg-surface-soft text-fg border border-stroke/70',
  brand: 'bg-brand text-brand-contrast border border-brand-strong/40',
  glass: 'bg-white/70 backdrop-blur-xl text-fg border border-white/50',
  mint: 'bg-mint text-white border border-mint-strong/35',
  dark: 'bg-ink text-white border border-white/10',
  sun: 'bg-sun text-fg border border-brand/10'
};

export function Layer({
  className,
  depth = 'base',
  tone = 'neutral',
  children,
  ...props
}: LayerProps) {
  return (
    <div className={cn('rounded-xl', depthMap[depth], toneMap[tone], className)} {...props}>
      {children}
    </div>
  );
}
