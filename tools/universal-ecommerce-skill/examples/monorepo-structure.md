# Monorepo Setup Guide
## Solito v5 + Uniwind + React Native Reusables

Complete reference for setting up your universal e-commerce monorepo from scratch.

---

## 1. Bootstrap

```bash
# Use the Solito starter (already has Next.js + Expo wired)
npx create-solito-app@latest my-shop --template with-tailwind
cd my-shop

# Or: clone the Solito example monorepo
git clone https://github.com/nandorojo/solito my-shop
cd my-shop && yarn install
```

---

## 2. Install Uniwind

```bash
# In the Expo app
cd apps/expo
bun add uniwind tailwindcss

# Create global.css
cat > global.css << 'EOF'
@import 'tailwindcss';
@import 'uniwind';

/* Scan all packages that use className */
@source '../../packages/app';
@source '../../packages/ui';
EOF
```

### metro.config.js (apps/expo)
```js
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

// Add transpilePackages for RN libs used in Next.js
config.resolver.unstable_conditionNames = ['require', 'react-native', 'default']

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
  // Optional: extra themes
  // extraThemes: ['premium'],
})
```

### next.config.js (apps/next)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'solito',
    'react-native',
    'expo',
    'react-native-reanimated',
    '@rn-primitives',
    // add other RN packages here
  ],
}

module.exports = nextConfig
```

---

## 3. Install React Native Reusables

```bash
# From apps/expo directory
npx @react-native-reusables/cli@latest init

# Add components you need
npx @react-native-reusables/cli@latest add button
npx @react-native-reusables/cli@latest add sheet
npx @react-native-reusables/cli@latest add dialog
npx @react-native-reusables/cli@latest add select
npx @react-native-reusables/cli@latest add tabs
npx @react-native-reusables/cli@latest add badge
npx @react-native-reusables/cli@latest add progress
npx @react-native-reusables/cli@latest add skeleton
npx @react-native-reusables/cli@latest add accordion
npx @react-native-reusables/cli@latest add toast
npx @react-native-reusables/cli@latest add separator
npx @react-native-reusables/cli@latest add avatar

# Move generated components to shared packages/ui
# (they live in ~/components/ui/ by default after CLI)
mv components/ui packages/ui/components/
```

---

## 4. Theming Setup

### packages/ui/tokens/global.css
See the full token file in `tokens/global.css` from this skill.

### apps/expo/global.css
```css
@import 'tailwindcss';
@import 'uniwind';

/* Include all shared packages */
@source '../../packages/app';
@source '../../packages/ui';

/* Import shared token system */
@import '../../packages/ui/tokens/global.css';
```

### Theme Provider (apps/expo/App.tsx or _layout.tsx)
```tsx
import '../global.css'
import { Uniwind } from 'uniwind'
import { useColorScheme } from 'react-native'
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  const colorScheme = useColorScheme()

  // Sync Uniwind with system theme on startup
  useEffect(() => {
    Uniwind.setTheme('system')
  }, [])

  return <>{children}</>
}
```

---

## 5. Solito Navigation Wrappers

### packages/ui/navigation/index.ts
```ts
// Re-export ALL Solito APIs from here
// This gives you one place to update if Solito API changes

export { Link }         from 'solito/link'
export { TextLink }     from 'solito/link'
export { useRouter }    from 'solito/navigation'
export { useSearchParams } from 'solito/navigation'
export { SolitoImage }  from 'solito/image'

// Typed TextLink with base styles applied (required in v5 — TextLink is unstyled)
export { AppLink, AppTextLink } from './AppLink'
```

### packages/ui/navigation/AppLink.tsx
```tsx
import React from 'react'
import { Link, TextLink } from 'solito/link'

// AppLink: adds className support for web, normalizes style for native
export function AppLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} />
}

// AppTextLink: restores the default text styling Solito v5 removed
export function AppTextLink(props: React.ComponentProps<typeof TextLink>) {
  return (
    <TextLink
      {...props}
      style={{
        // Restore what react-native-web used to provide in v4
        fontFamily: 'System',
        fontSize: 14,
        ...props.style,
      }}
    />
  )
}
```

---

## 6. State Management (Zustand)

### packages/app/store/cartStore.ts
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  size?: string
  color?: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  get totalItems(): number
  get subtotal(): number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        // Check if same product+variant already exists
        const existing = state.items.find(
          i => i.productId === item.productId && i.size === item.size && i.color === item.color
        )
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return {
          items: [...state.items, { ...item, id: `${item.productId}-${item.size}-${item.color}-${Date.now()}` }]
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),

      updateQuantity: (id, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, quantity: qty } : i)
      })),

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

---

## 7. Screen Registration

### apps/expo/app/(tabs)/index.tsx (Home)
```tsx
import { HomeScreen } from 'app/features/home/HomeScreen'
export default HomeScreen
```

### apps/expo/app/product/[slug].tsx (PDP)
```tsx
import { ProductDetailScreen } from 'app/features/product/ProductDetailScreen'
export default ProductDetailScreen
```

### apps/next/app/product/[slug]/page.tsx (PDP)
```tsx
import { ProductDetailScreen } from 'app/features/product/ProductDetailScreen'
export default function ProductPage() {
  return <ProductDetailScreen />
}
```

---

## 8. Compatibility Matrix

| Package | Tested Version |
|---------|---------------|
| Solito | 5.x |
| Next.js | 16.x |
| Expo SDK | 54 |
| React Native | 0.81 / 0.82 |
| React | 19.1 |
| Uniwind | 1.3.x+ |
| NativeWind (if needed) | 4.x |
| Tailwind CSS | 4.x |
| RNR CLI | latest |
| `@rn-primitives` | latest |
| Zustand | 5.x |
| TanStack Query | 5.x |

---

## 9. VSCode / Cursor Setup (Tailwind IntelliSense)

Add to `.vscode/settings.json`:
```json
{
  "tailwindCSS.classAttributes": [
    "class",
    "className",
    "contentContainerClassName",
    "columnWrapperClassName",
    "headerClassName",
    "imageClassName"
  ],
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "\"([^\"]*)\""],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 10. Checklist Before Shipping

- [ ] `withUniwindConfig` is the **outermost** wrapper in metro.config.js
- [ ] `@source` directives include all packages that use `className`
- [ ] All RNR components are in `packages/ui/components/` (not app-specific)
- [ ] No `StyleSheet.create` on Solito `Link`, `TextLink`, or `SolitoImage`
- [ ] No array styles on Solito components
- [ ] `AppTextLink` wraps `TextLink` everywhere (adds base font styles)
- [ ] Dark mode tested on both iOS and web
- [ ] All icon-only buttons have `accessibilityLabel`
- [ ] FlatList `renderItem` wrapped in `useCallback`
- [ ] Skeleton screens for all loading states
- [ ] Cart state persisted with AsyncStorage (Zustand persist)
- [ ] `useParam` from `createParam` used for all screen params
- [ ] `next.config.js` has all RN packages in `transpilePackages`
