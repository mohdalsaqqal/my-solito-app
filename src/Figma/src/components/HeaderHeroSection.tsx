import { useRef } from 'react';
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Crown,
  Flask,
  Gift,
  SealCheck,
  Sparkle,
} from '@phosphor-icons/react';
import { sephoraAssets } from '../assets/sephoraAssets';
import { EcommerceHeader, type HeaderVariant } from './headers/EcommerceHeader';
import { BrandArc } from './shared/BrandArc';
import { heroVariantStyles, type HeroVariant } from '../design/variantMaps';

type HeroTile = {
  id: string;
  variant: HeroVariant;
  badge: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
};

const heroTiles: HeroTile[] = [
  {
    id: 'tile-1',
    variant: 'flash',
    badge: 'Top Offers',
    eyebrow: 'Department Deals',
    title: 'The Week’s Best Beauty Savings',
    subtitle: 'Shop the strongest markdowns across skincare, fragrance, hair, and makeup.',
    cta: 'See all deals',
    image: sephoraAssets.promotionalBanners[0],
  },
  {
    id: 'tile-2',
    variant: 'editorial',
    badge: 'Routine Notes',
    eyebrow: 'Editorial Pick',
    title: 'Build a Better Daily Ritual',
    subtitle: 'A skin-first edit of cleansers, serums, and moisturizers that layer beautifully.',
    cta: 'Explore the edit',
    image: sephoraAssets.promotionalBanners[1],
  },
  {
    id: 'tile-3',
    variant: 'new',
    badge: 'New In',
    eyebrow: 'Now Arriving',
    title: 'Fresh Launches Across the Floor',
    subtitle: 'Trending drops, exclusive bundles, and just-landed beauty from the brands shoppers watch.',
    cta: 'Shop new arrivals',
    image: sephoraAssets.brandShowcase.hero,
  },
  {
    id: 'tile-4',
    variant: 'luxury',
    badge: 'Prestige Hall',
    eyebrow: 'Luxury Edit',
    title: 'A More Refined Way to Shop Beauty',
    subtitle: 'Discover prestige fragrance, polished skincare, and elevated gifting in one destination.',
    cta: 'Enter prestige',
    image: sephoraAssets.hero.background,
  },
  {
    id: 'tile-5',
    variant: 'member',
    badge: 'Member Value',
    eyebrow: 'Benefits + Bundles',
    title: 'More Beauty in Every Order',
    subtitle: 'Unlock bonus samples, bundle savings, and member-only offers built to convert.',
    cta: 'Unlock offers',
    image: sephoraAssets.instagram[6],
  },
];

const TileIcon = ({ variant }: { variant: HeroVariant }) => {
  if (variant === 'flash') return <Sparkle size={14} weight="fill" />;
  if (variant === 'editorial') return <Flask size={14} weight="fill" />;
  if (variant === 'new') return <Gift size={14} weight="fill" />;
  if (variant === 'luxury') return <Crown size={14} weight="fill" />;
  return <SealCheck size={14} weight="fill" />;
};

export const HeaderHeroSection = ({ headerVariant = 'sticky-compact' }: { headerVariant?: HeaderVariant }) => {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByTiles = (direction: 'next' | 'prev') => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>('[data-hero-tile]');
    if (!firstCard) return;

    const gap = 16;
    const distance = firstCard.offsetWidth + gap;
    rail.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };

  return (
    <header className="w-full">
      <EcommerceHeader variant={headerVariant} />

      <section aria-label="Featured campaigns" className="relative border-y border-stroke/70 bg-white py-3">
        <div className="pointer-events-none absolute inset-0 bg-hero-radial-field" />
        <div className="relative">
          <div
            ref={railRef}
            className="no-scrollbar overflow-x-auto scroll-smooth"
          >
            <div className="grid grid-flow-col auto-cols-hero-mobile gap-4 px-2 md:auto-cols-hero-tablet lg:auto-cols-hero-desktop lg:px-3">
              {heroTiles.map((tile) => {
                const styles = heroVariantStyles[tile.variant];

                return (
                  <article
                    key={tile.id}
                    data-hero-tile
                    className="group grid h-hero-mobile snap-start grid-rows-hero-card overflow-hidden rounded-hero-card border border-stroke/80 bg-surface shadow-elevation-03 transition duration-300 hover:-translate-y-1 hover:shadow-elevation-08 md:h-hero-tablet lg:h-hero-desktop"
                  >
                    <div className="relative h-full overflow-hidden">
                      <img src={tile.image} alt={tile.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-103" />
                      <div className={`pointer-events-none absolute inset-0 ${styles.overlay}`} />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent" />
                    </div>

                    <div className={`flex h-full flex-col gap-2.5 p-5 ${styles.panel}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-token-micro font-semibold uppercase tracking-token-12 ${styles.badge}`}
                        >
                          <span className={`grid h-4 w-4 place-items-center rounded-full ${styles.iconWrap}`}>
                            <TileIcon variant={tile.variant} />
                          </span>
                          {tile.badge}
                        </span>
                        <span className={`text-token-micro font-semibold uppercase tracking-token-14 ${styles.eyebrow}`}>
                          {tile.eyebrow}
                        </span>
                      </div>

                      <h2 className={`font-display min-h-hero-title line-clamp-2 text-token-hero-title font-semibold leading-token-hero-title tracking-token-tight-title ${styles.title}`}>
                        {tile.title}
                      </h2>
                      <BrandArc
                        width={220}
                        animated={tile.id === 'tile-1'}
                        delay={300}
                        className="mt-1"
                      />
                      <p className="min-h-12 line-clamp-2 text-sm leading-6 opacity-90">{tile.subtitle}</p>
                      <p className="mt-4 text-token-micro font-semibold uppercase tracking-token-24 opacity-70">endless beauty</p>
                      <a
                        href="#"
                        className={`mt-auto inline-flex w-max items-center gap-1 rounded-full border px-4 py-2 text-token-xxs font-semibold uppercase tracking-token-14 transition ${styles.cta}`}
                      >
                        {tile.cta}
                        <ArrowRight size={14} weight="bold" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous hero tile"
            className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70 lg:grid"
            onClick={() => scrollByTiles('prev')}
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next hero tile"
            className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70 lg:grid"
            onClick={() => scrollByTiles('next')}
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>
      </section>
    </header>
  );
};
