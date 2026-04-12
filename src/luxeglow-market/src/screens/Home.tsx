import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryRail } from '../components/CategoryRail';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { ProductCard, Product } from '../components/ProductCard';
import { Button } from '../primitives/Button';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Gift } from 'lucide-react';
import { MOCK_PRODUCTS, TRENDING_PRODUCTS } from '../data/products';
import { Footer } from '../components/Footer';

interface HomeProps {
  onProductClick?: (product: Product) => void;
  onNavigate?: (screen: 'home' | 'shop') => void;
}

export const Home = ({ onProductClick, onNavigate }: HomeProps) => {
  const flashSaleEnd = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main>
        <HeroBanner />
        
        <CategoryRail />

        {/* Features / Trust Signals - More subtle now */}
        <section className="py-6 border-b border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders $50+' },
                { icon: ShieldCheck, title: 'Genuine Products', desc: 'Sourced directly' },
                { icon: Gift, title: 'Free Samples', desc: 'With every order' },
                { icon: RefreshCw, title: 'Easy Returns', desc: 'Within 30 days' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <feature.icon size={20} className="text-secondary" />
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">{feature.title}</h3>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FlashSaleSection products={MOCK_PRODUCTS} endTime={flashSaleEnd} onProductClick={onProductClick} />

        {/* Trending Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-wide">
              Trending Now
            </h2>
            <a href="#" className="text-sm font-bold text-gray-900 hover:text-secondary uppercase tracking-wide border-b-2 border-transparent hover:border-secondary transition-all">
              See All
            </a>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {TRENDING_PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] rounded-lg"
                onClick={() => onProductClick?.(product)}
              />
            ))}
          </div>
        </section>

        {/* Brand Spotlight - Sephora Style */}
        <section className="py-16 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Brand Spotlight</span>
                <h2 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase">
                  Fenty <br/>Beauty
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-md">
                  Discover the new Eaze Drop Stick. Smooth, instant coverage that looks like skin.
                </p>
                <Button variant="secondary" size="lg" className="rounded-none px-8">
                  Shop The Brand
                </Button>
              </div>
              <div className="relative aspect-video md:aspect-square bg-gray-800 overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1780&auto=format&fit=crop" 
                   alt="Brand Spotlight" 
                   className="w-full h-full object-cover opacity-80"
                 />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
