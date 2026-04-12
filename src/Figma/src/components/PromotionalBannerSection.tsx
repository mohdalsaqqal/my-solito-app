import { sephoraAssets } from '../assets/sephoraAssets';
import {
  promoBannerVariantStyles,
  sectionActionLinkClass,
  type PromoBannerVariant,
} from '../design/variantMaps';
import { Layer } from '../ui/layer';
import { SectionHeading, ShopNowButton } from './atoms';

const banners = [
  {
    id: 1,
    variant: 'top-offer' as PromoBannerVariant,
    title: 'Save up to 50% on skincare icons',
    sale: 'Top Offer',
    eyebrow: 'Weekly markdown',
    image: sephoraAssets.promotionalBanners[0]
  },
  {
    id: 2,
    variant: 'bundle-edit' as PromoBannerVariant,
    title: 'Exclusive bundles with built-in value',
    sale: 'Bundle Edit',
    eyebrow: 'Limited sets',
    image: sephoraAssets.promotionalBanners[1]
  }
];

export const PromotionalBannerSection = () => {
  return (
    <section className="mx-auto max-w-site px-4 py-6 lg:px-6">
      <div className="mb-4 grid gap-3 sm:grid-cols-section-head sm:items-end">
        <SectionHeading title="Shop Top Offers" align="left" />
        <a
          href="#"
          className={`${sectionActionLinkClass} sm:justify-self-end`}
        >
          Shop all offers
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((banner) => {
          const variant = promoBannerVariantStyles[banner.variant];

          return (
            <Layer key={banner.id} depth="e04" tone="soft" className="group relative overflow-hidden rounded-promo-card p-8">
              <img src={banner.image} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className={`absolute inset-0 transition duration-500 group-hover:opacity-90 ${variant.imageOverlay}`} />
              <div className={`absolute inset-0 ${variant.radialOverlay}`} />
              <div className="relative z-10 max-w-sm space-y-5 text-white">
                <div className="space-y-2">
                  <p className="text-token-xxs font-semibold uppercase tracking-token-18 text-white/70">{banner.eyebrow}</p>
                  <h3 className="font-display text-token-promo-sale font-semibold leading-token-tight-display tracking-token-tight-title">{banner.sale}</h3>
                  <p className="text-base leading-7 text-white/88">{banner.title}</p>
                </div>
                <ShopNowButton className={variant.ctaClass} />
              </div>
            </Layer>
          );
        })}
      </div>
    </section>
  );
};
