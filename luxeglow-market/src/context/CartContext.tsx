import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { cn } from '../primitives/Button';
import { Product } from '../components/ProductCard';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: (isOpen?: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Luminous Silk Foundation',
      brand: 'Giorgio Armani',
      image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop',
      price: 45.00,
      originalPrice: 64.00,
      rating: 4.8,
      reviews: 1240,
      isNew: true,
      stock: 5,
      quantity: 1,
      selectedColor: '#F5E6D3'
    },
    {
      id: '3',
      name: 'Soft Pinch Liquid Blush',
      brand: 'Rare Beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1887&auto=format&fit=crop',
      price: 23.00,
      rating: 4.7,
      reviews: 890,
      stock: 15,
      quantity: 1,
      selectedColor: '#EAC0A6'
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, color?: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedColor: color }];
    });
    
    addToast(`Added ${quantity}x ${product.name} to basket`);
    setIsCartOpen(true);
  }, [addToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const toggleCart = useCallback((isOpen?: boolean) => {
    setIsCartOpen(prev => isOpen ?? !prev);
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      isCartOpen, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleCart,
      clearCart
    }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto",
                toast.type === 'success' ? "bg-black text-white" : "bg-red-600 text-white"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                toast.type === 'success' ? "bg-green-500 text-white" : "bg-white text-red-600"
              )}>
                {toast.type === 'success' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </div>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          ))}
        </div>,
        document.body
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
