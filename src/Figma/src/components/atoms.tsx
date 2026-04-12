import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';
import { BrandArc } from './shared/BrandArc';
import { Layer } from '../ui/layer';
import { IconArrowRight, IconCart, UiButton } from './designSystem';

type SectionHeadingProps = {
  title: string;
  align?: 'left' | 'center';
};

export function SectionHeading({ title, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left')}>
      <div className={cn('inline-flex flex-col', align === 'center' ? 'items-center' : 'items-start')}>
        <h2 className="font-display text-[clamp(1.8rem,2.6vw,2.7rem)] font-semibold tracking-[-0.04em] text-fg">{title}</h2>
        <BrandArc width={88} animated className="mt-1.5" />
      </div>
    </div>
  );
}

export function ShopNowButton({ className }: { className?: string }) {
  return (
    <UiButton
      variant="outline"
      size="md"
      leftIcon={<IconCart className="h-4 w-4" />}
      rightIcon={<IconArrowRight />}
      className={cn('bg-white/85 backdrop-blur-sm', className)}
    >
      Shop Now
    </UiButton>
  );
}

type BadgeType = 'new' | 'sale' | 'bestseller' | 'limited';

type RatingMeta = {
  value: number;
  count: number;
};

type ColorOption = {
  id: string;
  name: string;
  hex: string;
};

type SizeOption = {
  id: string;
  label: string;
};

type VariantAvailability = {
  colorId: string;
  sizeId: string;
  stock: number;
};

export type ProductCardMode = 'inline-options' | 'quick-view-order' | 'scan-compact';

type ProductCardProps = {
  name: string;
  price: string;
  originalPrice?: string;
  badges?: BadgeType[];
  imageSrc?: string;
  imageAlt?: string;
  rating?: RatingMeta;
  colors?: ColorOption[];
  sizes?: SizeOption[];
  variants?: VariantAvailability[];
  defaultVariant?: {
    colorId: string;
    sizeId: string;
  };
  seller?: string;
  deliveryText?: string;
  description?: string;
  mode?: ProductCardMode;
};

function Badge({ type }: { type: BadgeType }) {
  const badgeMap: Record<BadgeType, { label: string; className: string }> = {
    new: {
      label: 'New',
      className: 'bg-ink text-white'
    },
    sale: {
      label: 'Sale',
      className: 'bg-brand text-white'
    },
    bestseller: {
      label: 'Best Seller',
      className: 'bg-ink text-white'
    },
    limited: {
      label: 'Limited Edition',
      className: 'bg-sun text-fg'
    }
  };

  const badge = badgeMap[type];

  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em]',
        badge.className
      )}
    >
      {badge.label}
    </span>
  );
}

function parseMoney(value?: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function variantKey(colorId: string, sizeId: string) {
  return `${colorId}::${sizeId}`;
}

function toStars(value: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(value)));
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 20s-7-4.3-7-10a4.1 4.1 0 0 1 7-2.7A4.1 4.1 0 0 1 19 10c0 5.7-7 10-7 10Z" />
    </svg>
  );
}

function IconArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function IconHeartFilled() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 20s-7-4.3-7-10a4.1 4.1 0 0 1 7-2.7A4.1 4.1 0 0 1 19 10c0 5.7-7 10-7 10Z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M8 12h8" />
      <path d="M12 8l4 4-4 4" />
      <path d="M6 5.5h5" />
      <path d="M6 18.5h5" />
    </svg>
  );
}

function IconPaperPlane() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </svg>
  );
}

function IconOptions() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h10" />
      <path d="M4 17h16" />
      <path d="M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M8 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

type IconMotionType = 'cart' | 'options' | 'quick-view' | 'favorite' | 'share';

function getIconMotion(motionType?: IconMotionType) {
  const rest = { x: 0, y: 0, rotate: 0, scale: 1 };

  if (motionType === 'cart') {
    return {
      rest,
      hover: { x: 4, scale: 1.08 },
    };
  }

  if (motionType === 'options') {
    return {
      rest,
      hover: { y: -2, rotate: 18, scale: 1.08 },
    };
  }

  if (motionType === 'quick-view') {
    return {
      rest,
      hover: { x: 3, y: -3, scale: 1.1 },
    };
  }

  if (motionType === 'favorite') {
    return {
      rest,
      hover: { scale: 1.18, y: -1 },
    };
  }

  if (motionType === 'share') {
    return {
      rest,
      hover: { x: 4, y: -2, rotate: -10, scale: 1.08 },
    };
  }

  return { rest, hover: rest };
}

function ActionButton({
  label,
  icon,
  hoverIcon,
  onClick,
  className,
  motionType
}: {
  label: string;
  icon: ReactNode;
  hoverIcon?: ReactNode;
  onClick: () => void;
  className?: string;
  motionType?: IconMotionType;
}) {
  const prefersReducedMotion = useReducedMotion();
  const variants = getIconMotion(motionType);

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      initial={prefersReducedMotion ? false : 'rest'}
      whileHover={prefersReducedMotion ? undefined : 'hover'}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      className={cn(
        'group/button grid h-8 w-8 place-items-center rounded-full shadow-elevation-02 transition',
        className
      )}
    >
      <motion.span
        variants={prefersReducedMotion ? undefined : variants}
        transition={{ type: 'spring', stiffness: 420, damping: 18, mass: 0.7 }}
        className="grid place-items-center group-hover/button:hidden"
      >
        {icon}
      </motion.span>
      <motion.span
        variants={prefersReducedMotion ? undefined : variants}
        transition={{ type: 'spring', stiffness: 420, damping: 18, mass: 0.7 }}
        className="hidden place-items-center group-hover/button:grid"
      >
        {hoverIcon ?? icon}
      </motion.span>
    </motion.button>
  );
}

export function ProductCard({
  name,
  price,
  originalPrice,
  badges = [],
  imageSrc,
  imageAlt,
  rating = { value: 4.7, count: 240 },
  colors,
  sizes,
  variants,
  defaultVariant,
  seller = 'Official Store',
  deliveryText = 'Free delivery by Tue',
  description = 'Fast-moving skincare pick with strong repeat purchase rate.',
  mode = 'quick-view-order'
}: ProductCardProps) {
  const normalizedColors =
    colors && colors.length > 0
      ? colors
      : [{ id: 'default', name: 'Default', hex: 'rgb(var(--color-stroke))' }];
  const normalizedSizes =
    sizes && sizes.length > 0
      ? sizes
      : [{ id: 'one-size', label: 'One Size' }];

  const variantMap = useMemo(() => {
    const map = new Map<string, number>();

    if (variants && variants.length > 0) {
      variants.forEach((variant) => {
        map.set(variantKey(variant.colorId, variant.sizeId), variant.stock);
      });
      return map;
    }

    normalizedColors.forEach((color) => {
      normalizedSizes.forEach((size) => {
        map.set(variantKey(color.id, size.id), 12);
      });
    });
    return map;
  }, [variants, normalizedColors, normalizedSizes]);

  const getStock = (colorId: string, sizeId: string) => variantMap.get(variantKey(colorId, sizeId)) ?? 0;

  const firstAvailable = useMemo(() => {
    for (const color of normalizedColors) {
      for (const size of normalizedSizes) {
        if (getStock(color.id, size.id) > 0) {
          return { colorId: color.id, sizeId: size.id };
        }
      }
    }

    return { colorId: normalizedColors[0].id, sizeId: normalizedSizes[0].id };
  }, [normalizedColors, normalizedSizes, variantMap]);

  const initialSelection = useMemo(() => {
    if (defaultVariant && getStock(defaultVariant.colorId, defaultVariant.sizeId) > 0) {
      return defaultVariant;
    }

    return firstAvailable;
  }, [defaultVariant, firstAvailable, variantMap]);

  const [selectedColorId, setSelectedColorId] = useState(initialSelection.colorId);
  const [selectedSizeId, setSelectedSizeId] = useState(initialSelection.sizeId);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSelectedColorId(initialSelection.colorId);
    setSelectedSizeId(initialSelection.sizeId);
  }, [initialSelection]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!isQuickViewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsQuickViewOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isQuickViewOpen]);

  const selectedColor = normalizedColors.find((color) => color.id === selectedColorId) ?? normalizedColors[0];
  const selectedSize = normalizedSizes.find((size) => size.id === selectedSizeId) ?? normalizedSizes[0];
  const selectedStock = getStock(selectedColor.id, selectedSize.id);

  const currentPrice = parseMoney(price);
  const oldPrice = parseMoney(originalPrice);
  const discountPercent =
    oldPrice && currentPrice && oldPrice > currentPrice
      ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
      : null;
  const saveAmount =
    oldPrice && currentPrice && oldPrice > currentPrice
      ? oldPrice - currentPrice
      : null;

  const inStock = selectedStock > 0;
  const isQuickViewOrder = mode === 'quick-view-order';
  const isScanCompact = mode === 'scan-compact';
  const shouldShowInlineOptions = mode === 'inline-options';
  const shouldShowQuickViewColorPicker = normalizedColors.length > 1;
  const shouldShowQuickViewSizePicker = normalizedSizes.length > 1;
  const hasVariantChoices = normalizedColors.length > 1 || normalizedSizes.length > 1;
  const shouldOpenQuickViewForOrder = (isQuickViewOrder && hasVariantChoices) || isScanCompact;

  const autoPickSizeForColor = (colorId: string) => {
    if (getStock(colorId, selectedSizeId) > 0) {
      return selectedSizeId;
    }

    const fallbackSize = normalizedSizes.find((size) => getStock(colorId, size.id) > 0);
    return fallbackSize ? fallbackSize.id : selectedSizeId;
  };

  const autoPickColorForSize = (sizeId: string) => {
    if (getStock(selectedColorId, sizeId) > 0) {
      return selectedColorId;
    }

    const fallbackColor = normalizedColors.find((color) => getStock(color.id, sizeId) > 0);
    return fallbackColor ? fallbackColor.id : selectedColorId;
  };

  const handleColorChange = (colorId: string) => {
    const nextSizeId = autoPickSizeForColor(colorId);
    setSelectedColorId(colorId);
    setSelectedSizeId(nextSizeId);

    if (nextSizeId !== selectedSizeId) {
      const sizeLabel = normalizedSizes.find((size) => size.id === nextSizeId)?.label ?? nextSizeId;
      setFeedback(`Size auto-switched to ${sizeLabel}`);
    }
  };

  const handleSizeChange = (sizeId: string) => {
    const nextColorId = autoPickColorForSize(sizeId);
    setSelectedSizeId(sizeId);
    setSelectedColorId(nextColorId);

    if (nextColorId !== selectedColorId) {
      const colorLabel = normalizedColors.find((color) => color.id === nextColorId)?.name ?? nextColorId;
      setFeedback(`Shade auto-switched to ${colorLabel}`);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) {
      setFeedback('Selected variant is out of stock');
      return;
    }

    setFeedback(`Added ${selectedColor.name} / ${selectedSize.label} to cart`);
  };

  const stockLabel = !inStock
    ? 'Out of stock'
    : selectedStock <= 3
      ? `Only ${selectedStock} left`
      : selectedStock <= 9
        ? 'Selling fast'
        : 'In stock';

  const visibleColors = normalizedColors.slice(0, 6);
  const extraColorCount = Math.max(0, normalizedColors.length - visibleColors.length);
  const visibleSizes = normalizedSizes.slice(0, 4);
  const extraSizeCount = Math.max(0, normalizedSizes.length - visibleSizes.length);

  const handleWishlist = () => {
    setIsWishlisted((prev) => !prev);
    setFeedback(isWishlisted ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = async () => {
    const shareData = {
      title: name,
      text: `Check out ${name}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setFeedback('Product shared');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setFeedback('Link copied');
        return;
      }
    } catch {
      setFeedback('Share canceled');
      return;
    }

    setFeedback('Sharing not supported');
  };

  const handlePrimaryAction = () => {
    if (shouldOpenQuickViewForOrder) {
      setIsQuickViewOpen(true);
      return;
    }

    handleAddToCart();
  };

  const primaryButtonLabel = !inStock
    ? 'Unavailable'
    : isScanCompact
      ? hasVariantChoices
        ? 'Choose Options'
        : 'Quick View'
      : shouldOpenQuickViewForOrder
        ? 'Order Now'
        : 'Add To Cart';
  const quickViewOrderActionLabel = !inStock
    ? 'Unavailable'
    : hasVariantChoices
      ? 'Choose Options'
      : 'Add To Cart';
  const quickViewOrderActionIcon = hasVariantChoices ? <IconOptions /> : <IconCart className="h-4 w-4" />;
  const quickViewOrderActionMotion = quickViewOrderActionLabel === 'Choose Options' ? 'options' : 'cart';
  const primaryActionIcon =
    primaryButtonLabel === 'Choose Options'
      ? <IconOptions />
      : primaryButtonLabel === 'Quick View'
        ? <IconEye />
        : <IconCart className="h-4 w-4" />;
  const primaryActionMotion =
    primaryButtonLabel === 'Choose Options'
      ? 'options'
      : primaryButtonLabel === 'Quick View'
        ? 'quick-view'
        : 'cart';
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {isScanCompact ? (
        <div className="group flex h-full flex-col gap-3 rounded-sm border border-stroke bg-surface p-3">
          <Layer depth="e02" tone="neutral" className="relative overflow-hidden rounded-sm border-0 p-0">
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setIsQuickViewOpen(true)}
              aria-label={`Quick view ${name}`}
            >
              <div className="relative aspect-square w-full bg-surface-soft">
                {imageSrc ? (
                  <img src={imageSrc} alt={imageAlt ?? name} className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>
            </button>

            {badges.length > 0 ? (
              <div className="absolute left-3 top-3">
                <Badge type={badges[0]} />
              </div>
            ) : null}

            <ActionButton
              label="Wishlist"
              icon={<IconHeart />}
              className={cn(
                'absolute right-3 top-3 bg-surface text-fg',
                isWishlisted ? 'bg-brand text-white' : 'bg-surface text-fg'
              )}
              onClick={handleWishlist}
            />
          </Layer>

          <div className="flex flex-1 flex-col gap-2">
            <p className="min-h-[42px] overflow-hidden break-words text-[13px] font-medium leading-[1.6] text-fg [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {name}
            </p>

            <div
              role="img"
              aria-label={`Rated ${rating.value.toFixed(1)} out of 5`}
              className="flex items-center gap-2 text-[11px] text-muted"
            >
              <span aria-hidden className="font-mono tracking-[1.5px] text-[rgb(var(--color-rating))]">{toStars(rating.value)}</span>
              <span aria-hidden>{rating.value.toFixed(1)}</span>
              <span aria-hidden>({rating.count})</span>
            </div>

            <div className="space-y-1">
              <div className="flex min-h-[22px] items-center gap-2 text-sm">
                <span className={cn('font-semibold', discountPercent ? 'text-danger' : 'text-fg')}>{price}</span>
                {originalPrice ? <span className="text-muted line-through">{originalPrice}</span> : null}
                {discountPercent ? <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-fg">-{discountPercent}%</span> : null}
              </div>
              <p className="truncate text-[11px] text-muted" title={deliveryText}>
                {deliveryText}
              </p>
            </div>

            <div className="mt-auto group">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!inStock}
                className={cn(
                  'w-full rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition',
                  inStock ? 'bg-ink text-white hover:bg-ink/90' : 'bg-stroke text-muted cursor-not-allowed'
                )}
              >
                <span>{primaryButtonLabel}</span>
              </button>
              {inStock ? (
                <BrandArc
                  width={80}
                  animated
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5 w-full"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="group flex h-full flex-col gap-3 rounded-sm border-[1px] border-stroke bg-surface p-3">
          <Layer depth="e02" tone="neutral" className="relative overflow-hidden rounded-sm border-0 p-0">
            <div className="relative aspect-square w-full bg-surface-soft">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageAlt ?? name}
                  className={cn(
                    'h-full w-full object-cover transition duration-300',
                    isQuickViewOrder ? 'group-hover:scale-[1.02]' : ''
                  )}
                  loading="lazy"
                />
              ) : null}
              {isQuickViewOrder ? <div className="pointer-events-none absolute inset-0 z-10 bg-slate-700 opacity-0 transition duration-300 group-hover:opacity-45" /> : null}
            </div>

            {badges.length > 0 ? (
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {badges.map((type) => (
                  <Badge key={type} type={type} />
                ))}
              </div>
            ) : null}

            <div className="absolute right-3 top-3 z-20 hidden translate-x-2 flex-col items-end gap-2 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:flex">
              <ActionButton
                label="Quick view"
                icon={<IconEye />}
                hoverIcon={<IconArrowUpRight />}
                className="bg-surface text-fg"
                motionType="quick-view"
                onClick={() => setIsQuickViewOpen(true)}
              />
              <ActionButton
                label="Favorite"
                icon={<IconHeart />}
                hoverIcon={<IconHeartFilled />}
                className={isWishlisted ? 'bg-brand text-white' : 'bg-surface text-fg'}
                motionType="favorite"
                onClick={handleWishlist}
              />
              <ActionButton
                label="Share"
                icon={<IconShare />}
                hoverIcon={<IconPaperPlane />}
                className="bg-surface text-fg"
                motionType="share"
                onClick={() => void handleShare()}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileActions((prev) => !prev)}
              className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-surface text-fg shadow-elevation-02 md:hidden"
              aria-label="More actions"
            >
              <IconMore />
            </button>

            {showMobileActions ? (
              <div className="absolute right-3 top-12 z-20 flex w-28 flex-col rounded-md border border-stroke bg-surface p-1 shadow-elevation-08 md:hidden">
              <button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-left text-[11px]" onClick={() => setIsQuickViewOpen(true)}>
                <IconEye />
                <span>Quick View</span>
              </button>
              <button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-left text-[11px]" onClick={handleWishlist}>
                <IconHeart />
                <span>{isWishlisted ? 'Unfavorite' : 'Favorite'}</span>
              </button>
              <button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-left text-[11px]" onClick={() => void handleShare()}>
                <IconShare />
                <span>Share</span>
              </button>
              </div>
            ) : null}
          </Layer>

          <div className="flex flex-1 flex-col space-y-2">
            <div className="flex h-4 min-w-0 items-center justify-between gap-2 text-[11px] text-muted">
              <span className="truncate font-semibold uppercase tracking-[0.08em] text-muted">{seller}</span>
              <span className={cn(
                'shrink-0 font-medium',
                !inStock ? 'text-danger' : 'text-brand'
              )}>{stockLabel}</span>
            </div>

            <p className="h-12 overflow-hidden break-words text-sm font-medium leading-6 text-fg [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {name}
            </p>

            <div
              role="img"
              aria-label={`Rated ${rating.value.toFixed(1)} out of 5`}
              className="flex h-4 items-center gap-2 text-[11px] text-muted"
            >
              <span aria-hidden className="font-mono tracking-[1.5px] text-[rgb(var(--color-rating))]">{toStars(rating.value)}</span>
              <span aria-hidden>{rating.value.toFixed(1)}</span>
              <span aria-hidden>({rating.count})</span>
            </div>

            <div className="space-y-1 group">
              <div className="flex min-h-8 items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <span className={cn('font-semibold', discountPercent ? 'text-danger' : 'text-fg')}>{price}</span>
                  {originalPrice ? <span className="text-muted line-through">{originalPrice}</span> : null}
                  {discountPercent ? <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-fg">-{discountPercent}%</span> : null}
                </div>
                {isQuickViewOrder ? (
                  <ActionButton
                    label={quickViewOrderActionLabel}
                    icon={quickViewOrderActionIcon}
                    motionType={quickViewOrderActionMotion}
                    className={cn(
                      'h-9 w-9 shrink-0 border transition-transform duration-200 hover:scale-105 hover:shadow-elevation-04',
                      inStock
                        ? hasVariantChoices
                          ? 'border-ink bg-ink text-white hover:border-black hover:bg-black'
                          : 'border-danger bg-danger text-white hover:border-brand-strong hover:bg-brand-strong'
                        : 'border-stroke bg-stroke text-muted cursor-not-allowed'
                    )}
                    onClick={handlePrimaryAction}
                  />
                ) : null}
              </div>
              <p
                className={cn('h-4 text-[11px] font-semibold', saveAmount ? 'text-brand' : 'text-transparent')}
                aria-hidden={!saveAmount}
              >
                {saveAmount ? `You save ${formatMoney(saveAmount)}` : 'You save $0.00'}
              </p>
              {isQuickViewOrder && inStock ? (
                <BrandArc
                  width={80}
                  animated
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5"
                />
              ) : null}
            </div>

            {shouldShowInlineOptions ? (
              <div className="space-y-2 pt-1">
                <div className="flex min-h-[20px] items-center gap-2">
                  <span className="text-[11px] font-medium text-muted">Shade</span>
                  <div className="flex flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
                    {visibleColors.map((color) => {
                      const hasAnyStock = normalizedSizes.some((size) => getStock(color.id, size.id) > 0);
                      const selected = selectedColor.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => handleColorChange(color.id)}
                          disabled={!hasAnyStock}
                          title={color.name}
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-full border transition',
                            selected ? 'border-ink' : 'border-white/70',
                            hasAnyStock ? 'opacity-100' : 'opacity-35 cursor-not-allowed'
                          )}
                        >
                          <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                        </button>
                      );
                    })}
                    {extraColorCount > 0 ? <span className="text-[10px] text-muted">+{extraColorCount}</span> : null}
                  </div>
                </div>

                <div className="flex min-h-[20px] items-center gap-2">
                  <span className="text-[11px] font-medium text-muted">Size</span>
                  <div className="flex flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
                    {visibleSizes.map((size) => {
                      const hasStockForCurrentColor = getStock(selectedColor.id, size.id) > 0;
                      const selected = selectedSize.id === size.id;
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => handleSizeChange(size.id)}
                          disabled={!hasStockForCurrentColor}
                          className={cn(
                            'h-8 min-w-[3.1rem] rounded border px-2 text-[11px] font-medium leading-none transition',
                            selected ? 'border-ink bg-ink text-white' : 'border-stroke bg-surface text-fg',
                            hasStockForCurrentColor ? '' : 'cursor-not-allowed opacity-35'
                          )}
                        >
                          {size.label}
                        </button>
                      );
                    })}
                    {extraSizeCount > 0 ? <span className="text-[10px] text-muted">+{extraSizeCount}</span> : null}
                  </div>
                </div>

                <p className="truncate text-[11px] text-muted" title={`${selectedColor.name} / ${selectedSize.label} - ${deliveryText}`}>
                  {selectedColor.name} / {selectedSize.label} - {deliveryText}
                </p>
              </div>
            ) : isQuickViewOrder ? null : (
              <div className="pt-1">
                <p className="truncate text-[11px] text-muted" title={deliveryText}>
                  {deliveryText}
                </p>
              </div>
            )}

            {feedback ? (
              <p className="min-h-[16px] text-[11px] font-medium text-brand">{feedback}</p>
            ) : null}

            {!isQuickViewOrder ? (
              <motion.button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!inStock}
                initial={prefersReducedMotion ? false : 'rest'}
                whileHover={prefersReducedMotion ? undefined : 'hover'}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className={cn(
                  'group mt-auto flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition',
                  inStock
                    ? hasVariantChoices
                      ? 'bg-ink text-white hover:bg-ink-soft'
                      : 'bg-brand text-white hover:bg-brand-strong'
                    : 'bg-stroke text-muted cursor-not-allowed'
                )}
              >
                <span>{primaryButtonLabel}</span>
                <motion.span
                  variants={prefersReducedMotion ? undefined : getIconMotion(primaryActionMotion)}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, mass: 0.7 }}
                  aria-hidden
                >
                  {primaryActionIcon}
                </motion.span>
              </motion.button>
            ) : null}
          </div>
        </div>
      )}

      {isQuickViewOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={() => setIsQuickViewOpen(false)}>
          <div
            className="w-full max-w-3xl rounded-xl bg-surface p-4 shadow-elevation-24 md:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Quick View</p>
                <h3 className="mt-1 text-xl font-semibold text-fg">{name}</h3>
              </div>
              <button type="button" className="rounded border border-stroke px-3 py-1 text-sm" onClick={() => setIsQuickViewOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
              <Layer depth="e01" tone="soft" className="p-0">
                <div className="aspect-square w-full">
                  {imageSrc ? <img src={imageSrc} alt={imageAlt ?? name} className="h-full w-full object-contain p-5" /> : null}
                </div>
              </Layer>

              <div className="space-y-3">
                <div
                  role="img"
                  aria-label={`Rated ${rating.value.toFixed(1)} out of 5`}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <span aria-hidden className="font-mono tracking-[1.5px] text-[rgb(var(--color-rating))]">{toStars(rating.value)}</span>
                  <span aria-hidden>{rating.value.toFixed(1)} ({rating.count} reviews)</span>
                </div>

                <p className="text-sm leading-6 text-muted">{description}</p>

                <div className="flex items-center gap-2 text-base">
                  <span className={cn('font-semibold', discountPercent ? 'text-danger' : 'text-fg')}>{price}</span>
                  {originalPrice ? <span className="text-muted line-through">{originalPrice}</span> : null}
                  {discountPercent ? <span className="rounded bg-sun px-1.5 py-0.5 text-xs font-semibold">-{discountPercent}%</span> : null}
                </div>

                {shouldShowQuickViewColorPicker ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Shade</p>
                    <div className="flex flex-wrap gap-2">
                      {normalizedColors.map((color) => {
                        const hasAnyStock = normalizedSizes.some((size) => getStock(color.id, size.id) > 0);
                        const selected = color.id === selectedColor.id;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handleColorChange(color.id)}
                            disabled={!hasAnyStock}
                            className={cn(
                              'flex items-center gap-2 rounded border px-2 py-1 text-xs',
                              selected ? 'border-ink bg-ink text-white' : 'border-stroke bg-surface',
                              hasAnyStock ? '' : 'cursor-not-allowed opacity-35'
                            )}
                          >
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hex }} />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {shouldShowQuickViewSizePicker ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {normalizedSizes.map((size) => {
                        const hasStockForCurrentColor = getStock(selectedColor.id, size.id) > 0;
                        const selected = size.id === selectedSize.id;
                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => handleSizeChange(size.id)}
                            disabled={!hasStockForCurrentColor}
                            className={cn(
                              'rounded border px-3 py-1 text-xs',
                              selected ? 'border-ink bg-ink text-white' : 'border-stroke bg-surface text-fg',
                              hasStockForCurrentColor ? '' : 'cursor-not-allowed opacity-35'
                            )}
                          >
                            {size.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Qty</p>
                  <div className="inline-flex items-center rounded border border-stroke">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-2 py-1 text-sm"
                    >
                      -
                    </button>
                    <span aria-live="polite" aria-atomic="true" className="min-w-8 text-center text-sm">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                      className="px-2 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  initial={prefersReducedMotion ? false : 'rest'}
                  whileHover={prefersReducedMotion ? undefined : 'hover'}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  className={cn(
                    'group flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition',
                    inStock
                      ? 'bg-brand text-white hover:bg-brand-strong'
                      : 'bg-stroke text-muted cursor-not-allowed'
                  )}
                >
                  <span>{inStock ? `Add ${quantity} To Cart` : 'Unavailable'}</span>
                  {inStock ? (
                    <motion.span
                      variants={prefersReducedMotion ? undefined : getIconMotion('cart')}
                      transition={{ type: 'spring', stiffness: 420, damping: 18, mass: 0.7 }}
                      aria-hidden
                    >
                      <IconCart className="h-4 w-4" />
                    </motion.span>
                  ) : null}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type CarouselButtonProps = {
  direction: 'left' | 'right';
  className?: string;
};

export function CarouselButton({ direction, className }: CarouselButtonProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full bg-surface text-muted shadow-elevation-04 transition hover:text-fg',
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {direction === 'left'
          ? <path d="M15 18l-6-6 6-6" />
          : <path d="M9 18l6-6-6-6" />
        }
      </svg>
    </button>
  );
}

export function SliderDots({ count = 2, active = 0 }: { count?: number; active?: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, idx) => (
        <span
          key={idx}
          className={cn('h-2 w-2 rounded-full', idx === active ? 'bg-mint' : 'bg-mint/35')}
        />
      ))}
    </div>
  );
}

export function FooterHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wide text-white">{children}</h3>;
}
