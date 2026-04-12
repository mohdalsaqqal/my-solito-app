import { ProductCard, type ProductCardMode } from '../../atoms';

type BadgeType = 'new' | 'sale' | 'bestseller' | 'limited';
type RatingMeta = {
  value: number;
  count: number;
};
type ColorOption = {
  id: string;
  name: string;
  hex: string;
};
type SizeOption = {
  id: string;
  label: string;
};
type VariantAvailability = {
  colorId: string;
  sizeId: string;
  stock: number;
};

type CardProductElementProps = {
  imageSrc: string;
  name: string;
  price: string;
  oldPrice: string;
  badges?: BadgeType[];
  rating?: RatingMeta;
  colors?: ColorOption[];
  sizes?: SizeOption[];
  variants?: VariantAvailability[];
  defaultVariant?: {
    colorId: string;
    sizeId: string;
  };
  seller?: string;
  deliveryText?: string;
  description?: string;
  mode?: ProductCardMode;
};

export default function CardProductElement({
  imageSrc,
  name,
  price,
  oldPrice,
  badges = ['new', 'sale'],
  rating,
  colors,
  sizes,
  variants,
  defaultVariant,
  seller,
  deliveryText,
  description,
  mode
}: CardProductElementProps) {
  return (
    <div className="w-full max-w-[334px]">
      <ProductCard
        name={name}
        price={price}
        originalPrice={oldPrice}
        badges={badges}
        imageSrc={imageSrc}
        imageAlt={name}
        rating={rating}
        colors={colors}
        sizes={sizes}
        variants={variants}
        defaultVariant={defaultVariant}
        seller={seller}
        deliveryText={deliveryText}
        description={description}
        mode={mode}
      />
    </div>
  );
}
