import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../primitives/Button';

export const HeroBanner = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] md:h-[600px]">
        {/* Main Editorial - Sephora Style */}
        <div className="md:col-span-2 relative rounded-lg overflow-hidden group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1522335789203-abd6523f435e?q=80&w=2565&auto=format&fit=crop"
            alt="Editorial"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
            <h2 className="text-white text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4">
              The New <br/>
              <span className="text-secondary">Essentials</span>
            </h2>
            <p className="text-gray-200 text-lg mb-6 max-w-md">
              Discover the latest drops from top luxury brands. Elevate your routine with our curated picks.
            </p>
            <Button variant="secondary" size="lg" className="self-start">
              Shop Now
            </Button>
          </div>
        </div>

        {/* Side Promos - Feel22 Style */}
        <div className="flex flex-col gap-4 h-full">
          {/* Top Promo */}
          <div className="relative flex-1 rounded-lg overflow-hidden group cursor-pointer bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2070&auto=format&fit=crop"
              alt="Promo 1"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col justify-center items-center text-center p-6">
              <span className="bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">
                Just In
              </span>
              <h3 className="text-white text-3xl font-display font-bold uppercase mb-2">
                Rare Beauty
              </h3>
              <span className="text-white underline underline-offset-4 font-bold text-sm uppercase tracking-wide">
                Shop Collection
              </span>
            </div>
          </div>

          {/* Bottom Promo - Sale Focus */}
          <div className="relative flex-1 rounded-lg overflow-hidden group cursor-pointer bg-secondary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
              <h3 className="text-white text-5xl font-display font-black mb-2 leading-none">
                50%<br/>OFF
              </h3>
              <p className="text-white/90 font-medium uppercase tracking-widest text-sm mb-4">
                Select Fragrances
              </p>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-secondary">
                View Offers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
