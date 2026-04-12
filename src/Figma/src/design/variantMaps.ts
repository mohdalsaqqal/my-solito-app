export type HeroVariant = 'flash' | 'editorial' | 'new' | 'luxury' | 'member';

export type HeroVariantStyle = {
  overlay: string;
  panel: string;
  badge: string;
  eyebrow: string;
  cta: string;
  iconWrap: string;
  title: string;
};

export const heroVariantStyles: Record<HeroVariant, HeroVariantStyle> = {
  flash: {
    overlay: 'bg-hero-overlay-flash',
    panel: 'bg-hero-panel-flash text-fg',
    badge: 'bg-brand text-white',
    eyebrow: 'text-brand/80',
    cta: 'border-brand bg-brand text-white hover:bg-brand-strong hover:border-brand-strong',
    iconWrap: 'bg-white/15 text-white',
    title: 'text-fg',
  },
  editorial: {
    overlay: 'bg-hero-overlay-editorial',
    panel: 'bg-hero-panel-editorial text-fg',
    badge: 'bg-premium-blue text-white',
    eyebrow: 'text-premium-blue',
    cta: 'border-premium-blue bg-premium-blue text-white hover:bg-mint-strong hover:border-mint-strong',
    iconWrap: 'bg-premium-blue text-white',
    title: 'text-fg',
  },
  new: {
    overlay: 'bg-hero-overlay-new',
    panel: 'bg-hero-panel-new text-white',
    badge: 'bg-white/18 text-white',
    eyebrow: 'text-white/72',
    cta: 'border-white/25 bg-white text-fg hover:bg-white/85 hover:border-white',
    iconWrap: 'bg-black/30 text-white',
    title: 'text-white',
  },
  luxury: {
    overlay: 'bg-hero-overlay-luxury',
    panel: 'bg-hero-panel-luxury text-fg',
    badge: 'bg-hero-luxury-ink text-white',
    eyebrow: 'text-premium-blue',
    cta: 'border-hero-luxury-ink bg-transparent text-hero-luxury-ink hover:bg-hero-luxury-ink hover:text-white',
    iconWrap: 'bg-premium-blue text-white',
    title: 'text-fg',
  },
  member: {
    overlay: 'bg-hero-overlay-member',
    panel: 'bg-hero-panel-member text-white',
    badge: 'bg-white/12 text-white',
    eyebrow: 'text-white/68',
    cta: 'border-white/20 bg-white text-fg hover:bg-pop-blush hover:border-white',
    iconWrap: 'bg-pop-pink text-white',
    title: 'text-white',
  },
};

export const quickActionToneClassByKey = {
  'best-selling': 'text-fg',
  'top-categories': 'text-fg',
  'new-arrival': 'text-pop-pink',
  bundles: 'text-fg',
  'luxury-product': 'text-luxury',
  'hot-sale': 'text-danger',
} as const;

export type UiButtonVariant = 'solid' | 'soft' | 'outline';
export type UiButtonSize = 'md' | 'lg';

export const uiButtonVariantClass: Record<UiButtonVariant, string> = {
  solid: 'bg-brand text-brand-contrast border border-brand shadow-elevation-04 hover:bg-brand-strong hover:border-brand-strong',
  soft: 'bg-surface text-fg border border-stroke shadow-elevation-02 hover:bg-surface-soft hover:border-fg/50',
  outline: 'bg-transparent text-fg border border-stroke hover:bg-ink hover:border-ink hover:text-white',
};

export const uiButtonSizeClass: Record<UiButtonSize, string> = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-7 text-base',
};

export const sectionActionLinkClass =
  'text-xs font-semibold uppercase tracking-token-14 text-fg transition hover:text-brand hover:underline';

export const productRailNavButtonClass =
  'h-10 w-10 grid place-items-center rounded-full border border-stroke bg-surface text-fg transition hover:bg-ink hover:text-white';

export type PromoBannerVariant = 'top-offer' | 'bundle-edit';

export const promoBannerVariantStyles: Record<
  PromoBannerVariant,
  {
    imageOverlay: string;
    radialOverlay: string;
    ctaClass: string;
  }
> = {
  'top-offer': {
    imageOverlay: 'bg-promo-overlay-top-offer',
    radialOverlay: 'bg-promo-radial-top-offer',
    ctaClass: 'text-token-xxs tracking-token-14 border-white/30 bg-white/15 text-white hover:border-white hover:bg-white hover:text-fg',
  },
  'bundle-edit': {
    imageOverlay: 'bg-promo-overlay-bundle-edit',
    radialOverlay: 'bg-promo-radial-bundle-edit',
    ctaClass: 'text-token-xxs tracking-token-14 border-white/30 bg-white/15 text-white hover:border-white hover:bg-white hover:text-fg',
  },
};

export type BrandSpotlightVariant = 'nivea' | 'lancome';

export const brandSpotlightVariantStyles: Record<
  BrandSpotlightVariant,
  {
    imageOverlay: string;
    radialOverlay: string;
    ctaClass: string;
  }
> = {
  nivea: {
    imageOverlay: 'bg-brand-spotlight-overlay',
    radialOverlay: 'bg-brand-spotlight-radial',
    ctaClass: 'rounded-full border border-white/25 bg-white/10 px-5 py-2 text-token-xxs font-semibold uppercase tracking-token-14 text-white transition hover:border-white hover:bg-white hover:text-fg',
  },
  lancome: {
    imageOverlay: 'bg-brand-spotlight-overlay',
    radialOverlay: 'bg-brand-spotlight-radial',
    ctaClass: 'rounded-full border border-white/25 bg-white/10 px-5 py-2 text-token-xxs font-semibold uppercase tracking-token-14 text-white transition hover:border-white hover:bg-white hover:text-fg',
  },
};
