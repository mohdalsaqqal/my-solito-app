import { BrandShowcaseSection } from './BrandShowcaseSection';
import { BrandBlocksSection } from './BrandBlocksSection';
import { CategoriesFilterSection } from './CategoriesFilterSection';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import { FooterSection } from './FooterSection';
import { HeaderHeroSection } from './HeaderHeroSection';
import { NewArrivalsSection } from './NewArrivalsSection';
import { PromotionalBannerSection } from './PromotionalBannerSection';
import { TestimonialsSection } from './TestimonialsSection';
import type { HeaderVariant } from './headers/EcommerceHeader';

export const IndexScreen = ({ headerVariant = 'sticky-compact' }: { headerVariant?: HeaderVariant }) => {
  return (
    <div className="relative w-full bg-bg">
      {import.meta.env.DEV && (
      <div className="fixed right-4 top-4 z-50 flex flex-wrap justify-end gap-2 max-w-[600px]">
        <a
          href="/?view=assets"
          className="rounded-md bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-elevation-08"
        >
          Asset Gallery
        </a>
        <a
          href="/?view=components"
          className="rounded-md bg-mint px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-elevation-08"
        >
          Components
        </a>
        <a
          href="/?view=layout-grid"
          className="rounded-md bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          Layout Grid
        </a>
        <a
          href="/?view=system-effect"
          className="rounded-md bg-surface-soft px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          System Effect
        </a>
        <a
          href="/?view=light-colors"
          className="rounded-md bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-elevation-08"
        >
          Light Colors
        </a>
        <a
          href="/?view=typography"
          className="rounded-md bg-surface-soft px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          Typography
        </a>
        <a
          href="/?view=button-system"
          className="rounded-md bg-bg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          Buttons
        </a>
        <a
          href="/?view=elements"
          className="rounded-md bg-stroke px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          Elements
        </a>
        <a
          href="/?view=card-system"
          className="rounded-md bg-surface-soft px-3 py-2 text-xs font-semibold uppercase tracking-wide text-fg shadow-elevation-08"
        >
          Cards
        </a>
        <a
          href="/?view=header-variants"
          className="rounded-md bg-brand px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-elevation-08"
        >
          Headers
        </a>
      </div>
      )}
      <HeaderHeroSection headerVariant={headerVariant} />
      <PromotionalBannerSection />
      <CategoriesFilterSection />
      <NewArrivalsSection />
      <BrandShowcaseSection />
      <FeaturedProductsSection />
      <BrandBlocksSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
};
