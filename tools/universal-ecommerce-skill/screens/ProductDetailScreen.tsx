/**
 * ProductDetailScreen.tsx
 * Universal Product Detail Page (PDP)
 * Stack: Solito v5 · Uniwind · React Native Reusables
 *
 * Works as:
 *   - Next.js page: app/product/[slug]/page.tsx → <ProductDetailScreen />
 *   - Expo screen:  app/(tabs)/product/[slug].tsx → <ProductDetailScreen />
 *
 * The screen reads `slug` via Solito's createParam (shared type-safe params).
 */

import React, { useState, useCallback } from 'react'
import {
  ScrollView,
  View,
  Text,
  Pressable,
  FlatList,
} from 'react-native'
import { SolitoImage } from 'solito/image'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'
import { createParam } from 'solito'

// RNR Components
import { Button }     from '~/ui/components/button'
import { Badge }      from '~/ui/components/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/ui/components/tabs'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '~/ui/components/select'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '~/ui/components/accordion'
import { Progress }   from '~/ui/components/progress'
import { Skeleton }   from '~/ui/components/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/ui/components/sheet'
import { Separator }  from '~/ui/components/separator'

// Shared components
import { ProductCard, type Product } from '~/app/components/ProductCard'

// ─── Param hook ────────────────────────────────────────────────
const { useParam } = createParam<{ slug: string }>()

// ─── Types ─────────────────────────────────────────────────────
interface ProductDetail extends Product {
  description: string
  specifications: { label: string; value: string }[]
  shippingInfo: string
  returnPolicy: string
  reviews: {
    id: string
    author: string
    rating: number
    date: string
    body: string
    verified: boolean
  }[]
  relatedProducts: Product[]
}

// ─── Skeleton ──────────────────────────────────────────────────
function PDPSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background">
      <Skeleton className="aspect-square w-full" />
      <View className="px-4 pt-4 gap-3">
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-7 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-6 w-1/4 rounded" />
        <Separator />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </View>
    </ScrollView>
  )
}

// ─── Breadcrumb (web only) ─────────────────────────────────────
function Breadcrumb({ brand, name }: { brand?: string; name: string }) {
  return (
    // web:flex = only visible on web
    <View className="web:flex hidden flex-row items-center gap-2 px-4 py-3">
      <Link href="/"><Text className="text-sm text-muted-foreground">Home</Text></Link>
      <Text className="text-muted-foreground text-sm">/</Text>
      <Link href="/shop"><Text className="text-sm text-muted-foreground">Shop</Text></Link>
      {brand && (
        <>
          <Text className="text-muted-foreground text-sm">/</Text>
          <Text className="text-sm text-muted-foreground">{brand}</Text>
        </>
      )}
      <Text className="text-muted-foreground text-sm">/</Text>
      <Text className="text-sm text-foreground font-medium" numberOfLines={1}>{name}</Text>
    </View>
  )
}

// ─── Image Gallery ─────────────────────────────────────────────
function ImageGallery({ images, productName }: {
  images: { url: string; alt: string }[]
  productName: string
}) {
  const [active, setActive] = useState(0)

  return (
    <View>
      {/* Main image */}
      <View className="aspect-square w-full bg-muted web:aspect-[4/5] web:rounded-2xl overflow-hidden">
        <SolitoImage
          src={images[active]?.url ?? 'https://placehold.co/600x600'}
          alt={images[active]?.alt ?? productName}
          fill
          contentFit="cover"
          priority
        />
      </View>

      {/* Thumbnails — web shows row below, native shows dots */}
      {images.length > 1 && (
        <>
          {/* Web: thumbnail strip */}
          <View className="web:flex hidden flex-row gap-2 mt-3 px-4">
            {images.map((img, i) => (
              <Pressable
                key={i}
                onPress={() => setActive(i)}
                accessibilityLabel={`View image ${i + 1}`}
                className={`
                  w-16 h-16 rounded-lg overflow-hidden border-2
                  ${i === active ? 'border-foreground' : 'border-transparent'}
                `}
              >
                <SolitoImage src={img.url} alt={img.alt} fill contentFit="cover" />
              </Pressable>
            ))}
          </View>

          {/* Native: dot indicators */}
          <View className="native:flex hidden flex-row justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <Pressable key={i} onPress={() => setActive(i)}>
                <View className={`
                  h-1.5 rounded-full transition-all
                  ${i === active ? 'w-4 bg-foreground' : 'w-1.5 bg-muted-foreground/40'}
                `} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

// ─── Star Rating (full) ────────────────────────────────────────
function RatingRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <Pressable
      className="flex-row items-center gap-2"
      accessibilityLabel={`${rating} stars, ${reviewCount} reviews. Tap to read reviews.`}
      accessibilityRole="link"
    >
      <Text className="text-rating text-sm">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</Text>
      <Text className="text-sm text-muted-foreground font-medium">{rating.toFixed(1)}</Text>
      <Text className="text-sm text-muted-foreground">({reviewCount} reviews)</Text>
    </Pressable>
  )
}

// ─── Variant Selector ──────────────────────────────────────────
function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[]
  selected: string | null
  onSelect: (size: string) => void
}) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-foreground">Size</Text>
        <Pressable>
          <Text className="text-sm text-primary underline">Size Guide</Text>
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {sizes.map((size) => (
          <Pressable
            key={size}
            onPress={() => onSelect(size)}
            accessibilityLabel={`Size ${size}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === size }}
            className={`
              min-w-[44px] h-11 px-3 rounded-xl border-2 items-center justify-center
              ${selected === size
                ? 'border-foreground bg-foreground'
                : 'border-border bg-background'
              }
            `}
          >
            <Text className={`text-sm font-semibold
              ${selected === size ? 'text-background' : 'text-foreground'}
            `}>
              {size}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ─── Color Selector ────────────────────────────────────────────
function ColorSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: NonNullable<Product['variants']>
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <View>
      <Text className="text-sm font-semibold text-foreground mb-3">
        Color: <Text className="font-normal text-muted-foreground">
          {variants[selected]?.color}
        </Text>
      </Text>
      <View className="flex-row gap-2">
        {variants.map((v, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            accessibilityLabel={v.color}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === i }}
            className={`
              w-8 h-8 rounded-full border-2
              ${selected === i ? 'border-foreground' : 'border-transparent'}
            `}
            style={v.swatchHex ? { backgroundColor: v.swatchHex } : undefined}
          />
        ))}
      </View>
    </View>
  )
}

// ─── Quantity Picker ───────────────────────────────────────────
function QuantityPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row items-center border border-border rounded-xl overflow-hidden">
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        accessibilityLabel="Decrease quantity"
        className="w-11 h-11 items-center justify-center bg-muted"
      >
        <Text className="text-lg font-medium text-foreground">−</Text>
      </Pressable>

      <View className="flex-1 h-11 items-center justify-center">
        <Text
          className="text-sm font-semibold text-foreground"
          accessibilityLiveRegion="polite"
        >
          {value}
        </Text>
      </View>

      <Pressable
        onPress={() => onChange(value + 1)}
        accessibilityLabel="Increase quantity"
        className="w-11 h-11 items-center justify-center bg-muted"
      >
        <Text className="text-lg font-medium text-foreground">+</Text>
      </Pressable>
    </View>
  )
}

// ─── Trust Badges ─────────────────────────────────────────────
function TrustBadges() {
  const items = [
    { icon: '🔒', label: 'Secure checkout' },
    { icon: '↩️', label: 'Free returns' },
    { icon: '🚚', label: 'Free shipping $75+' },
  ]
  return (
    <View className="flex-row justify-around py-4 border-t border-b border-border">
      {items.map((item) => (
        <View key={item.label} className="items-center gap-1">
          <Text className="text-xl">{item.icon}</Text>
          <Text className="text-[11px] text-muted-foreground text-center">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Review Item ───────────────────────────────────────────────
function ReviewItem({ review }: { review: ProductDetail['reviews'][0] }) {
  return (
    <View className="py-4 border-b border-border">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-foreground">{review.author}</Text>
        <Text className="text-xs text-muted-foreground">{review.date}</Text>
      </View>
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-rating text-xs">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
        {review.verified && (
          <Text className="text-[11px] text-success font-medium">✓ Verified</Text>
        )}
      </View>
      <Text className="text-sm text-foreground-secondary leading-relaxed">{review.body}</Text>
    </View>
  )
}

// ─── Main Screen ───────────────────────────────────────────────

export function ProductDetailScreen() {
  const [slug]         = useParam('slug')
  const router         = useRouter()
  const [loading, setLoading]   = useState(false)
  const [product, setProduct]   = useState<ProductDetail | null>(null)
  const [selectedSize, setSelectedSize]   = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted]   = useState(false)
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false)

  // TODO: Replace with your actual data fetching (SWR, TanStack Query, etc.)
  // useEffect(() => { fetchProduct(slug).then(setProduct) }, [slug])

  if (loading || !product) return <PDPSkeleton />

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price
  const savingsPct = isOnSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  const handleAddToCart = useCallback(() => {
    if (product.availableSizes?.length && !selectedSize) {
      setSizeSheetOpen(true)
      return
    }
    // TODO: dispatch to cart store
    // cartStore.addItem({ product, size: selectedSize, color: product.variants?.[selectedColor]?.color, quantity })
  }, [product, selectedSize, selectedColor, quantity])

  return (
    <View className="flex-1 bg-background">

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32 web:pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb — web only */}
        <Breadcrumb brand={product.brand} name={product.name} />

        {/* Layout: single column on mobile, 2-col on web */}
        <View className="web:flex-row web:gap-12 web:px-8 web:py-8">

          {/* ── LEFT: Images ── */}
          <View className="web:flex-1 web:max-w-[600px]">
            <ImageGallery images={product.images} productName={product.name} />
          </View>

          {/* ── RIGHT: Product info ── */}
          <View className="flex-1 px-4 web:px-0 pt-4 web:pt-0">

            {/* Brand */}
            {product.brand && (
              <Text className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                {product.brand}
              </Text>
            )}

            {/* Name */}
            <Text className="text-2xl web:text-3xl font-bold text-foreground leading-tight mb-2">
              {product.name}
            </Text>

            {/* Rating */}
            {product.rating && product.reviewCount ? (
              <RatingRow rating={product.rating} reviewCount={product.reviewCount} />
            ) : null}

            {/* Price */}
            <View className="flex-row items-baseline gap-3 mt-3 mb-4">
              <Text className={`text-2xl font-bold ${isOnSale ? 'text-sale' : 'text-foreground'}`}>
                ${product.price.toFixed(2)}
              </Text>
              {isOnSale && (
                <>
                  <Text className="text-lg text-muted-foreground line-through">
                    ${product.compareAtPrice!.toFixed(2)}
                  </Text>
                  <View className="badge-sale px-2 py-0.5 rounded">
                    <Text className="text-xs font-bold">-{savingsPct}%</Text>
                  </View>
                </>
              )}
            </View>

            <Separator className="my-4" />

            {/* Color selector */}
            {product.variants?.length ? (
              <View className="mb-4">
                <ColorSelector
                  variants={product.variants}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              </View>
            ) : null}

            {/* Size selector */}
            {product.availableSizes?.length ? (
              <View className="mb-4">
                <SizeSelector
                  sizes={product.availableSizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </View>
            ) : null}

            {/* Quantity */}
            <View className="flex-row items-center gap-4 mb-6">
              <Text className="text-sm font-semibold text-foreground">Qty</Text>
              <QuantityPicker value={quantity} onChange={setQuantity} />
            </View>

            {/* CTAs */}
            <View className="gap-3 mb-4">
              {/* Express checkout — native only */}
              <View className="native:flex hidden flex-row gap-3">
                <Pressable className="flex-1 h-12 bg-black rounded-xl items-center justify-center ios:flex hidden">
                  <Text className="text-white text-sm font-semibold"> Pay</Text>
                </Pressable>
                <Pressable className="flex-1 h-12 bg-[#4285F4] rounded-xl items-center justify-center android:flex hidden">
                  <Text className="text-white text-sm font-semibold">G Pay</Text>
                </Pressable>
              </View>

              {/* Add to Cart */}
              {!product.isSoldOut ? (
                <Button
                  size="lg"
                  onPress={handleAddToCart}
                  className="h-14 rounded-xl"
                >
                  <Text className="text-primary-foreground font-bold text-base">
                    Add to Cart — ${(product.price * quantity).toFixed(2)}
                  </Text>
                </Button>
              ) : (
                <Button variant="outline" size="lg" className="h-14 rounded-xl">
                  <Text className="font-bold text-base">Notify When Available</Text>
                </Button>
              )}

              {/* Wishlist */}
              <Button
                variant="outline"
                size="lg"
                onPress={() => setIsWishlisted(!isWishlisted)}
                className="h-14 rounded-xl"
              >
                <Text className="font-semibold text-base">
                  {isWishlisted ? '♥ Saved' : '♡ Save to Wishlist'}
                </Text>
              </Button>
            </View>

            {/* Trust badges */}
            <TrustBadges />

            {/* ── Tabs: Description / Specs / Shipping / Reviews ── */}
            <Tabs defaultValue="description" className="mt-6">
              <TabsList className="bg-muted rounded-xl mb-4">
                {['description', 'specs', 'shipping', 'reviews'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                  >
                    <Text className="text-xs font-semibold capitalize">{tab}</Text>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="description">
                <Text className="text-sm text-foreground-secondary leading-relaxed">
                  {product.description}
                </Text>
              </TabsContent>

              <TabsContent value="specs">
                <View className="gap-0">
                  {product.specifications.map((spec, i) => (
                    <View key={i} className={`flex-row py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                      <Text className="text-sm font-medium text-muted-foreground w-1/2">
                        {spec.label}
                      </Text>
                      <Text className="text-sm text-foreground flex-1">{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </TabsContent>

              <TabsContent value="shipping">
                <Text className="text-sm text-foreground-secondary leading-relaxed">
                  {product.shippingInfo}
                </Text>
                <View className="mt-4 p-4 bg-muted rounded-xl">
                  <Text className="text-sm font-semibold text-foreground mb-1">Return Policy</Text>
                  <Text className="text-sm text-muted-foreground">{product.returnPolicy}</Text>
                </View>
              </TabsContent>

              <TabsContent value="reviews">
                {/* Rating summary */}
                {product.rating && (
                  <View className="flex-row items-center gap-6 mb-4 p-4 bg-muted rounded-xl">
                    <View className="items-center">
                      <Text className="text-4xl font-black text-foreground">
                        {product.rating.toFixed(1)}
                      </Text>
                      <Text className="text-rating text-sm">
                        {'★'.repeat(Math.round(product.rating))}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {product.reviewCount} reviews
                      </Text>
                    </View>
                    <View className="flex-1 gap-1">
                      {[5,4,3,2,1].map(star => (
                        <View key={star} className="flex-row items-center gap-2">
                          <Text className="text-xs text-muted-foreground w-3">{star}</Text>
                          <Progress value={star === 5 ? 72 : star === 4 ? 18 : 5} className="flex-1 h-1.5" />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {product.reviews.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </TabsContent>
            </Tabs>
          </View>
        </View>

        {/* Related products */}
        {product.relatedProducts.length > 0 && (
          <View className="mt-8">
            <Text className="text-lg font-bold text-foreground px-4 mb-4">
              You Might Also Like
            </Text>
            <FlatList
              horizontal
              data={product.relatedProducts}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 gap-3"
              renderItem={({ item }) => (
                <ProductCard product={item} className="w-[160px]" />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Add to Cart — native only ── */}
      <View className="native:flex hidden absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 pb-safe pt-3">
        <Button
          size="lg"
          onPress={handleAddToCart}
          className="h-14 rounded-xl"
        >
          <Text className="text-primary-foreground font-bold text-base">
            {product.isSoldOut ? 'Notify Me' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
          </Text>
        </Button>
      </View>

      {/* ── Size Selection Sheet (when Add to Cart pressed without size) ── */}
      <Sheet open={sizeSheetOpen} onOpenChange={setSizeSheetOpen}>
        <SheetContent side="bottom" className="bg-card rounded-t-3xl px-4 pt-2 pb-safe">
          <View className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
          <SheetHeader>
            <SheetTitle className="text-foreground">Select a Size</SheetTitle>
          </SheetHeader>
          <View className="mt-4">
            <SizeSelector
              sizes={product.availableSizes ?? []}
              selected={selectedSize}
              onSelect={(size) => {
                setSelectedSize(size)
                setSizeSheetOpen(false)
              }}
            />
            <Button
              size="lg"
              onPress={() => { setSizeSheetOpen(false); handleAddToCart() }}
              className="mt-6 h-14 rounded-xl"
              disabled={!selectedSize}
            >
              <Text className="text-primary-foreground font-bold text-base">
                Add to Cart
              </Text>
            </Button>
          </View>
        </SheetContent>
      </Sheet>
    </View>
  )
}
