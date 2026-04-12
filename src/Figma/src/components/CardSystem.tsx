import { useState } from 'react';
import { sephoraAssets } from '../assets/sephoraAssets';
import type { ProductCardMode } from './atoms';
import BannerCardElement from './elements/cards/BannerCardElement';
import BrandCardElement from './elements/cards/BrandCardElement';
import CardProductElement from './elements/cards/CardProductElement';
import CategoriesCardElement from './elements/cards/CategoriesCardElement';
import FeedbackCardElement from './elements/cards/FeedbackCardElement';
import InstagramCardElement from './elements/cards/InstagramCardElement';

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-jost text-2xl font-semibold text-fg">{children}</h2>;
}

export default function CardSystem() {
  const [cardMode, setCardMode] = useState<ProductCardMode>('quick-view-order');

  return (
    <main className="min-h-screen overflow-auto bg-bg p-10">
      <div className="mx-auto max-w-[1500px] space-y-14">
        <section className="flex flex-wrap items-center gap-3 rounded-md border border-stroke bg-surface p-3">
          <p className="text-sm font-semibold text-fg">Product Card Design:</p>
          <button
            type="button"
            onClick={() => setCardMode('inline-options')}
            className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              cardMode === 'inline-options'
                ? 'bg-mint text-white'
                : 'border border-stroke bg-surface text-fg hover:bg-surface-soft'
            }`}
          >
            Inline Options
          </button>
          <button
            type="button"
            onClick={() => setCardMode('quick-view-order')}
            className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              cardMode === 'quick-view-order'
                ? 'bg-mint text-white'
                : 'border border-stroke bg-surface text-fg hover:bg-surface-soft'
            }`}
          >
            Quick View Order
          </button>
          <button
            type="button"
            onClick={() => setCardMode('scan-compact')}
            className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              cardMode === 'scan-compact'
                ? 'bg-mint text-white'
                : 'border border-stroke bg-surface text-fg hover:bg-surface-soft'
            }`}
          >
            Scan Compact
          </button>
        </section>

        <section className="grid gap-10 xl:grid-cols-[334px_334px_1fr]">
          <div className="space-y-4">
            <SectionTitle>Card Product</SectionTitle>
            <CardProductElement
              imageSrc={sephoraAssets.newArrivals[0]}
              name="Pandora Sparkling Heart"
              price="$225.00"
              oldPrice="$335.00"
              seller="Pandora"
              colors={[
                { id: 'gold', name: 'Gold', hex: 'rgb(var(--color-payment-mastercard))' },
                { id: 'silver', name: 'Silver', hex: 'rgb(var(--color-stroke))' }
              ]}
              sizes={[
                { id: 's', label: 'S' },
                { id: 'm', label: 'M' }
              ]}
              variants={[
                { colorId: 'gold', sizeId: 's', stock: 4 },
                { colorId: 'gold', sizeId: 'm', stock: 2 },
                { colorId: 'silver', sizeId: 's', stock: 0 },
                { colorId: 'silver', sizeId: 'm', stock: 5 }
              ]}
              mode={cardMode}
            />
          </div>

          <div className="space-y-4">
            <SectionTitle>Card Product</SectionTitle>
            <CardProductElement
              imageSrc={sephoraAssets.newArrivals[1]}
              name="Pandora Sparkling Heart"
              price="$225.00"
              oldPrice="$335.00"
              seller="Pandora"
              colors={[
                { id: 'green', name: 'Green', hex: 'rgb(var(--color-mint))' },
                { id: 'blue', name: 'Blue', hex: 'rgb(var(--color-payment-visa))' },
                { id: 'red', name: 'Red', hex: 'rgb(var(--color-danger))' }
              ]}
              sizes={[
                { id: 'xs', label: 'XS' },
                { id: 's', label: 'S' },
                { id: 'm', label: 'M' }
              ]}
              variants={[
                { colorId: 'green', sizeId: 'xs', stock: 0 },
                { colorId: 'green', sizeId: 's', stock: 2 },
                { colorId: 'green', sizeId: 'm', stock: 1 },
                { colorId: 'blue', sizeId: 'xs', stock: 3 },
                { colorId: 'blue', sizeId: 's', stock: 0 },
                { colorId: 'blue', sizeId: 'm', stock: 5 },
                { colorId: 'red', sizeId: 'xs', stock: 1 },
                { colorId: 'red', sizeId: 's', stock: 0 },
                { colorId: 'red', sizeId: 'm', stock: 0 }
              ]}
              mode={cardMode}
            />
          </div>

          <div className="grid gap-8 2xl:grid-cols-[334px_324px]">
            <div className="space-y-4">
              <SectionTitle>Categories Card</SectionTitle>
              <CategoriesCardElement
                firstImageSrc={sephoraAssets.categories.heroIcons[2]}
                secondImageSrc={sephoraAssets.categories.heroIcons[3]}
              />
            </div>

            <div className="space-y-4">
              <SectionTitle>Brand Card</SectionTitle>
              <BrandCardElement firstImageSrc={sephoraAssets.instagram[2]} secondImageSrc={sephoraAssets.instagram[3]} />
            </div>
          </div>
        </section>

        <section className="grid gap-10 xl:grid-cols-[840px_1fr]">
          <div className="space-y-4">
            <SectionTitle>Banner</SectionTitle>
            <BannerCardElement
              imageSrc={sephoraAssets.promotionalBanners[0]}
              heading="Sale up to 50%"
              subheading="Up to 50% off on select items"
            />
          </div>

          <div className="space-y-4">
            <SectionTitle>Instagram Card</SectionTitle>
            <div className="flex gap-2">
              <InstagramCardElement imageSrc={sephoraAssets.instagram[4]} />
              <InstagramCardElement imageSrc={sephoraAssets.instagram[5]} showOverlay />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Feedback Card</SectionTitle>
          <FeedbackCardElement
            avatarSrc={sephoraAssets.testimonials[0]}
            name="Jane Cooper"
            role="Customer"
            message="'Any of Conscious Skincare’s mature range will do the trick for wintry months. They are called moisturisers, but that’s an understatement!'"
          />
        </section>
      </div>
    </main>
  );
}
