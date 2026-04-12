import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CaretDown,
  FacebookLogo,
  GlobeHemisphereWest,
  Heart,
  InstagramLogo,
  List,
  MagnifyingGlass,
  Percent,
  ShoppingCart,
  Star,
  TiktokLogo,
  User,
  YoutubeLogo
} from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { BrandArc } from '../shared/BrandArc';
import { quickActionToneClassByKey } from '../../design/variantMaps';

export type HeaderVariant = 'search-centered' | 'mega-search' | 'sticky-compact';

type EcommerceHeaderProps = {
  variant?: HeaderVariant;
  previewMode?: boolean;
};

type MenuGroup = {
  title: string;
  links: string[];
};

const categoryNav = ['Skincare', 'Makeup', 'Hair', 'Body', 'Fragrance', 'Gift Sets'];

const languageOptions = [
  { code: 'EN', label: 'English', flag: '🇺🇸' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦' },
];

const quickActionButtons = [
  { key: 'best-selling', label: 'Best Selling' },
  { key: 'top-categories', label: 'Top Categories' },
  { key: 'new-arrival', label: 'New Arrival' },
  { key: 'bundles', label: 'Bundles' },
  { key: 'luxury-product', label: 'Luxury Product' },
  { key: 'hot-sale', label: 'Hot Sale' }
] as const;

type QuickActionItem = (typeof quickActionButtons)[number];

const megaMenuData: Record<string, MenuGroup[]> = {
  Skincare: [
    { title: 'Shop by Type', links: ['Cleansers', 'Serums', 'Moisturizers', 'Sunscreen'] },
    { title: 'Skin Concerns', links: ['Acne', 'Dryness', 'Dark Spots', 'Anti Aging'] },
    { title: 'Featured', links: ['Korean Favorites', 'Derm Picks', 'Travel Minis', 'Gift Sets'] }
  ],
  Makeup: [
    { title: 'Face', links: ['Foundation', 'Concealer', 'Powder', 'Blush'] },
    { title: 'Eyes', links: ['Mascara', 'Liner', 'Palettes', 'Brows'] },
    { title: 'Lips', links: ['Lipstick', 'Gloss', 'Tint', 'Liner'] }
  ],
  Hair: [
    { title: 'Care', links: ['Shampoo', 'Conditioner', 'Masks', 'Scalp Care'] },
    { title: 'Styling', links: ['Heat Protect', 'Creams', 'Sprays', 'Oils'] },
    { title: 'Treatment', links: ['Repair', 'Volume', 'Curl Care', 'Color Safe'] }
  ],
  Body: [
    { title: 'Bath', links: ['Body Wash', 'Scrubs', 'Soaps', 'Bath Oils'] },
    { title: 'Moisture', links: ['Lotions', 'Creams', 'Body Butter', 'Balms'] },
    { title: 'Care', links: ['Hand Care', 'Foot Care', 'Deodorant', 'SPF Body'] }
  ],
  Fragrance: [
    { title: 'Women', links: ['Floral', 'Fresh', 'Sweet', 'Woody'] },
    { title: 'Men', links: ['Citrus', 'Aromatic', 'Amber', 'Leather'] },
    { title: 'Format', links: ['EDP', 'EDT', 'Travel Spray', 'Discovery Sets'] }
  ],
  'Gift Sets': [
    { title: 'By Budget', links: ['Under $25', 'Under $50', 'Under $100', 'Luxury Gifts'] },
    { title: 'By Occasion', links: ['Birthday', 'Anniversary', 'Holiday', 'Thank You'] },
    { title: 'By Category', links: ['Skincare Kits', 'Makeup Kits', 'Fragrance Gifts', 'Body Gifts'] }
  ]
};

function MenuIcon() {
  return <List size={18} weight="regular" aria-hidden />;
}

function ChevronDownIcon() {
  return <CaretDown size={14} weight="bold" aria-hidden />;
}

function TopUtilityBar() {
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex h-10 max-w-site items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 text-token-micro font-semibold uppercase tracking-token-16 text-white/82">
          <p>Free shipping over $50</p>
          <span className="hidden h-1 w-1 rounded-full bg-white/35 md:block" />
          <p className="hidden md:block">15,000+ products</p>
          <span className="hidden h-1 w-1 rounded-full bg-white/35 md:block" />
          <p className="hidden md:block">Official brands and weekly deals</p>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#" aria-label="Facebook" className="transition hover:text-white/70"><FacebookLogo size={13} weight="fill" /></a>
          <a href="#" aria-label="Instagram" className="transition hover:text-white/70"><InstagramLogo size={13} weight="fill" /></a>
          <a href="#" aria-label="YouTube" className="transition hover:text-white/70"><YoutubeLogo size={13} weight="fill" /></a>
          <a href="#" aria-label="TikTok" className="transition hover:text-white/70"><TiktokLogo size={13} weight="fill" /></a>
        </div>
      </div>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#" className="inline-flex flex-col leading-none">
      <span className={cn('font-display text-token-brand-mark font-semibold tracking-token-tight-logo text-fg transition-all duration-300', compact ? 'text-token-brand-mark-compact' : '')}>
        REAL
      </span>
      <span className="text-token-brand-sub font-semibold uppercase tracking-token-32 text-muted">beauty market</span>
    </a>
  );
}

function SearchField({ placeholder = 'Search brands, products, ingredients, concerns...' }: { placeholder?: string }) {
  return (
    <label className="relative flex h-12 w-full items-center gap-3 overflow-hidden rounded-full border border-stroke bg-white px-4 text-muted shadow-elevation-02 transition focus-within:border-brand/45 focus-within:shadow-elevation-04">
      <span className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-search-right-highlight" />
      <span className="pointer-events-none absolute left-4 top-0 h-px w-16 bg-search-top-highlight" />
      <MagnifyingGlass size={18} weight="regular" className="text-muted" />
      <input
        placeholder={placeholder}
        className="relative z-10 w-full border-0 bg-transparent text-sm font-medium text-fg outline-none placeholder:text-muted/75"
      />
    </label>
  );
}

function ActionIcon({ children, count, label }: { children: ReactNode; count?: number; label: string }) {
  return (
    <button
      type="button"
      aria-label={count ? `${label} (${count})` : label}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-transparent text-fg transition hover:border-stroke hover:bg-white/80 hover:text-brand"
    >
      {children}
      {count ? (
        <span className="absolute right-0 top-0 grid h-4.5 min-w-4.5 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-brand px-1 text-token-micro font-semibold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-1.5 text-token-xxs font-semibold uppercase tracking-token-14 text-fg transition hover:text-brand"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <GlobeHemisphereWest size={18} weight="regular" />
        <span>{selectedLanguage.flag}</span>
        <span>{selectedLanguage.code}</span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-layer-floating min-w-menu rounded-xl border border-stroke bg-surface py-1 shadow-elevation-08">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-fg transition hover:bg-surface-soft"
              onClick={() => {
                setSelectedLanguage(option);
                setIsOpen(false);
              }}
            >
              <span className="font-semibold">{option.flag}</span>
              <span className="font-semibold">{option.code}</span>
              <span className="text-muted">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RightControls() {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <LanguageSwitcher />
      <button
        type="button"
        className="hidden h-9 items-center gap-1 text-token-xxs font-semibold uppercase tracking-token-14 text-fg transition hover:text-brand md:inline-flex"
      >
        USD
        <ChevronDownIcon />
      </button>
      <ActionIcon label="Account">
        <User size={21} weight="regular" />
      </ActionIcon>
      <ActionIcon label="Wishlist" count={2}>
        <Heart size={21} weight="regular" />
      </ActionIcon>
      <ActionIcon label="Cart" count={3}>
        <ShoppingCart size={21} weight="regular" />
      </ActionIcon>
    </div>
  );
}

function QuickActionRow() {
  return (
    <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 lg:px-6">
      {quickActionButtons.map((item) => (
        <a
          key={item.key}
          href="#"
          className={cn(
            'inline-flex h-8 items-center gap-1 text-token-xxs font-semibold uppercase tracking-token-14 transition hover:opacity-75',
            quickActionToneClassByKey[item.key]
          )}
        >
          {item.key === 'luxury-product' ? <Star size={12} weight="fill" aria-hidden /> : null}
          {item.key === 'hot-sale' ? <Percent size={12} weight="bold" aria-hidden /> : null}
          {item.label}
        </a>
      ))}
    </div>
  );
}

function QuickActionPill({ item }: { item: QuickActionItem }) {
  return (
    <a
      href="#"
      className={cn(
        'inline-flex h-8 items-center gap-1 px-2 text-token-xxs font-semibold uppercase tracking-token-12 transition hover:underline',
        quickActionToneClassByKey[item.key]
      )}
    >
      {item.key === 'luxury-product' ? <Star size={12} weight="fill" aria-hidden /> : null}
      {item.key === 'hot-sale' ? <Percent size={12} weight="bold" aria-hidden /> : null}
      {item.label}
    </a>
  );
}

function HeaderVariantSearchCentered() {
  return (
    <header className="w-full border-b border-stroke bg-surface">
      <TopUtilityBar />

      <div className="mx-auto flex max-w-site items-center gap-4 px-4 py-4 lg:px-6">
        <BrandMark />
        <div className="hidden flex-1 md:block">
          <SearchField />
        </div>
        <RightControls />
      </div>

      <div className="border-t border-stroke/70">
        <QuickActionRow />
      </div>
    </header>
  );
}

function HeaderVariantMegaSearch() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(categoryNav[0]);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const activeColumns = useMemo(() => megaMenuData[activeCategory] ?? megaMenuData[categoryNav[0]], [activeCategory]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!megaMenuRef.current?.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMegaMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <header className="w-full border-b border-stroke bg-surface">
      <TopUtilityBar />

      <div className="mx-auto flex max-w-site items-center gap-4 px-4 py-4 lg:px-6">
        <BrandMark />

        <div className="hidden flex-1 items-center gap-2 md:flex">
          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full border border-stroke bg-surface px-4 text-xs font-medium text-fg transition hover:border-brand/45"
            onClick={() => {
              if (!isMegaMenuOpen) {
                setActiveCategory(categoryNav[0]);
              }
              setIsMegaMenuOpen((prev) => !prev);
            }}
          >
            All Categories
            <ChevronDownIcon />
          </button>
          <SearchField placeholder="Search 5,000+ products..." />
        </div>

        <RightControls />
      </div>

      <div ref={megaMenuRef} className="border-t border-stroke/70">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-2 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {quickActionButtons.map((item) => (
              <QuickActionPill key={item.key} item={item} />
            ))}
          </div>
        </div>

        {isMegaMenuOpen ? (
          <div className="border-t border-stroke/70 bg-surface-soft">
            <div className="mx-auto grid max-w-site gap-6 px-4 py-5 lg:grid-cols-mega-menu lg:px-6">
              <nav className="space-y-1 border-r border-stroke pr-4">
                {categoryNav.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseEnter={() => setActiveCategory(item)}
                    onFocus={() => setActiveCategory(item)}
                    onClick={() => setActiveCategory(item)}
                    className={cn(
                      'flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition',
                      activeCategory === item ? 'bg-brand/10 text-fg' : 'text-muted hover:bg-surface hover:text-fg'
                    )}
                  >
                    <span>{item}</span>
                    <ChevronDownIcon />
                  </button>
                ))}
              </nav>

              <div className="grid gap-6 md:grid-cols-3">
                {activeColumns.map((group) => (
                  <section key={group.title} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-fg">{group.title}</h3>
                    <ul className="space-y-1 text-sm text-muted">
                      {group.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="transition hover:text-fg">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function HeaderVariantStickyCompact({ previewMode = false }: { previewMode?: boolean }) {
  const [activeNav, setActiveNav] = useState<string>(categoryNav[0]);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(categoryNav[0]);
  const [isScrolled, setIsScrolled] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const activeColumns = useMemo(() => megaMenuData[activeCategory] ?? megaMenuData[categoryNav[0]], [activeCategory]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const onScroll = () => setIsScrolled(window.scrollY > 24);
    const onPointerDown = (event: MouseEvent) => {
      if (!megaMenuRef.current?.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMegaMenuOpen(false);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [previewMode]);

  const compactMode = previewMode ? false : isScrolled;

  return (
    <header className={cn('w-full bg-surface/95 backdrop-blur-md', previewMode ? '' : 'sticky top-0 z-layer-floating')}>
      <TopUtilityBar />

      <div className="border-b border-stroke/80">
        <div className={cn('mx-auto flex max-w-site items-center gap-3 px-4 transition-all duration-300 lg:px-6', compactMode ? 'py-3' : 'py-4')}>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-stroke bg-white/85 px-4 text-token-xxs font-semibold uppercase tracking-token-14 text-fg transition hover:border-brand/45 hover:bg-white"
            onClick={() => {
              if (!isMegaMenuOpen) {
                setActiveCategory(categoryNav[0]);
              }
              setIsMegaMenuOpen((prev) => !prev);
            }}
          >
            <MenuIcon />
            All Departments
            <ChevronDownIcon />
          </button>

          <BrandMark compact={compactMode} />

          <div className="hidden flex-1 md:block">
            <SearchField placeholder="Search skincare, makeup, fragrance, brands..." />
          </div>

          <RightControls />
        </div>
        <div className="px-4 pb-3 md:hidden">
          <SearchField placeholder="Search skincare, makeup, fragrance..." />
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-b border-stroke/70 transition-all duration-300',
          compactMode ? 'max-h-0 border-b-0 opacity-0' : 'max-h-28 opacity-100'
        )}
      >
        <div className="mx-auto hidden max-w-site flex-col px-4 lg:flex lg:px-6">
          <div className="flex h-11 items-center gap-6 text-token-xxs uppercase tracking-token-14 text-muted">
            {categoryNav.map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveNav(item); }}
                className={cn(
                  'relative flex flex-col items-center transition',
                  activeNav === item ? 'text-fg' : 'hover:text-fg'
                )}
              >
                <span>{item}</span>
                {activeNav === item ? <BrandArc width={40} className="absolute -bottom-1 left-0" /> : null}
              </a>
            ))}
          </div>
          <div className="border-t border-stroke/70">
            <QuickActionRow />
          </div>
        </div>
      </div>

      {isMegaMenuOpen ? (
        <div ref={megaMenuRef} className="border-b border-stroke/70 bg-surface-soft/95 shadow-elevation-06">
          <div className="mx-auto grid max-w-site gap-6 px-4 py-6 lg:grid-cols-mega-menu lg:px-6">
            <nav className="space-y-1 border-r border-stroke pr-4">
              {categoryNav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseEnter={() => setActiveCategory(item)}
                  onFocus={() => setActiveCategory(item)}
                  onClick={() => setActiveCategory(item)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-full px-3 py-2.5 text-left text-sm font-medium transition',
                    activeCategory === item ? 'bg-white text-fg shadow-elevation-02' : 'text-muted hover:bg-surface hover:text-fg'
                  )}
                >
                  <span>{item}</span>
                  <ChevronDownIcon />
                </button>
              ))}
            </nav>

            <div className="space-y-6">
              <QuickActionRow />
              <div className="grid gap-8 md:grid-cols-3">
                {activeColumns.map((group) => (
                  <section key={group.title} className="space-y-3">
                    <h3 className="text-token-xxs font-semibold uppercase tracking-token-16 text-muted">{group.title}</h3>
                    <ul className="space-y-2 text-sm text-fg/80">
                      {group.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="transition hover:text-fg">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function EcommerceHeader({ variant = 'search-centered', previewMode = false }: EcommerceHeaderProps) {
  if (variant === 'mega-search') {
    return <HeaderVariantMegaSearch />;
  }

  if (variant === 'sticky-compact') {
    return <HeaderVariantStickyCompact previewMode={previewMode} />;
  }

  return <HeaderVariantSearchCentered />;
}
