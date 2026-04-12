import { useMemo, useState } from 'react';

type AssetItem = {
  file: string;
  src: string;
};

const assets = import.meta.glob('../assets/sephora-fig/images-labeled/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const assetItems: AssetItem[] = Object.entries(assets)
  .map(([path, src]) => ({ file: path.split('/').pop() ?? path, src }))
  .sort((a, b) => a.file.localeCompare(b.file));

export function AssetGalleryPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return assetItems;
    }

    const q = query.trim().toLowerCase();
    return assetItems.filter((item) => item.file.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-bg px-4 py-6 text-fg lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl uppercase">Asset Gallery</h1>
            <p className="text-sm text-muted">
              Extracted from `Sephora-Placeholder.fig` - {filtered.length} assets shown
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search hash..."
              className="h-10 w-64 rounded-md border border-stroke bg-surface px-3 text-sm outline-none"
            />
            <a href="/" className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white">
              Back To Page
            </a>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <article key={item.file} className="overflow-hidden rounded-lg border border-stroke bg-surface shadow-surface">
              <a href={item.src} target="_blank" rel="noreferrer" className="block bg-surface-soft">
                <img src={item.src} alt={item.file} className="h-40 w-full object-cover" loading="lazy" />
              </a>
              <div className="space-y-2 p-2">
                <p className="truncate text-[11px] text-muted" title={item.file}>
                  {item.file}
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(item.src)}
                  className="w-full rounded border border-stroke px-2 py-1 text-[11px]"
                >
                  Copy URL
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
