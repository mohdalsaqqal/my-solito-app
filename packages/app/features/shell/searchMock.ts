export type SearchSuggestion = {
  id: string
  label: string
  type: 'product' | 'category' | 'brand'
  href: string
  imageUrl?: string
  brandName?: string
  productName?: string
  price?: number
  compareAtPrice?: number
  discountLabel?: string
}

export type SearchDiscovery = {
  trendingSearches: string[]
  popularBrands: string[]
}

export type SearchPayload = {
  suggestions: SearchSuggestion[]
  discovery: SearchDiscovery
}

const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  {
    id: 'p-1',
    label: 'Feather-Flamingo S For Shaving Facial Body Hair - 3 Pieces',
    type: 'product',
    href: '/product/feather-flamingo-s',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=80&h=80&q=80',
    brandName: 'Feather-Flamingo',
    productName: 'S For Shaving Facial Body Hair - 3 Pieces',
    price: 10,
    compareAtPrice: 18,
    discountLabel: '-44%',
  },
  {
    id: 'p-2',
    label: 'IGK Expensive Hi-Shine Gloss Treatment',
    type: 'product',
    href: '/product/igk-expensive-hi-shine-gloss-treatment',
    imageUrl: 'https://images.unsplash.com/photo-1626015365107-2c06f0d654ad?auto=format&fit=crop&w=80&h=80&q=80',
    brandName: 'IGK',
    productName: 'Expensive Hi-Shine Gloss Treatment',
    price: 28,
  },
  {
    id: 'p-3',
    label: 'Fenty Beauty Gloss Bomb Stix High-Shine Gloss Stick',
    type: 'product',
    href: '/product/fenty-gloss-bomb-stix',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=80&h=80&q=80',
    brandName: 'Fenty Beauty',
    productName: 'Gloss Bomb Stix High-Shine Gloss Stick',
    price: 24,
  },
  {
    id: 'p-4',
    label: 'Yves Saint Laurent Libre Berry Crush Eau De Parfum',
    type: 'product',
    href: '/product/ysl-libre-berry-crush',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=80&h=80&q=80',
    brandName: 'Yves Saint Laurent',
    productName: 'Libre Berry Crush Eau De Parfum',
    price: 42,
  },
  { id: 's-1', label: 'hi gloss treatment', type: 'category', href: '/shop?categories=haircare' },
  { id: 's-2', label: 'hi shine gloss', type: 'category', href: '/shop?categories=haircare' },
  { id: 's-3', label: 'hi mask', type: 'category', href: '/shop?categories=skincare' },
  { id: 's-4', label: 'hi gloss', type: 'category', href: '/shop?categories=makeup' },
  { id: 'b-1', label: 'Huda Beauty', type: 'brand', href: '/brands/huda-beauty' },
  { id: 'b-2', label: 'Dior', type: 'brand', href: '/brands/dior' },
  { id: 'b-3', label: 'Rare Beauty', type: 'brand', href: '/brands/rare-beauty' },
]

const MOCK_DISCOVERY: SearchDiscovery = {
  trendingSearches: ['berry lip', 'spf 50', 'niacinamide', 'hair mist', 'vitamin c serum'],
  popularBrands: ['Dior', 'Yves Saint Laurent', 'Huda Beauty', 'Fenty Beauty', 'Rare Beauty'],
}

export async function fetchSearchSuggestionsMock(query: string): Promise<SearchSuggestion[]> {
  // Simulate async BFF behavior while keeping local mock source.
  await new Promise((resolve) => setTimeout(resolve, 140))

  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return MOCK_SUGGESTIONS.filter((item) => {
    const target = [item.label, item.brandName, item.productName].filter(Boolean).join(' ').toLowerCase()
    return target.includes(normalized)
  }).slice(0, 10)
}

export async function fetchSearchPayloadMock(query: string): Promise<SearchPayload> {
  const suggestions = await fetchSearchSuggestionsMock(query)
  return {
    suggestions,
    discovery: MOCK_DISCOVERY,
  }
}
