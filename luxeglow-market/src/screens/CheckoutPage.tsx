import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../primitives/Button';
import { Price } from '../primitives/Price';
import { Check, ShieldCheck, CreditCard, Truck } from 'lucide-react';

interface CheckoutPageProps {
  onOrderPlaced: () => void;
  onBackToCart: () => void;
}

export const CheckoutPage = ({ onOrderPlaced, onBackToCart }: CheckoutPageProps) => {
  const { cartItems, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal; // Free shipping

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      onOrderPlaced();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="text-2xl font-display font-black tracking-widest text-primary">
            LUXE<span className="text-secondary">GLOW</span>
          </a>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <ShieldCheck size={16} /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">1</span>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" placeholder="you@example.com" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newsletter" className="rounded text-black focus:ring-black" />
                    <label htmlFor="newsletter" className="text-sm text-gray-600">Email me with news and offers</label>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">2</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" placeholder="123 Main St" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc.</label>
                    <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">3</span>
                  Payment
                </h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-md p-4 flex items-center gap-3 bg-gray-50">
                    <CreditCard size={20} />
                    <span className="font-medium">Credit Card</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" required placeholder="0000 0000 0000 0000" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (MM/YY)</label>
                      <input type="text" required placeholder="MM/YY" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input type="text" required placeholder="123" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loyalty Points Redemption */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                  <Crown size={24} className="text-yellow-500" />
                  Redeem Loyalty Points
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">You have <span className="font-bold text-black">1,250 points</span> available.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { points: 500, discount: 10, label: '$10 Off' },
                    { points: 1000, discount: 25, label: '$25 Off' },
                  ].map((reward) => (
                    <label key={reward.points} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="loyalty-reward" className="text-black focus:ring-black" />
                        <div>
                          <p className="font-bold text-sm">{reward.label}</p>
                          <p className="text-xs text-gray-500">{reward.points} Points</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">Redeem</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button type="button" onClick={onBackToCart} className="text-sm text-gray-600 hover:text-black font-medium">
                  &larr; Return to Cart
                </button>
                <Button type="submit" size="xl" isLoading={isProcessing} className="px-12">
                  Place Order
                </Button>
              </div>
            </form>
          </div>

          {/* Order Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-md overflow-hidden shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
