import { IconCart, IconHeart, IconSearch } from '../designSystem';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.6-3.2 3.1-5 6.5-5s5.9 1.8 6.5 5" />
    </svg>
  );
}

function CounterBadge({ value }: { value: number }) {
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-mint px-1 text-xs font-semibold text-white shadow-elevation-02">
      {value}
    </span>
  );
}

export default function HeaderElement() {
  const navItems = ['Home', 'Collections', 'Shop', 'Brands', 'Blog', 'Pages'];

  return (
    <header className="w-full overflow-hidden bg-surface">
      <div className="flex h-10 items-center justify-between bg-brand-strong px-8">
        <p className="text-sm font-medium text-surface-soft">Free UK Mainland delivery on orders over £50</p>
        <div className="flex items-center gap-3 text-surface-soft">
          <span className="text-xs">f</span>
          <span className="text-xs">ig</span>
          <span className="text-xs">p</span>
          <span className="text-xs">x</span>
          <span className="text-xs">t</span>
        </div>
      </div>

      <div className="flex h-24 items-center justify-between px-8">
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button key={item} type="button" className="text-xs font-medium uppercase tracking-[0.01em] text-muted">
              {item}
            </button>
          ))}
        </nav>

        <p className="font-display text-[52px] leading-none tracking-[0.02em] text-fg">SEPHORA</p>

        <div className="flex items-center gap-5 text-fg">
          <div className="flex items-center gap-2 text-sm">
            <span>US</span>
            <span>|</span>
            <span>USD</span>
          </div>
          <button type="button" className="grid h-6 w-6 place-items-center">
            <IconSearch />
          </button>
          <button type="button" className="grid h-6 w-6 place-items-center">
            <UserIcon />
          </button>
          <button type="button" className="flex items-center gap-1">
            <IconHeart />
            <CounterBadge value={3} />
          </button>
          <button type="button" className="flex items-center gap-1">
            <IconCart />
            <CounterBadge value={3} />
          </button>
        </div>
      </div>
    </header>
  );
}
