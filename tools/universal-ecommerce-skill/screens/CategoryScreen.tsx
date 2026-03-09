/**
 * CategoryScreen.tsx
 * Universal category/collection page with filters
 * Stack: Solito v5 · Uniwind · React Native Reusables
 *
 * Native: FlatList grid + Sheet filter panel
 * Web:    CSS grid + sidebar filters
 */

import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Pressable, FlatList } from 'react-native'
import { createParam } from 'solito'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/ui/components/sheet'
import { Button }    from '~/ui/components/button'
import { Badge }     from '~/ui/components/badge'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '~/ui/components/select'
import { Separator } from '~/ui/components/separator'
import { Skeleton }  from '~/ui/components/skeleton'

import { ProductCard, ProductCardSkeleton, type Product } from '~/app/components/ProductCard'

// ─── Types ─────────────────────────────────────────────────────

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface ActiveFilter {
  key: string
  label: string
  value: string
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating'

// ─── Sort options ──────────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Featured',        value: 'featured'   },
  { label: 'Price: Low–High', value: 'price-asc'  },
  { label: 'Price: High–Low', value: 'price-desc' },
  { label: 'Newest',          value: 'newest'     },
  { label: 'Top Rated',       value: 'rating'     },
]

// ─── Active Filter Pills ───────────────────────────────────────

function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: ActiveFilter[]
  onRemove: (filter: ActiveFilter) => void
  onClearAll: () => void
}) {
  if (!filters.length) return null

  return (
    <View className="flex-row flex-wrap gap-2 px-4 pb-3" accessibilityLabel="Active filters">
      {filters.map((f) => (
        <Pressable
          key={`${f.key}-${f.value}`}
          onPress={() => onRemove(f)}
          accessibilityLabel={`Remove filter: ${f.label}`}
          className="flex-row items-center gap-1 bg-foreground rounded-full px-3 py-1"
        >
          <Text className="text-xs font-medium text-background">{f.label}</Text>
          <Text className="text-xs text-background/70">✕</Text>
        </Pressable>
      ))}
      <Pressable onPress={onClearAll}>
        <Text className="text-xs text-muted-foreground underline py-1">Clear all</Text>
      </Pressable>
    </View>
  )
}

// ─── Filter Group ──────────────────────────────────────────────

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <View className="py-4">
      <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
        {title}
      </Text>
      <View className="gap-2">
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onToggle(opt.value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected.includes(opt.value) }}
            className="flex-row items-center gap-3"
          >
            {/* Checkbox */}
            <View className={`
              w-5 h-5 rounded border-2 items-center justify-center
              ${selected.includes(opt.value)
                ? 'bg-foreground border-foreground'
                : 'border-border bg-background'
              }
            `}>
              {selected.includes(opt.value) && (
                <Text className="text-background text-[10px] font-bold">✓</Text>
              )}
            </View>
            <Text className="flex-1 text-sm text-foreground">{opt.label}</Text>
            {opt.count !== undefined && (
              <Text className="text-xs text-muted-foreground">{opt.count}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ─── Color Filter ──────────────────────────────────────────────

function ColorFilterGroup({
  colors,
  selected,
  onToggle,
}: {
  colors: { label: string; value: string; hex: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <View className="py-4">
      <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Color</Text>
      <View className="flex-row flex-wrap gap-3">
        {colors.map((c) => (
          <Pressable
            key={c.value}
            onPress={() => onToggle(c.value)}
            accessibilityLabel={c.label}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected.includes(c.value) }}
            className={`
              w-8 h-8 rounded-full border-2
              ${selected.includes(c.value) ? 'border-foreground' : 'border-transparent'}
            `}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </View>
    </View>
  )
}

// ─── Price Range Filter ─────────────────────────────────────────

function PriceFilter({
  min, max, onApply,
}: {
  min: number
  max: number
  onApply: (min: number, max: number) => void
}) {
  const [localMin, setLocalMin] = useState(min)
  const [localMax, setLocalMax] = useState(max)

  return (
    <View className="py-4">
      <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Price</Text>
      <View className="flex-row items-center gap-3 mb-3">
        <View className="flex-1 border border-border rounded-lg px-3 py-2">
          <Text className="text-xs text-muted-foreground mb-0.5">Min</Text>
          <Text className="text-sm text-foreground font-medium">${localMin}</Text>
        </View>
        <Text className="text-muted-foreground">–</Text>
        <View className="flex-1 border border-border rounded-lg px-3 py-2">
          <Text className="text-xs text-muted-foreground mb-0.5">Max</Text>
          <Text className="text-sm text-foreground font-medium">${localMax}</Text>
        </View>
      </View>
      <Button
        variant="outline"
        size="sm"
        onPress={() => onApply(localMin, localMax)}
        className="self-start"
      >
        <Text className="text-sm font-semibold">Apply</Text>
      </Button>
    </View>
  )
}

// ─── Filter Panel (used in both Sheet and sidebar) ─────────────

function FilterPanel({
  onClose,
  activeFilters,
  onClearAll,
}: {
  onClose?: () => void
  activeFilters: ActiveFilter[]
  onClearAll: () => void
}) {
  // TODO: wire up real filter state from props or store
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors,     setSelectedColors]     = useState<string[]>([])
  const [selectedSizes,      setSelectedSizes]      = useState<string[]>([])

  const CATEGORIES: FilterOption[] = [
    { label: 'Tops',       value: 'tops',       count: 48 },
    { label: 'Bottoms',    value: 'bottoms',    count: 32 },
    { label: 'Outerwear',  value: 'outerwear',  count: 19 },
    { label: 'Accessories',value: 'accessories',count: 61 },
  ]

  const COLORS = [
    { label: 'Black',     value: 'black',     hex: '#1a1a1a' },
    { label: 'White',     value: 'white',     hex: '#f5f5f5' },
    { label: 'Navy',      value: 'navy',      hex: '#1e3a5f' },
    { label: 'Camel',     value: 'camel',     hex: '#c19a6b' },
    { label: 'Sage',      value: 'sage',      hex: '#87a086' },
    { label: 'Terracotta',value: 'terracotta',hex: '#c17a5a' },
  ]

  const SIZES: FilterOption[] = ['XS','S','M','L','XL','XXL'].map(s => ({ label: s, value: s.toLowerCase() }))

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-foreground">Filters</Text>
        {activeFilters.length > 0 && (
          <Pressable onPress={onClearAll}>
            <Text className="text-sm text-primary underline font-medium">Clear all</Text>
          </Pressable>
        )}
      </View>

      <Separator />

      <FilterGroup
        title="Category"
        options={CATEGORIES}
        selected={selectedCategories}
        onToggle={(v) => setSelectedCategories(arr => toggle(arr, v))}
      />
      <Separator />

      <ColorFilterGroup
        colors={COLORS}
        selected={selectedColors}
        onToggle={(v) => setSelectedColors(arr => toggle(arr, v))}
      />
      <Separator />

      <FilterGroup
        title="Size"
        options={SIZES}
        selected={selectedSizes}
        onToggle={(v) => setSelectedSizes(arr => toggle(arr, v))}
      />
      <Separator />

      <PriceFilter
        min={0}
        max={500}
        onApply={(min, max) => { /* apply price filter */ }}
      />

      {onClose && (
        <Button size="lg" onPress={onClose} className="mt-4 h-14 rounded-xl">
          <Text className="text-primary-foreground font-bold text-base">
            Show Results
          </Text>
        </Button>
      )}
    </View>
  )
}

// ─── Results Bar ───────────────────────────────────────────────

function ResultsBar({
  count,
  total,
  sortValue,
  onSortChange,
  onFilterOpen,
  activeFilterCount,
}: {
  count: number
  total: number
  sortValue: SortOption
  onSortChange: (v: SortOption) => void
  onFilterOpen: () => void
  activeFilterCount: number
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
      <Text className="text-sm text-muted-foreground">
        <Text className="font-bold text-foreground">{count}</Text> of {total}
      </Text>

      <View className="flex-row items-center gap-2">
        {/* Filter button (native + web mobile) */}
        <Pressable
          onPress={onFilterOpen}
          accessibilityLabel="Open filters"
          className="web:lg:hidden flex-row items-center gap-1.5 h-9 px-3 border border-border rounded-lg"
        >
          <Text className="text-sm font-medium text-foreground">Filters</Text>
          {activeFilterCount > 0 && (
            <View className="w-4 h-4 rounded-full bg-foreground items-center justify-center">
              <Text className="text-[10px] font-bold text-background">{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        {/* Sort select */}
        <Select
          defaultValue={sortValue}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <SelectTrigger className="h-9 px-3 border border-border rounded-lg">
            <SelectValue placeholder="Sort" className="text-sm text-foreground" />
          </SelectTrigger>
          <SelectContent className="bg-card rounded-xl">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} label={o.label}>
                <Text className="text-sm text-foreground">{o.label}</Text>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </View>
    </View>
  )
}

// ─── Main Screen ───────────────────────────────────────────────

export function CategoryScreen() {
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [sort,         setSort]         = useState<SortOption>('featured')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [products,     setProducts]     = useState<Product[]>([])
  const [loading,      setLoading]      = useState(false)

  // TODO: Replace with real data fetching + filter logic

  const handleRemoveFilter = useCallback((f: ActiveFilter) => {
    setActiveFilters(prev => prev.filter(a => !(a.key === f.key && a.value === f.value)))
  }, [])

  const handleClearAll = useCallback(() => setActiveFilters([]), [])

  const NUM_COLS = 2

  return (
    <View className="flex-1 bg-background">

      {/* Results bar */}
      <ResultsBar
        count={products.length}
        total={148}
        sortValue={sort}
        onSortChange={setSort}
        onFilterOpen={() => setFilterOpen(true)}
        activeFilterCount={activeFilters.length}
      />

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <View className="px-4 pt-3">
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </View>
      )}

      {/* Layout: sidebar on web lg, full on mobile */}
      <View className="flex-1 web:flex-row">

        {/* ── Sidebar filters — web only ── */}
        <View className="web:lg:flex hidden w-[260px] border-r border-border px-5 py-4">
          <FilterPanel
            activeFilters={activeFilters}
            onClearAll={handleClearAll}
          />
        </View>

        {/* ── Product grid ── */}
        {loading ? (
          <FlatList
            data={Array.from({ length: 6 })}
            numColumns={NUM_COLS}
            keyExtractor={(_, i) => String(i)}
            contentContainerClassName="p-4 gap-4"
            columnWrapperClassName="gap-4"
            renderItem={() => <ProductCardSkeleton className="flex-1" />}
          />
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-4 py-20">
            <Text className="text-4xl">🔍</Text>
            <Text className="text-lg font-bold text-foreground">No products found</Text>
            <Text className="text-sm text-muted-foreground text-center px-8">
              Try adjusting your filters or search query
            </Text>
            <Button variant="outline" onPress={handleClearAll}>
              <Text className="font-semibold">Clear Filters</Text>
            </Button>
          </View>
        ) : (
          <FlatList
            data={products}
            numColumns={NUM_COLS}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4 pb-24 gap-4"
            columnWrapperClassName="gap-4"
            renderItem={({ item }) => (
              <ProductCard product={item} className="flex-1" />
            )}
            ListFooterComponent={
              <View className="py-6 items-center">
                <Text className="text-sm text-muted-foreground">
                  Showing {products.length} of 148 products
                </Text>
                <Button variant="outline" className="mt-3">
                  <Text className="font-semibold">Load More</Text>
                </Button>
              </View>
            }
          />
        )}
      </View>

      {/* ── Filter Sheet — native + web mobile ── */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="bottom"
          className="bg-card rounded-t-3xl px-5 pt-2 pb-safe max-h-[85%]"
        >
          <View className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
          <SheetHeader>
            <SheetTitle className="text-foreground text-base font-bold mb-2">
              Filter Products
            </SheetTitle>
          </SheetHeader>
          <FilterPanel
            onClose={() => setFilterOpen(false)}
            activeFilters={activeFilters}
            onClearAll={handleClearAll}
          />
        </SheetContent>
      </Sheet>
    </View>
  )
}
