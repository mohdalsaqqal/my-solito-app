/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home } from './screens/Home';
import { ProductPage } from './screens/ProductPage';
import { CartPage } from './screens/CartPage';
import { CheckoutPage } from './screens/CheckoutPage';
import { OrderSuccessPage } from './screens/OrderSuccessPage';
import { ShopPage } from './screens/ShopPage';
import { AccountPage } from './screens/AccountPage';
import { CartProvider } from './context/CartContext';
import { Product } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';

type Screen = 'home' | 'product' | 'cart' | 'checkout' | 'success' | 'shop' | 'account';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product');
    window.scrollTo(0, 0);
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  return (
    <CartProvider>
      {currentScreen === 'home' && (
        <Home 
          onProductClick={handleProductClick} 
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'shop' && (
        <ShopPage 
          onProductClick={handleProductClick} 
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'account' && (
        <AccountPage 
          onNavigate={navigateTo}
          onLogout={() => navigateTo('home')}
        />
      )}
      
      {currentScreen === 'product' && selectedProduct && (
        <ProductPage 
          product={selectedProduct} 
          onBack={() => navigateTo('home')} 
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'cart' && (
        <CartPage 
          onCheckout={() => navigateTo('checkout')}
          onContinueShopping={() => navigateTo('home')}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'checkout' && (
        <CheckoutPage 
          onOrderPlaced={() => navigateTo('success')}
          onBackToCart={() => navigateTo('cart')}
        />
      )}

      {currentScreen === 'success' && (
        <OrderSuccessPage 
          onContinueShopping={() => navigateTo('home')}
          onNavigate={navigateTo}
        />
      )}

      <CartDrawer 
        onCheckout={() => navigateTo('checkout')}
        onViewCart={() => navigateTo('cart')}
      />
    </CartProvider>
  );
}
