import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard, Product } from '../components/ProductCard';
import { MOCK_PRODUCTS, TRENDING_PRODUCTS } from '../data/products';
import { Filter, ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../primitives/Button';

interface ShopPageProps {
  onProductClick: (product: Product) => void;
  onNavigate?: (screen: 'home' | 'shop') => void;
}

const CATEGORIES = ['All', 'Makeup', 'Skincare', 'Fragrance', 'Tools'];
const BRANDS = ['All', 'Giorgio Armani', 'Rare Beauty', 'Dior', 'Charlotte Tilbury', 'Fenty Beauty'];
const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100+', min: 100, max: Infinity },
];

export const ShopPage = ({ onProductClick, onNavigate }: ShopPageProps) => {
  const [sortBy, setSortBy] = useState('featured');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);

  // Combine all products for the shop page
  const allProducts = useMemo(() => {
    const combined = [...MOCK_PRODUCTS, ...TRENDING_PRODUCTS];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const categoryMatch = selectedCategory === 'All' || (product.category && product.category === selectedCategory); // Assuming product has category, if not, this might need adjustment or mock data update
      const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand;
      const priceMatch = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
      
      return categoryMatch && brandMatch && priceMatch;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'newest': return (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1;
        default: return 0; // Featured
      }
    });
  }, [allProducts, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedPriceRange(PRICE_RANGES[0]);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-wide mb-2">Shop All</h1>
            <p className="text-gray-500">{filteredProducts.length} Products</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-none hover:border-black transition-colors text-sm font-medium flex-1 md:flex-none lg:hidden"
            >
              <Filter size={16} /> Filter
            </button>
            <div className="relative flex-1 md:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 px-4 py-2 pr-8 rounded-none hover:border-black transition-colors text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Category</h3>
              <ul className="space-y-2">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center group",
                        selectedCategory === cat ? "font-bold text-black" : "text-gray-600"
                      )}
                    >
                      {cat}
                      {selectedCategory === cat && <Check size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Brand</h3>
              <ul className="space-y-2">
                {BRANDS.map(brand => (
                  <li key={brand}>
                    <button 
                      onClick={() => setSelectedBrand(brand)}
                      className={cn(
                        "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center group",
                        selectedBrand === brand ? "font-bold text-black" : "text-gray-600"
                      )}
                    >
                      {brand}
                      {selectedBrand === brand && <Check size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Price</h3>
              <ul className="space-y-2">
                {PRICE_RANGES.map((range, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setSelectedPriceRange(range)}
                      className={cn(
                        "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center group",
                        selectedPriceRange.label === range.label ? "font-bold text-black" : "text-gray-600"
                      )}
                    >
                      {range.label}
                      {selectedPriceRange.label === range.label && <Check size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {(selectedCategory !== 'All' || selectedBrand !== 'All' || selectedPriceRange.label !== 'All') && (
              <button 
                onClick={clearFilters}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Mobile Filter Drawer */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Filters</h2>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Categories */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Category</h3>
                    <ul className="space-y-2">
                      {CATEGORIES.map(cat => (
                        <li key={cat}>
                          <button 
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center",
                              selectedCategory === cat ? "font-bold text-black" : "text-gray-600"
                            )}
                          >
                            {cat}
                            {selectedCategory === cat && <Check size={14} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Brand</h3>
                    <ul className="space-y-2">
                      {BRANDS.map(brand => (
                        <li key={brand}>
                          <button 
                            onClick={() => setSelectedBrand(brand)}
                            className={cn(
                              "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center",
                              selectedBrand === brand ? "font-bold text-black" : "text-gray-600"
                            )}
                          >
                            {brand}
                            {selectedBrand === brand && <Check size={14} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="font-bold uppercase tracking-wide mb-4 text-sm">Price</h3>
                    <ul className="space-y-2">
                      {PRICE_RANGES.map((range, idx) => (
                        <li key={idx}>
                          <button 
                            onClick={() => setSelectedPriceRange(range)}
                            className={cn(
                              "text-sm hover:text-black transition-colors text-left w-full flex justify-between items-center",
                              selectedPriceRange.label === range.label ? "font-bold text-black" : "text-gray-600"
                            )}
                          >
                            {range.label}
                            {selectedPriceRange.label === range.label && <Check size={14} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <button 
                      onClick={() => { clearFilters(); setIsSidebarOpen(false); }}
                      className="w-full py-3 border border-gray-200 text-sm font-bold uppercase tracking-wide mb-3"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full py-3 bg-black text-white text-sm font-bold uppercase tracking-wide"
                    >
                      Show {filteredProducts.length} Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No products match your filters.</p>
                <button 
                  onClick={clearFilters}
                  className="text-sm font-bold underline hover:text-secondary"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => onProductClick(product)}
                  />
                ))}
              </div>
            )}
            
            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="mt-16 text-center">
                <button className="px-8 py-3 bg-gray-100 hover:bg-black hover:text-white transition-colors text-sm font-bold uppercase tracking-wide">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
