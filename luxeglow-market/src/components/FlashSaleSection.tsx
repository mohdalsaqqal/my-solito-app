import React from 'react';
import { ProductCard, Product } from './ProductCard';
import { CountdownTimer } from '../primitives/CountdownTimer';
import { ArrowRight } from 'lucide-react';
import { Button } from '../primitives/Button';

interface FlashSaleSectionProps {
  products: Product[];
  endTime: Date;
  onProductClick?: (product: Product) => void;
}

export const FlashSaleSection = ({ products, endTime, onProductClick }: FlashSaleSectionProps) => {
  return (
    <section className="py-12 bg-gradient-to-b from-red-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-xs animate-pulse">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
              Live Now
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900">
              FLASH DEALS
            </h2>
            <p className="text-gray-500 max-w-md">
              Grab these limited-time offers before they're gone. Prices reset when the timer ends.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-red-100">
            <span className="text-sm font-bold text-gray-500 uppercase">Ending In:</span>
            <CountdownTimer targetDate={endTime} size="xl" variant="minimal" className="text-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              variant="flash" 
              onClick={() => onProductClick?.(product)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="group">
            View All Deals
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
