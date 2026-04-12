import { useRef } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { sephoraAssets } from '../assets/sephoraAssets';
import { cn } from '../lib/cn';
import { Layer } from '../ui/layer';
import { SectionHeading } from './atoms';

const categories = [
  { id: 1, name: 'Cleansers', items: '22 items', icon: sephoraAssets.categories.icons[0] },
  { id: 2, name: 'Sunscreen', items: '32 items', icon: sephoraAssets.categories.icons[1] },
  { id: 3, name: 'Masks', items: '24 items', icon: sephoraAssets.categories.icons[2] },
  { id: 4, name: 'Eye Care', items: '14 items', icon: sephoraAssets.categories.icons[3] },
  { id: 5, name: 'Moisturizers', items: '26 items', icon: sephoraAssets.categories.icons[4] }
];

export const CategoriesFilterSection = () => {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 'next' | 'prev') => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>('[data-category-card]');
    if (!firstCard) return;

    const gap = 16;
    const distance = firstCard.offsetWidth + gap;
    rail.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden border-y border-stroke/70 bg-surface-soft py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,69,128,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(44,104,255,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1320px] space-y-6 px-4 lg:px-6">
        <SectionHeading title="Shop Departments" />

        <div className="relative">
          <div
            ref={railRef}
            className="overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="grid grid-flow-col auto-cols-[85%] gap-4 sm:auto-cols-[320px] lg:auto-cols-[280px]">
              {categories.map((category) => (
                <Layer
                  key={category.id}
                  data-category-card
                  depth="e02"
                  tone="neutral"
                  className={cn(
                    'flex snap-start items-center gap-3 rounded-full p-4 pr-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-elevation-04',
                    category.id % 3 === 1 ? 'bg-[rgb(var(--color-pop-blush))]' : '',
                    category.id % 3 === 2 ? 'bg-[rgb(var(--color-premium-mist))]' : '',
                    category.id % 3 === 0 ? 'bg-white' : ''
                  )}
                >
                  <div className={cn(
                    'grid h-12 w-12 place-items-center rounded-full p-2 text-muted',
                    category.id % 3 === 1 ? 'bg-white/80' : '',
                    category.id % 3 === 2 ? 'bg-white/70' : '',
                    category.id % 3 === 0 ? 'bg-surface-soft' : ''
                  )}>
                    <img src={category.icon} alt="" className="h-7 w-7 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg">{category.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{category.items}</p>
                  </div>
                  <div className={cn(
                    'grid h-7 w-7 place-items-center rounded-full text-xs font-semibold',
                    category.id % 3 === 1 ? 'bg-brand text-white' : '',
                    category.id % 3 === 2 ? 'bg-mint text-white' : '',
                    category.id % 3 === 0 ? 'bg-sun text-fg' : ''
                  )}>&gt;</div>
                </Layer>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scrollByCard('prev')}
            className="absolute left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/65 md:grid"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scrollByCard('next')}
            className="absolute right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/65 md:grid"
          >
            <CaretRight size={20} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
};
