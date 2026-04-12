import { Layer } from '../ui/layer';
import { EcommerceHeader, type HeaderVariant } from './headers/EcommerceHeader';

const variants: Array<{
  id: HeaderVariant;
  title: string;
  description: string;
}> = [
  {
    id: 'search-centered',
    title: 'Option A: Large Center Search',
    description: 'Best balance for search-first UX while keeping nav and promo visible.'
  },
  {
    id: 'mega-search',
    title: 'Option B: Left Mega Search',
    description: 'Strongest search dominance with category dropdown + dedicated search CTA.'
  },
  {
    id: 'sticky-compact',
    title: 'Option C: Sticky Compact Search',
    description: 'Persistent sticky behavior that keeps search reachable while scrolling.'
  }
];

export function HeaderVariantsPage() {
  return (
    <main className="min-h-screen bg-bg p-8">
      <div className="mx-auto max-w-[1460px] space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-fg">Header Variants</h1>
          <p className="text-sm text-muted">Compare the three ecommerce header options and pick one for finalization.</p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand"
          >
            Back Home
          </a>
          {variants.map((variant) => (
            <a
              key={variant.id}
              href={`/?header=${variant.id}`}
              className="rounded-full border border-stroke bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-fg transition hover:border-brand/45 hover:bg-brand/10"
            >
              Preview {variant.id.replace('-', ' ')}
            </a>
          ))}
        </div>

        <div className="space-y-10 pb-8">
          {variants.map((variant) => (
            <section key={variant.id} className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-fg">{variant.title}</h2>
                <p className="text-sm text-muted">{variant.description}</p>
              </div>

              <Layer depth="e02" tone="soft" className="overflow-hidden rounded-2xl">
                <EcommerceHeader variant={variant.id} previewMode />
              </Layer>

              <a
                href={`/?header=${variant.id}`}
                className="inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-strong"
              >
                Use This On Home Preview
              </a>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
