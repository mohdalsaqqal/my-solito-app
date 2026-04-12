import React, { useState } from 'react';
import { Star, Heart, Eye, Share2, Check } from 'lucide-react';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Price } from '../primitives/Price';
import { QuickViewModal } from './QuickViewModal';
import { useCart } from '../context/CartContext';
import { cn } from '../primitives/Button';

export interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isLimited?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'flash';
  className?: string;
  onClick?: () => void;
}

export const ProductCard = ({ product, variant = 'default', className, onClick }: ProductCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      addToCart(`Added ${product.name} to basket`);
      setIsAdding(false);
    }, 500);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?product=${product.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const buttonStyles = variant === 'flash' 
    ? "bg-red-600 hover:bg-red-700 shadow-red-500/30" 
    : "bg-black hover:bg-secondary";

  return (
    <>
      <div 
        className={cn("group relative bg-white flex flex-col h-full cursor-pointer", className)}
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4">
          {/* Badges - Top Left */}
          <div className="absolute top-0 left-0 z-10 flex flex-col gap-1 p-2">
            {product.isNew && <Badge className="bg-black text-white rounded-none">New</Badge>}
            {discount > 0 && <Badge className="bg-secondary text-white rounded-none">-{discount}%</Badge>}
            {product.isLimited && <Badge className="bg-orange-500 text-white rounded-none">Limited</Badge>}
          </div>

          {/* Wishlist - Top Right */}
          <button className="absolute top-2 right-2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-gray-900 hover:text-secondary transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
            <Heart size={18} />
          </button>

          {/* Share - Below Wishlist */}
          <button 
            onClick={handleShare}
            className="absolute top-12 right-2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-gray-900 hover:text-secondary transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 delay-75"
          >
            {isCopied ? <Check size={18} /> : <Share2 size={18} />}
            {isCopied && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>

          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          
          {/* Quick View Button - Centered on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
            <Button 
              variant="secondary" 
              className="rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-6"
              onClick={handleQuickView}
            >
              <Eye size={16} className="mr-2" />
              Quick View
            </Button>
          </div>
          
          {/* Quick Add - Slide Up on Hover (Feel22 style) */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out bg-white/95 backdrop-blur-md border-t border-gray-100 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
             <Button 
               variant="primary" 
               fullWidth 
               size="md" 
               className={`rounded-sm font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all duration-300 shadow-lg ${buttonStyles}`}
               onClick={handleQuickAdd}
               isLoading={isAdding}
             >
               Add to Basket
             </Button>
          </div>
        </div>

        {/* Content - Clean & Editorial (Sephora style) */}
        <div className="flex flex-col flex-grow px-1">
          <div className="mb-1 text-sm font-bold text-black uppercase tracking-wide">
            {product.brand}
          </div>
          <h3 className="text-sm text-gray-700 leading-snug mb-2 line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-black">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className={i < Math.floor(product.rating) ? "fill-black" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">{product.reviews}</span>
          </div>

          <div className="mt-auto">
            <Price current={product.price} original={product.originalPrice} />
          </div>
        </div>
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};
