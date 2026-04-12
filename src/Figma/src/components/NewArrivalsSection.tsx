import { sephoraAssets } from '../assets/sephoraAssets';
import { CarouselButton, ProductCard, SectionHeading } from './atoms';

const sizeSet = [
  { id: '30ml', label: '30ml' },
  { id: '50ml', label: '50ml' },
  { id: '100ml', label: '100ml' }
];

const products = [
  {
    id: 1,
    name: 'Bioderma Sunscreen 40ml',
    price: '$125.00',
    originalPrice: '$155.00',
    badges: ['new', 'sale'] as const,
    image: sephoraAssets.newArrivals[0],
    rating: { value: 4.9, count: 2184 },
    seller: 'Bioderma Official',
    deliveryText: 'Free delivery by Tue',
    description: 'Lightweight SPF with invisible finish for daily wear.',
    colors: [
      { id: 'clear', name: 'Clear', hex: '#f5e7c8' },
      { id: 'sand', name: 'Sand', hex: '#e3bf90' },
      { id: 'golden', name: 'Golden', hex: '#cd9f58' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'sand', sizeId: '50ml' },
    variants: [
      { colorId: 'clear', sizeId: '30ml', stock: 2 },
      { colorId: 'clear', sizeId: '50ml', stock: 4 },
      { colorId: 'clear', sizeId: '100ml', stock: 0 },
      { colorId: 'sand', sizeId: '30ml', stock: 6 },
      { colorId: 'sand', sizeId: '50ml', stock: 12 },
      { colorId: 'sand', sizeId: '100ml', stock: 7 },
      { colorId: 'golden', sizeId: '30ml', stock: 3 },
      { colorId: 'golden', sizeId: '50ml', stock: 0 },
      { colorId: 'golden', sizeId: '100ml', stock: 2 }
    ]
  },
  {
    id: 2,
    name: 'Pantene PRO-V 2in1 355ml',
    price: '$35.00',
    badges: ['new'] as const,
    image: sephoraAssets.newArrivals[1],
    rating: { value: 4.6, count: 802 },
    seller: 'Pantene Store',
    deliveryText: 'Delivery by Wed',
    description: 'Nourishing shampoo + conditioner combo for daily shine.'
  },
  {
    id: 3,
    name: 'Lancome Sunscreen 40ml',
    price: '$105.00',
    badges: ['bestseller'] as const,
    image: sephoraAssets.newArrivals[2],
    rating: { value: 4.8, count: 1321 },
    seller: 'Lancome Official',
    deliveryText: 'Express by Tue',
    description: 'High-protection sunscreen with soft matte texture.',
    colors: [
      { id: 'porcelain', name: 'Porcelain', hex: '#f3ddbf' },
      { id: 'warm', name: 'Warm Beige', hex: '#ddb081' },
      { id: 'tan', name: 'Tan', hex: '#c28552' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'porcelain', sizeId: '30ml' },
    variants: [
      { colorId: 'porcelain', sizeId: '30ml', stock: 14 },
      { colorId: 'porcelain', sizeId: '50ml', stock: 9 },
      { colorId: 'porcelain', sizeId: '100ml', stock: 2 },
      { colorId: 'warm', sizeId: '30ml', stock: 8 },
      { colorId: 'warm', sizeId: '50ml', stock: 4 },
      { colorId: 'warm', sizeId: '100ml', stock: 0 },
      { colorId: 'tan', sizeId: '30ml', stock: 2 },
      { colorId: 'tan', sizeId: '50ml', stock: 0 },
      { colorId: 'tan', sizeId: '100ml', stock: 0 }
    ]
  },
  {
    id: 4,
    name: 'Nivea Refreshing Face Wash 150ml',
    price: '$115.00',
    originalPrice: '$125.00',
    badges: ['new', 'sale'] as const,
    image: sephoraAssets.newArrivals[3],
    rating: { value: 4.5, count: 640 },
    seller: 'Nivea Official',
    deliveryText: 'Free delivery by Thu',
    description: 'Refreshing gel cleanser for normal and combination skin.',
    colors: [
      { id: 'fresh', name: 'Fresh', hex: '#7dc3f2' },
      { id: 'deep', name: 'Deep Clean', hex: '#4f8fcb' },
      { id: 'cool', name: 'Cool Aqua', hex: '#2f6ba0' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'fresh', sizeId: '50ml' },
    variants: [
      { colorId: 'fresh', sizeId: '30ml', stock: 8 },
      { colorId: 'fresh', sizeId: '50ml', stock: 15 },
      { colorId: 'fresh', sizeId: '100ml', stock: 7 },
      { colorId: 'deep', sizeId: '30ml', stock: 5 },
      { colorId: 'deep', sizeId: '50ml', stock: 3 },
      { colorId: 'deep', sizeId: '100ml', stock: 0 },
      { colorId: 'cool', sizeId: '30ml', stock: 0 },
      { colorId: 'cool', sizeId: '50ml', stock: 5 },
      { colorId: 'cool', sizeId: '100ml', stock: 1 }
    ]
  },
  {
    id: 5,
    name: 'Nivea Creme Soft Milk 250ml',
    price: '$95.00',
    badges: ['limited'] as const,
    image: sephoraAssets.newArrivals[4],
    rating: { value: 4.7, count: 1120 },
    seller: 'Nivea Official',
    deliveryText: 'Delivery by Wed',
    description: 'Soft body milk lotion with deep hydration feel.'
  }
];

export const NewArrivalsSection = () => {
  return (
    <section className="bg-bg py-10">
      <div className="mx-auto max-w-[1320px] space-y-6 px-4 lg:px-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="hidden sm:block" />
          <div>
            <SectionHeading title="Enjoy New Arrivals" />
          </div>
          <a
            href="#"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-fg transition hover:text-brand hover:underline sm:justify-self-end"
          >
            Shop All
          </a>
        </div>

        <div className="relative">
          <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                badges={[...product.badges]}
                imageSrc={product.image}
                rating={product.rating}
                colors={product.colors}
                sizes={product.sizes}
                variants={product.variants}
                defaultVariant={product.defaultVariant}
                seller={product.seller}
                deliveryText={product.deliveryText}
                description={product.description}
              />
            ))}
          </div>

          <CarouselButton direction="left" className="absolute -left-3 top-1/3 hidden lg:grid" />
          <CarouselButton direction="right" className="absolute -right-3 top-1/3 hidden lg:grid" />
        </div>
      </div>
    </section>
  );
};
