import React from 'react';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../primitives/Button';
import { Price } from '../primitives/Price';
import { Trash2, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
  onNavigate?: (screen: 'home' | 'shop') => void;
}

export const CartPage = ({ onCheckout, onContinueShopping, onNavigate }: CartPageProps) => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold uppercase tracking-wide mb-8">Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Your bag is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your bag yet.</p>
            <Button onClick={onContinueShopping}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-gray-500 border-b border-gray-200 pb-4 uppercase tracking-wide font-bold">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-gray-100 pb-8 last:border-0">
                  {/* Product Info */}
                  <div className="col-span-6 flex gap-6">
                    <div className="w-24 h-32 bg-gray-50 rounded-md overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                      {item.selectedColor && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                          <span className="text-sm text-gray-500">Selected Shade</span>
                        </div>
                      )}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 underline flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center hidden md:block">
                    <Price current={item.price} />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-none h-10">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 text-right font-bold text-lg hidden md:block">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={onContinueShopping}
                className="flex items-center text-sm text-gray-500 hover:text-black transition-colors group mt-8"
              >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 rounded-lg sticky top-24">
                <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-8">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button fullWidth size="xl" onClick={onCheckout} className="mb-4">
                  Proceed to Checkout
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mt-4">
                    Secure Checkout - SSL Encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
