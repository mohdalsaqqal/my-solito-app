import { Layer } from '../ui/layer';

const products = [
  { name: 'Hydrating Serum', price: '$42', tone: 'Dewy Finish' },
  { name: 'Velvet Lip Stain', price: '$31', tone: 'Cherry Smoke' },
  { name: 'Radiance Primer', price: '$38', tone: 'Soft Focus' },
  { name: 'Noir Mascara', price: '$29', tone: 'Volume Lift' }
];

export function SephoraPlaceholder() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-9rem] top-[-7rem] h-72 w-72 rounded-full bg-brand/16 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-brand-strong/14 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 md:px-8 md:pt-8">
        <Layer tone="brand" depth="floating" className="rounded-md px-4 py-2 text-center text-xs font-semibold uppercase tracking-luxe">
          New Drop: Rouge Layer Collection - Limited Shelf Window
        </Layer>

        <header className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-muted">Sephora Placeholder</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-5xl">Build Your Signature Beauty Stack</h1>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-luxe text-muted">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Tokenized + Layered UI
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Layer depth="raised" tone="neutral" className="relative overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgb(var(--color-danger)/0.16),transparent_56%)]" />
            <div className="relative grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-end">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-luxe text-muted">Campaign 03</p>
                <h2 className="font-display text-2xl md:text-4xl">Luminous Routine, Layer by Layer</h2>
                <p className="max-w-md text-sm leading-6 text-muted">
                  A composable beauty block that mirrors a layered UI architecture: foundation surface, elevated cards,
                  and floating actions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-contrast transition hover:bg-brand-strong">
                    Shop Collection
                  </button>
                  <button className="rounded-md border border-stroke bg-surface px-4 py-2 text-sm font-medium transition hover:border-brand/45">
                    View Routine
                  </button>
                </div>
              </div>

              <Layer depth="floating" tone="glass" className="grid h-60 place-items-center rounded-lg p-6 md:h-72">
                <div className="h-full w-full rounded-md border border-dashed border-brand/30 bg-white/45" />
              </Layer>
            </div>
          </Layer>

          <Layer depth="base" tone="soft" className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl">Routine Builder</h3>
              <span className="text-xs uppercase tracking-luxe text-muted">4 Steps</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-stroke/70 bg-surface px-4 py-3">
                <p className="font-medium">Prep</p>
                <p className="text-muted">Hydrating base + pore blur primer</p>
              </div>
              <div className="rounded-lg border border-stroke/70 bg-surface px-4 py-3">
                <p className="font-medium">Color</p>
                <p className="text-muted">Soft matte tint with velvet blend</p>
              </div>
              <div className="rounded-lg border border-stroke/70 bg-surface px-4 py-3">
                <p className="font-medium">Finish</p>
                <p className="text-muted">Seal with lightweight glow setting mist</p>
              </div>
            </div>
          </Layer>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item) => (
            <Layer key={item.name} depth="raised" tone="neutral" className="group p-4 transition hover:-translate-y-1">
              <div className="mb-4 h-36 rounded-lg border border-dashed border-brand/25 bg-gradient-to-b from-brand/10 to-transparent" />
              <p className="text-sm text-muted">{item.tone}</p>
              <h3 className="mt-1 font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm font-medium text-brand-strong">{item.price}</p>
            </Layer>
          ))}
        </section>
      </section>
    </main>
  );
}
