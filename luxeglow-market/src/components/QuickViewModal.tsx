import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Check, Truck, ShieldCheck } from 'lucide-react';
import { Product } from './ProductCard';
import { Button } from '../primitives/Button';
import { Price } from '../primitives/Price';
import { Badge } from '../primitives/Badge';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setQuantity(1); // Reset quantity when modal opens
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate network request
    setTimeout(() => {
      addToCart(`Added ${quantity}x ${product.name} to basket`);
      setIsAdding(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && <Badge className="bg-black text-white rounded-none">New</Badge>}
            {product.originalPrice && <Badge className="bg-secondary text-white rounded-none">Sale</Badge>}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-2">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{product.brand}</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-1 mb-2">{product.name}</h2>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-black" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4">
                {product.reviews} reviews
              </span>
            </div>
          </div>

          <div className="mb-6">
            <Price current={product.price} original={product.originalPrice} size="xl" />
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Experience the luxury of {product.brand}. This product is designed to enhance your natural beauty with high-quality ingredients and long-lasting wear. Perfect for daily use or special occasions.
          </p>

          {/* Color Selection (Mock) */}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-900 block mb-3">Select Shade</span>
            <div className="flex gap-2">
              {['#F5E6D3', '#EAC0A6', '#D4A373', '#8D5B4C'].map((color, i) => (
                <button 
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 ${i === 1 ? 'border-black ring-1 ring-black ring-offset-2' : 'border-transparent hover:border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-black rounded-none h-12 shrink-0">
                <button 
                  onClick={handleDecrement}
                  className="w-10 h-full flex items-center justify-center text-lg font-medium text-black hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-black">{quantity}</span>
                <button 
                  onClick={handleIncrement}
                  className="w-10 h-full flex items-center justify-center text-lg font-medium text-black hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                className="rounded-none uppercase tracking-widest font-bold h-12"
                onClick={handleAddToCart}
                isLoading={isAdding}
              >
                Add to Basket - ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
