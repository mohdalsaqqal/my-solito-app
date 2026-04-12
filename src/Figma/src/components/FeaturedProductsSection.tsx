import { sephoraAssets } from '../assets/sephoraAssets';
import { sectionActionLinkClass } from '../design/variantMaps';
import { CarouselButton, ProductCard, SectionHeading } from './atoms';

const sizeSet = [
  { id: '30ml', label: '30ml' },
  { id: '75ml', label: '75ml' },
  { id: '150ml', label: '150ml' }
];

const products = [
  {
    id: 1,
    name: 'Nivea Body Milk 400ml',
    price: '$65.00',
    originalPrice: '$105.00',
    badges: ['sale'] as const,
    image: sephoraAssets.featured[0],
    rating: { value: 4.8, count: 1930 },
    seller: 'Nivea Official',
    deliveryText: 'Free delivery by Tue',
    description: 'Daily body lotion with lightweight moisture lock technology.',
    colors: [
      { id: 'light', name: 'Light', hex: '#9bb7df' },
      { id: 'classic', name: 'Classic', hex: '#6b8ec4' },
      { id: 'deep', name: 'Deep', hex: '#3d5f95' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'classic', sizeId: '75ml' },
    variants: [
      { colorId: 'light', sizeId: '30ml', stock: 6 },
      { colorId: 'light', sizeId: '75ml', stock: 5 },
      { colorId: 'light', sizeId: '150ml', stock: 2 },
      { colorId: 'classic', sizeId: '30ml', stock: 9 },
      { colorId: 'classic', sizeId: '75ml', stock: 12 },
      { colorId: 'classic', sizeId: '150ml', stock: 6 },
      { colorId: 'deep', sizeId: '30ml', stock: 0 },
      { colorId: 'deep', sizeId: '75ml', stock: 3 },
      { colorId: 'deep', sizeId: '150ml', stock: 0 }
    ]
  },
  {
    id: 2,
    name: 'Dove Gentle Body Wash 530g',
    price: '$45.00',
    originalPrice: '$95.00',
    badges: ['new', 'sale'] as const,
    image: sephoraAssets.featured[1],
    rating: { value: 4.5, count: 954 },
    seller: 'Dove Official',
    deliveryText: 'Delivery by Thu',
    description: 'Smooth cleansing texture with a skin-soft finish.',
    colors: [
      { id: 'fresh', name: 'Fresh', hex: '#d6e2f7' },
      { id: 'clean', name: 'Clean', hex: '#b9cae8' },
      { id: 'silk', name: 'Silk', hex: '#92abd8' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'clean', sizeId: '75ml' },
    variants: [
      { colorId: 'fresh', sizeId: '30ml', stock: 8 },
      { colorId: 'fresh', sizeId: '75ml', stock: 7 },
      { colorId: 'fresh', sizeId: '150ml', stock: 4 },
      { colorId: 'clean', sizeId: '30ml', stock: 10 },
      { colorId: 'clean', sizeId: '75ml', stock: 14 },
      { colorId: 'clean', sizeId: '150ml', stock: 8 },
      { colorId: 'silk', sizeId: '30ml', stock: 2 },
      { colorId: 'silk', sizeId: '75ml', stock: 1 },
      { colorId: 'silk', sizeId: '150ml', stock: 0 }
    ]
  },
  {
    id: 3,
    name: 'Vaseline Brightening Sunscreen 300ml',
    price: '$35.00',
    badges: ['bestseller'] as const,
    image: sephoraAssets.featured[2],
    rating: { value: 4.6, count: 1422 },
    seller: 'Vaseline Official',
    deliveryText: 'Free delivery by Wed',
    description: 'Daily brightening lotion with SPF support.'
  },
  {
    id: 4,
    name: 'CeraVe Facial Cleanser 160ml',
    price: '$45.00',
    originalPrice: '$75.00',
    badges: ['sale'] as const,
    image: sephoraAssets.featured[3],
    rating: { value: 4.9, count: 2470 },
    seller: 'CeraVe Official',
    deliveryText: 'Express by Tue',
    description: 'Barrier-safe cleanser designed for sensitive skin.',
    colors: [
      { id: 'gentle', name: 'Gentle', hex: '#dfe6f4' },
      { id: 'daily', name: 'Daily', hex: '#bccbe6' },
      { id: 'renew', name: 'Renew', hex: '#8fa7cc' }
    ],
    sizes: sizeSet,
    defaultVariant: { colorId: 'daily', sizeId: '75ml' },
    variants: [
      { colorId: 'gentle', sizeId: '30ml', stock: 7 },
      { colorId: 'gentle', sizeId: '75ml', stock: 10 },
      { colorId: 'gentle', sizeId: '150ml', stock: 3 },
      { colorId: 'daily', sizeId: '30ml', stock: 12 },
      { colorId: 'daily', sizeId: '75ml', stock: 15 },
      { colorId: 'daily', sizeId: '150ml', stock: 11 },
      { colorId: 'renew', sizeId: '30ml', stock: 3 },
      { colorId: 'renew', sizeId: '75ml', stock: 2 },
      { colorId: 'renew', sizeId: '150ml', stock: 0 }
    ]
  },
  {
    id: 5,
    name: 'Declare Sunscreen 50+ 150ml',
    price: '$105.00',
    badges: ['new'] as const,
    image: sephoraAssets.featured[4],
    rating: { value: 4.7, count: 689 },
    seller: 'Declare Official',
    deliveryText: 'Delivery by Thu',
    description: 'High UVA/UVB protection with non-greasy texture.'
  }
];

export const FeaturedProductsSection = () => {
  return (
    <section className="bg-bg py-10">
      <div className="mx-auto max-w-site space-y-6 px-4 lg:px-6">
        <div className="grid gap-3 sm:grid-cols-section-head-wide sm:items-center">
          <div className="hidden sm:block" />
          <div>
            <SectionHeading title="Shop Featured Products" />
          </div>
          <a
            href="#"
            className={`${sectionActionLinkClass} sm:justify-self-end`}
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
