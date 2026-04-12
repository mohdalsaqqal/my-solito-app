import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Product } from '../components/ProductCard';
import { Button } from '../primitives/Button';
import { Price } from '../primitives/Price';
import { Badge } from '../primitives/Badge';
import { useCart } from '../context/CartContext';
import { Star, Truck, ShieldCheck, ArrowLeft, Share2, Heart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../primitives/Button';
import { ProductCard } from '../components/ProductCard';
import { TRENDING_PRODUCTS } from '../data/products';
import { Footer } from '../components/Footer';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'shop') => void;
}

export const ProductPage = ({ product, onBack, onNavigate }: ProductPageProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Sarah M.', text: 'Absolutely love this! The texture is amazing.', rating: 5 },
    { id: 2, user: 'Jessica K.', text: 'Great color payoff, but a bit pricey.', rating: 4 },
  ]);
  const [newReview, setNewReview] = useState('');
  const [relatedScroll, setRelatedScroll] = useState(0);

  const colors = ['#F5E6D3', '#EAC0A6', '#D4A373', '#8D5B4C'];

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddReview = () => {
    if (newReview.trim()) {
      setReviews([...reviews, { id: Date.now(), user: 'You', text: newReview, rating: 5 }]);
      setNewReview('');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, quantity, colors[selectedColor]);
      setIsAdding(false);
    }, 600);
  };

  const scrollRelated = (direction: 'left' | 'right') => {
    const container = document.getElementById('related-products-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back */}
        <button 
          onClick={onBack}
          className="flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shopping
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Image Section */}
          <div className="space-y-4">
            {/* ... existing image code ... */}
            <div className="aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-black text-white rounded-none">New</Badge>}
                {product.originalPrice && <Badge className="bg-secondary text-white rounded-none">Sale</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-md overflow-hidden cursor-pointer hover:ring-1 hover:ring-black">
                   <img 
                    src={product.image} 
                    alt={`View ${i+1}`} 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* ... existing details code ... */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">{product.brand}</h2>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">{product.name}</h1>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-black" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-sm font-medium ml-2">{product.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-black">
                  {product.reviews} reviews
                </span>
              </div>
            </div>

            <div className="mb-8">
              <Price current={product.price} original={product.originalPrice} size="xl" />
              
              {/* Tabbed Interface */}
              <div className="mt-6">
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={cn(
                      "pb-2 mr-6 text-sm font-bold uppercase tracking-wide transition-colors border-b-2",
                      activeTab === 'description' 
                        ? "border-black text-black" 
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                      "pb-2 text-sm font-bold uppercase tracking-wide transition-colors border-b-2",
                      activeTab === 'details' 
                        ? "border-black text-black" 
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Product Details
                  </button>
                </div>

                <div className="min-h-[100px]">
                  {activeTab === 'description' ? (
                    <p className="text-gray-600 leading-relaxed animate-in fade-in duration-300">
                      Experience the luxury of {product.brand}. This product is designed to enhance your natural beauty with high-quality ingredients and long-lasting wear. Perfect for daily use or special occasions.
                    </p>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-2 animate-in fade-in duration-300">
                      <p><span className="font-bold text-gray-900">Ingredients:</span> Aqua, Glycerin, Dimethicone, Niacinamide, Sodium Hyaluronate.</p>
                      <p><span className="font-bold text-gray-900">Usage:</span> Apply a small amount to clean skin morning and night.</p>
                      <p><span className="font-bold text-gray-900">Size:</span> 30ml / 1.0 fl oz</p>
                      <p><span className="font-bold text-gray-900">Skin Type:</span> Suitable for all skin types.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-wide text-gray-900 block mb-3">
                Select Shade: <span className="text-gray-500 font-normal ml-1">Fair Neutral</span>
              </span>
              <div className="flex gap-3">
                {colors.map((color, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      selectedColor === i 
                        ? 'border-black ring-1 ring-black ring-offset-2 scale-110' 
                        : 'border-transparent hover:border-gray-300'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="mb-8 border-t border-gray-100 pt-8">
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-4">Customer Reviews</h3>
              
              {/* Review List */}
              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-none border-l-2 border-black">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm uppercase tracking-wide">{review.user}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "fill-black text-black" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Review */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Write a review..."
                  className="flex-1 border border-gray-200 rounded-none px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddReview()}
                />
                <Button size="sm" onClick={handleAddReview} disabled={!newReview.trim()} className="rounded-none">
                  Submit
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-6">
              <div className="flex gap-4 h-14">
                {/* Quantity Selector */}
                <div className="flex items-center border border-black rounded-none h-full shrink-0">
                  <button 
                    onClick={handleDecrement}
                    className="w-12 h-full flex items-center justify-center text-xl font-medium text-black hover:bg-gray-100 transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-black">{quantity}</span>
                  <button 
                    onClick={handleIncrement}
                    className="w-12 h-full flex items-center justify-center text-xl font-medium text-black hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button 
                  size="xl" 
                  className="rounded-none uppercase tracking-widest font-bold h-full text-lg flex-1"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                >
                  Add to Basket - ${(product.price * quantity).toFixed(2)}
                </Button>

                <button 
                  onClick={handleShare}
                  className="h-full aspect-square border border-gray-200 flex items-center justify-center hover:border-black hover:bg-gray-50 transition-colors relative shrink-0"
                >
                  {isCopied ? <Check size={24} /> : <Share2 size={24} />}
                  {isCopied && (
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-2 px-3 rounded shadow-lg whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-black">
                      Link copied!
                    </span>
                  )}
                </button>

                <button className="h-full aspect-square border border-gray-200 flex items-center justify-center hover:border-black hover:bg-gray-50 transition-colors shrink-0">
                  <Heart size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-600 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-secondary" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-secondary" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Set Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-wide mb-8">
            Complete the Set
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-8 rounded-lg">
            {/* Main Product (Current) */}
            <div className="flex items-center gap-4">
              <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">This Item</span>
                <h3 className="font-bold text-sm">{product.name}</h3>
                <Price current={product.price} />
              </div>
            </div>
            
            {/* Plus Icon */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-4xl font-light text-gray-300">+</span>
            </div>

            {/* Suggested Product */}
            <div className="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1887&auto=format&fit=crop" alt="Matching Blush" className="w-20 h-20 object-cover rounded-md" />
              <div>
                <span className="text-xs font-bold text-secondary uppercase">Best Match</span>
                <h3 className="font-bold text-sm">Soft Pinch Liquid Blush</h3>
                <Price current={23.00} />
                <button className="text-xs font-bold underline mt-1 hover:text-secondary">Add Both to Cart</button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Carousel */}
        <section className="mb-20 relative group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-wide">
              You May Also Like
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scrollRelated('left')}
                className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollRelated('right')}
                className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div 
            id="related-products-scroll"
            className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TRENDING_PRODUCTS.map((item) => (
              <div key={item.id} className="min-w-[280px] snap-start">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
