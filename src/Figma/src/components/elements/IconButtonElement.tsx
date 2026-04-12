import { ArrowsLeftRight, Eye, Heart, ShoppingCart } from '@phosphor-icons/react';
import { IconButton } from '../shared';

export default function IconButtonElement() {
  return (
    <div className="inline-flex items-start gap-6">
      <div className="rounded-md border border-dashed border-accent p-2">
        <div className="flex flex-col items-center gap-2">
          <IconButton icon={ShoppingCart} label="Add to cart" />
          <IconButton icon={ShoppingCart} label="Cart selected" active />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <IconButton icon={Eye} label="Quick view" />
        <IconButton icon={Heart} label="Add to wishlist" />
        <IconButton icon={ArrowsLeftRight} label="Compare" />
        <IconButton icon={ShoppingCart} label="Add to cart" active />
      </div>
    </div>
  );
}
