import React from 'react';
import { Search, ShoppingBag, Menu, User, Heart, MapPin } from 'lucide-react';
import { Button } from '../primitives/Button';
import { useCart } from '../context/CartContext';

import { CountdownTimer } from '../primitives/CountdownTimer';

const CATEGORIES = [
  'New', 'Brands', 'Makeup', 'Skincare', 'Hair', 'Fragrance', 'Tools & Brushes', 'Bath & Body', 'Mini Size', 'Gifts', 'Sale'
];

interface NavbarProps {
  onNavigate?: (screen: 'home' | 'shop' | 'account') => void;
}

export const Navbar = ({ onNavigate }: NavbarProps) => {
  const { cartCount, toggleCart } = useCart();
  // Timer for navbar (e.g., 4 hours from now)
  const flashSaleEnd = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      {/* Top Promo Bar - Feel22 style (Urgency) */}
      <div className="bg-secondary text-white text-xs font-bold text-center py-2 px-4 tracking-wide overflow-hidden flex justify-center items-center relative">
        <span className="animate-pulse mr-2">🚨</span>
        <span className="uppercase mr-1">Flash Sale: 50% OFF Fenty Beauty — Ends in</span>
        <CountdownTimer targetDate={flashSaleEnd} variant="minimal" size="sm" className="inline-block" />
        <span className="animate-pulse ml-2">🚨</span>
      </div>

      {/* Main Header - Sephora style (Clean, Utility) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="lg:hidden p-2 -ml-2 text-gray-900">
              <Menu size={24} />
            </button>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate?.('home'); }}
              className="text-3xl font-display font-black tracking-widest text-primary"
            >
              LUXE<span className="text-secondary">GLOW</span>
            </a>
          </div>

          {/* Search Bar - Centered & Wide */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm font-medium placeholder-gray-500"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" />
          </div>

          {/* Actions - Right Aligned */}
          <div className="flex items-center gap-1 sm:gap-6 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-primary">
              <MapPin size={18} />
              <div className="flex flex-col leading-none">
                <span>Store</span>
                <span className="font-bold">Find a Store</span>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate?.('shop')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
            >
              Shop All
            </button>
            
            <button 
              onClick={() => onNavigate?.('account')}
              className="p-2 text-gray-900 hover:text-secondary transition-colors"
            >
              <User size={24} />
              <span className="sr-only">Account</span>
            </button>
            
            <button className="p-2 text-gray-900 hover:text-secondary transition-colors">
              <Heart size={24} />
              <span className="sr-only">Wishlist</span>
            </button>

            <div 
              className="relative p-2 text-gray-900 hover:text-secondary transition-colors cursor-pointer"
              onClick={() => toggleCart(true)}
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-secondary text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-in zoom-in duration-200 key={cartCount}">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav - Sephora style (Dense, Black text) */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-12">
            {CATEGORIES.map((cat) => (
              <a 
                key={cat} 
                href="#" 
                className={`text-sm font-bold uppercase tracking-wide hover:text-secondary transition-colors ${cat === 'Sale' ? 'text-red-600' : 'text-gray-900'}`}
              >
                {cat}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
