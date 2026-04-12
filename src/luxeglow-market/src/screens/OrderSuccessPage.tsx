import React from 'react';
import { Button } from '../primitives/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface OrderSuccessPageProps {
  onContinueShopping: () => void;
  onNavigate?: (screen: 'home' | 'shop') => void;
}

export const OrderSuccessPage = ({ onContinueShopping, onNavigate }: OrderSuccessPageProps) => {
  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle size={40} strokeWidth={3} />
        </div>
        
        <h1 className="text-4xl font-display font-black uppercase tracking-wide mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order <span className="font-bold text-black">#{orderNumber}</span> has been received.
        </p>
        
        <div className="bg-gray-50 p-8 rounded-lg mb-12 text-left max-w-md mx-auto border border-gray-100">
          <h3 className="font-bold uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">What's Next?</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs shrink-0">1</span>
              <span>You will receive an order confirmation email shortly.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs shrink-0">2</span>
              <span>We'll notify you when your order ships (usually within 24 hours).</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs shrink-0">3</span>
              <span>Enjoy your new luxury beauty products!</span>
            </li>
          </ul>
        </div>

        <Button size="xl" onClick={onContinueShopping}>
          Continue Shopping <ArrowRight size={20} className="ml-2" />
        </Button>
      </main>

      <Footer />
    </div>
  );
};
