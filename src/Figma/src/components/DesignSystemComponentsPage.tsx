import { useState } from 'react';
import { Layer } from '../ui/layer';
import {
  IconArrowRight,
  IconCart,
  IconCompare,
  IconEye,
  IconHeart,
  LikeToggle,
  PaymentBadges,
  ProductActionRail,
  SearchField,
  ShopNowLink,
  StatusBadges,
  UiButton
} from './designSystem';

function CategoryPill({ active = false }: { active?: boolean }) {
  return (
    <Layer depth="e02" tone="neutral" className="flex w-[240px] items-center gap-4 rounded-full px-4 py-4">
      <div className="h-12 w-12 rounded-sm bg-stroke" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">Sunscreen</p>
        <p className="text-xs text-muted">14 items</p>
      </div>
      <div
        className={`grid h-6 w-6 place-items-center rounded-full text-xs ${active ? 'bg-mint text-white' : 'bg-mint/20 text-mint'}`}
      >
        <IconArrowRight className="h-3.5 w-3.5" />
      </div>
    </Layer>
  );
}

function BrandLogoCard() {
  return (
    <Layer depth="e02" tone="neutral" className="grid h-36 w-[280px] place-items-center rounded-md bg-surface">
      <div className="grid h-20 w-52 place-items-center bg-payment-visa text-4xl font-bold tracking-wide text-white">NIVEA</div>
    </Layer>
  );
}

export function DesignSystemComponentsPage() {
  const [liked, setLiked] = useState(false);
  const [searchOne, setSearchOne] = useState('');
  const [searchTwo, setSearchTwo] = useState('');

  return (
    <main className="min-h-screen bg-bg p-8">
      <div className="mx-auto max-w-[1320px] space-y-10">
        <header className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-fg">Components</h1>
          <p className="text-sm text-muted">Tokenized + layered commerce component set</p>
        </header>

        <Layer depth="e01" tone="soft" className="space-y-6 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-fg">Buttons</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <UiButton leftIcon={<IconCart />} rightIcon={<IconArrowRight />} variant="solid">Button</UiButton>
            <UiButton leftIcon={<IconCart />} rightIcon={<IconArrowRight />} variant="soft">Button</UiButton>
            <UiButton leftIcon={<IconCart />} rightIcon={<IconArrowRight />} variant="outline">Button</UiButton>
          </div>
          <div className="grid gap-4 md:grid-cols-[auto_auto_1fr] md:items-center">
            <LikeToggle liked={false} onClick={() => setLiked(false)} />
            <LikeToggle liked={liked} onClick={() => setLiked((prev) => !prev)} />
            <ShopNowLink />
          </div>
        </Layer>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <Layer depth="e01" tone="soft" className="space-y-4 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-fg">Badges + Rail</h2>
            <StatusBadges />
            <ProductActionRail
              items={[
                { label: 'Quick view', icon: <IconEye /> },
                { label: 'Wishlist', icon: <IconHeart /> },
                { label: 'Compare', icon: <IconCompare /> },
                { label: 'Add to cart', icon: <IconCart />, active: true }
              ]}
            />
            <PaymentBadges />
            <div className="space-y-2 pt-2">
              <SearchField value={searchOne} onChange={setSearchOne} placeholder="Placeholder" />
              <SearchField value={searchTwo} onChange={setSearchTwo} placeholder="Placeholder" />
            </div>
          </Layer>

          <Layer depth="e01" tone="soft" className="space-y-4 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-fg">Cards</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                <CategoryPill />
                <CategoryPill active />
              </div>
              <div className="space-y-3">
                <BrandLogoCard />
                <BrandLogoCard />
              </div>
            </div>
          </Layer>
        </div>
      </div>
    </main>
  );
}
