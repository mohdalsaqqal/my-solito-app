import { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { sephoraAssets } from '../assets/sephoraAssets';
import {
  brandSpotlightVariantStyles,
  productRailNavButtonClass,
  type BrandSpotlightVariant,
} from '../design/variantMaps';
import { ProductCard, SectionHeading } from './atoms';
import { Layer } from '../ui/layer';

type BrandProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  badges?: ('new' | 'sale' | 'bestseller' | 'limited')[];
  image: string;
  rating: { value: number; count: number };
  description: string;
  deliveryText: string;
  colors: Array<{ id: string; name: string; hex: string }>;
};

type BrandBlockProps = {
  brandName: string;
  sectionSubtitle: string;
  banner: {
    variant: BrandSpotlightVariant;
    image: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  products: BrandProduct[];
};

const sizeSet = [
  { id: '30ml', label: '30ml' },
  { id: '75ml', label: '75ml' },
  { id: '150ml', label: '150ml' },
];

const createVariants = (colors: Array<{ id: string }>) => {
  return colors.flatMap((color, colorIndex) =>
    sizeSet.map((size, sizeIndex) => ({
      colorId: color.id,
      sizeId: size.id,
      stock: Math.max(0, 14 - colorIndex * 3 - sizeIndex * 2),
    }))
  );
};

function BrandBlock({ brandName, sectionSubtitle, banner, products }: BrandBlockProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateScrollableState = () => {
      setCanScroll(rail.scrollWidth > rail.clientWidth + 2);
    };

    updateScrollableState();
    window.addEventListener('resize', updateScrollableState);
    return () => window.removeEventListener('resize', updateScrollableState);
  }, [products.length]);

  const scrollByCard = (direction: 'next' | 'prev') => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>('[data-brand-product-card]');
    if (!firstCard) return;

    const gap = 16;
    const distance = firstCard.offsetWidth + gap;
    rail.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };
  const variantStyle = brandSpotlightVariantStyles[banner.variant];

  return (
    <section className="bg-bg py-10">
      <div className="mx-auto max-w-site space-y-5 px-4 lg:px-6">
        <Layer depth="e04" tone="soft" className="group relative overflow-hidden rounded-promo-card border border-stroke/70 p-6 md:p-8">
          <img src={banner.image} alt={`${brandName} banner`} className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 transition duration-500 group-hover:opacity-90 ${variantStyle.imageOverlay}`} />
          <div className={`absolute inset-0 ${variantStyle.radialOverlay}`} />
          <div className="relative z-10 max-w-banner space-y-4 text-white">
            <p className="text-token-xxs font-semibold uppercase tracking-token-18 text-white/72">{brandName}</p>
            <h3 className="font-display text-token-brand-sale leading-token-tight-display tracking-token-tight-title">{banner.title}</h3>
            <p className="max-w-prose text-sm leading-6 text-white/90">{banner.description}</p>
            <button
              type="button"
              className={variantStyle.ctaClass}
            >
              {banner.ctaLabel}
            </button>
          </div>
        </Layer>

        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionHeading title={`Shop ${brandName} Products`} align="left" />
            <p className="mt-1 text-xs uppercase tracking-token-14 text-muted">{sectionSubtitle}</p>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label={`Previous ${brandName} products`}
              onClick={() => scrollByCard('prev')}
              className={`${productRailNavButtonClass} ${
                canScroll ? 'grid' : 'hidden'
              }`}
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              aria-label={`Next ${brandName} products`}
              onClick={() => scrollByCard('next')}
              className={`${productRailNavButtonClass} ${
                canScroll ? 'grid' : 'hidden'
              }`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="no-scrollbar overflow-x-auto scroll-smooth"
        >
          <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-brand-mobile gap-4 pr-2 sm:auto-cols-brand-tablet lg:auto-cols-brand-desktop">
            {products.map((product) => {
              const defaultColor = product.colors[0]?.id ?? 'default';

              return (
                <div key={product.id} data-brand-product-card className="snap-start">
                  <ProductCard
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    badges={product.badges}
                    imageSrc={product.image}
                    rating={product.rating}
                    colors={product.colors}
                    sizes={sizeSet}
                    variants={createVariants(product.colors)}
                    defaultVariant={{ colorId: defaultColor, sizeId: sizeSet[1].id }}
                    seller={`${brandName} Official`}
                    deliveryText={product.deliveryText}
                    description={product.description}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const brandBlocks: BrandBlockProps[] = [
  {
    brandName: 'Nivea',
    sectionSubtitle: 'Hydration-first picks with daily-use staples',
    banner: {
      variant: 'nivea',
      image: sephoraAssets.brandShowcase.hero,
      title: 'Nivea Daily Care Event',
      description: 'Save on body milk, face wash, and SPF bundles made for everyday routines.',
      ctaLabel: 'Shop Nivea',
    },
    products: [
      {
        id: 'nivea-1',
        name: 'Nivea Body Milk 400ml',
        price: '$65.00',
        originalPrice: '$105.00',
        badges: ['sale'],
        image: sephoraAssets.featured[0],
        rating: { value: 4.8, count: 1930 },
        deliveryText: 'Free delivery by Tue',
        description: 'Lightweight body milk with long-lasting comfort hydration.',
        colors: [
          { id: 'light', name: 'Light', hex: '#9bb7df' },
          { id: 'classic', name: 'Classic', hex: '#6b8ec4' },
          { id: 'deep', name: 'Deep', hex: '#3d5f95' },
        ],
      },
      {
        id: 'nivea-2',
        name: 'Nivea Refreshing Face Wash 150ml',
        price: '$115.00',
        originalPrice: '$125.00',
        badges: ['new', 'sale'],
        image: sephoraAssets.newArrivals[3],
        rating: { value: 4.5, count: 640 },
        deliveryText: 'Free delivery by Thu',
        description: 'Refreshing gel texture with easy rinse and soft finish.',
        colors: [
          { id: 'fresh', name: 'Fresh', hex: '#7dc3f2' },
          { id: 'deep', name: 'Deep Clean', hex: '#4f8fcb' },
          { id: 'cool', name: 'Cool Aqua', hex: '#2f6ba0' },
        ],
      },
      {
        id: 'nivea-3',
        name: 'Nivea Creme Soft Milk 250ml',
        price: '$95.00',
        badges: ['limited'],
        image: sephoraAssets.newArrivals[4],
        rating: { value: 4.7, count: 1120 },
        deliveryText: 'Delivery by Wed',
        description: 'Creamy body milk for dry skin with smooth non-sticky feel.',
        colors: [
          { id: 'soft', name: 'Soft Blue', hex: '#b5c5f0' },
          { id: 'classic', name: 'Classic Blue', hex: '#8da6da' },
          { id: 'night', name: 'Night Blue', hex: '#5f79b3' },
        ],
      },
    ],
  },
  {
    brandName: 'Lancome',
    sectionSubtitle: 'Prestige picks selected for glow + protection',
    banner: {
      variant: 'lancome',
      image: sephoraAssets.promotionalBanners[1],
      title: 'Lancome Premium Edit',
      description: 'Discover top-rated formulas curated for brightening, UV defense, and smooth finish.',
      ctaLabel: 'Shop Lancome',
    },
    products: [
      {
        id: 'lancome-1',
        name: 'Lancome UV Expert 40ml',
        price: '$105.00',
        originalPrice: '$130.00',
        badges: ['bestseller'],
        image: sephoraAssets.newArrivals[2],
        rating: { value: 4.8, count: 1321 },
        deliveryText: 'Express by Tue',
        description: 'Daily sunscreen with soft matte feel and no white cast.',
        colors: [
          { id: 'porcelain', name: 'Porcelain', hex: '#f3ddbf' },
          { id: 'warm', name: 'Warm Beige', hex: '#ddb081' },
          { id: 'tan', name: 'Tan', hex: '#c28552' },
        ],
      },
      {
        id: 'lancome-2',
        name: 'Lancome Glow Serum 30ml',
        price: '$89.00',
        badges: ['new'],
        image: sephoraAssets.hero.product,
        rating: { value: 4.7, count: 882 },
        deliveryText: 'Delivery by Thu',
        description: 'Radiance serum designed for uneven tone and tired skin.',
        colors: [
          { id: 'radiant', name: 'Radiant', hex: '#f7e0cb' },
          { id: 'beige', name: 'Beige', hex: '#e5b88a' },
          { id: 'amber', name: 'Amber', hex: '#ca8e53' },
        ],
      },
      {
        id: 'lancome-3',
        name: 'Lancome Soft Clean Milk 200ml',
        price: '$72.00',
        originalPrice: '$92.00',
        badges: ['sale'],
        image: sephoraAssets.featured[4],
        rating: { value: 4.6, count: 704 },
        deliveryText: 'Free delivery by Wed',
        description: 'Gentle cleansing milk that leaves skin soft and balanced.',
        colors: [
          { id: 'ivory', name: 'Ivory', hex: '#f4e6cf' },
          { id: 'beige', name: 'Beige', hex: '#e7c8a0' },
          { id: 'honey', name: 'Honey', hex: '#d29c61' },
        ],
      },
    ],
  },
];

export function BrandBlocksSection() {
  return (
    <>
      {brandBlocks.map((block) => (
        <BrandBlock key={block.brandName} {...block} />
      ))}
    </>
  );
}
