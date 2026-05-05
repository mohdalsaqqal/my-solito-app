'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Cart, CartItem } from 'app/logic/types/cart'

interface CartContextValue {
  cart: Cart
  addItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] })

  const addItem = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.productId === productId)
      const next = existing
        ? prev.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [...prev.items, { productId, quantity }]
      return { items: next }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({
      items: prev.items.filter((i) => i.productId !== productId),
    }))
  }, [])

  const itemCount = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.quantity, 0),
    [cart.items]
  )

  const value = useMemo<CartContextValue>(
    () => ({ cart, addItem, removeItem, itemCount }),
    [cart, addItem, removeItem, itemCount]
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
