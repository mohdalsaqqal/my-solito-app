/**
 * CartDrawer.tsx
 * Universal cart — Sheet on native, sidebar on web
 * Stack: Solito v5 · Uniwind · React Native Reusables
 */

import React, { useCallback } from 'react'
import { View, Text, Pressable, FlatList, ScrollView } from 'react-native'
import { SolitoImage } from 'solito/image'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/ui/components/sheet'
import { Button }    from '~/ui/components/button'
import { Progress }  from '~/ui/components/progress'
import { Separator } from '~/ui/components/separator'
import { Skeleton }  from '~/ui/components/skeleton'
import { Badge }     from '~/ui/components/badge'

// ─── Types ─────────────────────────────────────────────────────

export interface CartLineItem {
  id: string
  productId: string
  slug: string
  name: string
  brand?: string
  image: string
  price: number
  compareAtPrice?: number
  size?: string
  color?: string
  quantity: number
  maxQuantity?: number
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartLineItem[]
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onAddUpsell?: (productId: string) => void
  upsells?: { id: string; name: string; price: number; image: string; slug: string }[]
  loading?: boolean
}

// ─── Free Shipping Progress ────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 75

function ShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress  = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <View className="px-5 py-3 bg-muted/50">
      <Text className="text-xs text-foreground-secondary mb-1.5">
        {remaining > 0 ? (
          <>Add <Text className="font-bold text-foreground">${remaining.toFixed(2)}</Text> more for free shipping</>
        ) : (
          <Text className="font-bold text-success">🎉 You've unlocked free shipping!</Text>
        )}
      </Text>
      <Progress
        value={progress}
        className="h-1.5 bg-muted"
        // indicatorClassName="bg-primary" — customize in your RNR Progress component
      />
    </View>
  )
}

// ─── Cart Item ─────────────────────────────────────────────────

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartLineItem
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  const isOnSale = item.compareAtPrice && item.compareAtPrice > item.price

  return (
    <View className="flex-row gap-3 py-4">
      {/* Image */}
      <Link href={`/product/${item.slug}`}>
        <View className="w-[88px] h-[104px] rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <SolitoImage
            src={item.image}
            alt={item.name}
            fill
            contentFit="cover"
          />
        </View>
      </Link>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        {item.brand && (
          <Text className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            {item.brand}
          </Text>
        )}
        <Text className="text-sm font-semibold text-foreground leading-snug" numberOfLines={2}>
          {item.name}
        </Text>

        {/* Variant info */}
        {(item.size || item.color) && (
          <Text className="text-xs text-muted-foreground">
            {[item.size, item.color].filter(Boolean).join(' · ')}
          </Text>
        )}

        {/* Price + Qty row */}
        <View className="flex-row items-center justify-between mt-2">
          {/* Quantity picker */}
          <View className="flex-row items-center border border-border rounded-lg overflow-hidden">
            <Pressable
              onPress={() => {
                if (item.quantity <= 1) onRemove(item.id)
                else onUpdateQuantity(item.id, item.quantity - 1)
              }}
              accessibilityLabel="Decrease quantity"
              className="w-8 h-8 items-center justify-center bg-muted"
            >
              <Text className="text-sm font-medium text-foreground">
                {item.quantity <= 1 ? '🗑' : '−'}
              </Text>
            </Pressable>

            <View className="w-8 h-8 items-center justify-center">
              <Text className="text-sm font-semibold text-foreground">{item.quantity}</Text>
            </View>

            <Pressable
              onPress={() => {
                if (item.maxQuantity && item.quantity >= item.maxQuantity) return
                onUpdateQuantity(item.id, item.quantity + 1)
              }}
              accessibilityLabel="Increase quantity"
              className="w-8 h-8 items-center justify-center bg-muted"
            >
              <Text className="text-sm font-medium text-foreground">+</Text>
            </Pressable>
          </View>

          {/* Price */}
          <View className="items-end">
            <Text className={`text-sm font-bold ${isOnSale ? 'text-sale' : 'text-foreground'}`}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
            {isOnSale && (
              <Text className="text-xs text-muted-foreground line-through">
                ${(item.compareAtPrice! * item.quantity).toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        {/* Remove */}
        <Pressable onPress={() => onRemove(item.id)} className="mt-1 self-start">
          <Text className="text-xs text-muted-foreground underline">Remove</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Upsell Row ────────────────────────────────────────────────

function UpsellRow({
  item,
  onAdd,
}: {
  item: { id: string; name: string; price: number; image: string; slug: string }
  onAdd: () => void
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <SolitoImage src={item.image} alt={item.name} fill contentFit="cover" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>{item.name}</Text>
        <Text className="text-sm text-muted-foreground">${item.price.toFixed(2)}</Text>
      </View>
      <Button variant="outline" size="sm" onPress={onAdd}>
        <Text className="text-xs font-semibold">Add</Text>
      </Button>
    </View>
  )
}

// ─── Cart Summary ──────────────────────────────────────────────

function CartSummary({
  subtotal,
  savings,
  onCheckout,
}: {
  subtotal: number
  savings: number
  onCheckout: () => void
}) {
  return (
    <View className="border-t border-border bg-background px-5 pt-4 pb-safe">
      {/* Line items */}
      <View className="gap-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">Subtotal</Text>
          <Text className="text-sm text-foreground font-medium">${subtotal.toFixed(2)}</Text>
        </View>
        {savings > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-success">Savings</Text>
            <Text className="text-sm text-success font-medium">−${savings.toFixed(2)}</Text>
          </View>
        )}
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">Shipping</Text>
          <Text className="text-sm text-muted-foreground">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free 🎉' : 'Calculated at checkout'}
          </Text>
        </View>
        <Separator />
        <View className="flex-row justify-between">
          <Text className="text-base font-bold text-foreground">Estimated Total</Text>
          <Text className="text-base font-black text-foreground">${subtotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Express checkout — native iOS only */}
      <View className="ios:flex hidden mb-2">
        <Pressable className="h-12 bg-black rounded-xl items-center justify-center">
          <Text className="text-white text-sm font-semibold"> Pay</Text>
        </Pressable>
      </View>

      {/* Main CTA */}
      <Button size="lg" onPress={onCheckout} className="h-14 rounded-xl mb-2">
        <Text className="text-primary-foreground font-bold text-base">Checkout</Text>
      </Button>

      <Pressable className="py-2 items-center">
        <Text className="text-xs text-muted-foreground underline">Continue Shopping</Text>
      </Pressable>
    </View>
  )
}

// ─── Main CartDrawer ───────────────────────────────────────────

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onAddUpsell,
  upsells = [],
  loading = false,
}: CartDrawerProps) {
  const router = useRouter()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings  = items.reduce((sum, item) => {
    const diff = item.compareAtPrice ? (item.compareAtPrice - item.price) * item.quantity : 0
    return sum + diff
  }, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = useCallback(() => {
    onClose()
    router.push('/checkout')
  }, [onClose, router])

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* Native: bottom sheet · Web: side drawer (style in SheetContent) */}
      <SheetContent
        side="right"
        className="
          bg-card
          native:rounded-t-3xl native:max-h-[92%]
          web:w-[420px] web:max-w-full
          p-0
        "
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
            <SheetTitle className="text-foreground text-lg font-bold">
              Your Cart{' '}
              <Text className="text-muted-foreground font-normal text-base">
                ({totalItems})
              </Text>
            </SheetTitle>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close cart"
              className="w-8 h-8 rounded-full bg-muted items-center justify-center"
            >
              <Text className="text-foreground text-sm">✕</Text>
            </Pressable>
          </View>

          {/* Shipping progress */}
          <ShippingProgress subtotal={subtotal} />

          {/* Items */}
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              // Loading skeletons
              Array.from({ length: 2 }).map((_, i) => (
                <View key={i} className="flex-row gap-3 py-4">
                  <Skeleton className="w-[88px] h-[104px] rounded-xl" />
                  <View className="flex-1 gap-2">
                    <Skeleton className="h-3 w-1/3 rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                    <Skeleton className="h-8 w-1/2 rounded" />
                  </View>
                </View>
              ))
            ) : items.length === 0 ? (
              // Empty state
              <View className="flex-1 items-center justify-center py-20 gap-4">
                <Text className="text-5xl">🛍️</Text>
                <Text className="text-lg font-bold text-foreground">Your cart is empty</Text>
                <Text className="text-sm text-muted-foreground text-center">
                  Add items to get started
                </Text>
                <Button variant="outline" onPress={onClose} className="mt-2">
                  <Text className="font-semibold">Continue Shopping</Text>
                </Button>
              </View>
            ) : (
              <>
                {items.map((item, i) => (
                  <View key={item.id}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemove}
                    />
                    {i < items.length - 1 && <Separator />}
                  </View>
                ))}

                {/* Upsells */}
                {upsells.length > 0 && (
                  <View className="mt-4 mb-2">
                    <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      You Might Also Like
                    </Text>
                    <View className="gap-3">
                      {upsells.map((u) => (
                        <UpsellRow
                          key={u.id}
                          item={u}
                          onAdd={() => onAddUpsell?.(u.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer CTA */}
          {items.length > 0 && (
            <CartSummary
              subtotal={subtotal}
              savings={savings}
              onCheckout={handleCheckout}
            />
          )}
        </View>
      </SheetContent>
    </Sheet>
  )
}
