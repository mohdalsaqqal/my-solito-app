# Nice One (نايس ون) — Design System & Branding

> Extracted from https://www.niceonesa.com/en on 2026-04-05

---

## Brand Identity

| Element | Value |
|---------|-------|
| **Brand name** | Nice One (English) / نايس ون (Arabic) |
| **Logo (header)** | `https://cdn.niceonesa.com/web/assets_v2/images/ltr_logo.svg` |
| **Logo (footer)** | `https://cdn.niceonesa.com/web/assets_v2/images/footerlogo.webp` |
| **Category** | Beauty & skincare e-commerce, KSA |
| **Languages** | English (LTR) + Arabic (RTL), same codebase |

---

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#222222` | Primary text, buttons, borders |
| `secondary` | `#997ADB` | Brand purple — CTAs, accents, active states |
| `pastel` | `#9273D4` | Lighter purple variant |
| `secondary-light` | `#EBE4F8` | Purple tint backgrounds |
| `accent` | `#997ADB` | Same as secondary |
| `tertiary` | `#FBAEB9` | Pink/rose accent |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `discount-color` | `#EE2D64` | Sale/promo price, discount badges |
| `discount-color-light` | `#FFEDEE` | Discount badge background |
| `success` | `#73BE22` | In-stock, confirmation |
| `error` | `#D0021B` | Errors, validation |
| `warning` | `#F5A623` | Warnings |
| `brand-blue` | `#40A2FF` | Info, links |
| `brand-blue-light` | `#E3EFFA` | Info backgrounds |

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `white` | `#FFFFFF` | Cards, main surfaces |
| `light-grey` | `#F8F8F8` | Page background |
| `dark-grey` | `#F9F9F9` | Subtle surface |
| `soft-grey` | `#EDEDED` | Dividers, borders |
| `bright-grey` | `#EAEAEA` | Light borders |
| `cart-gray` | `#EEF0F3` | Cart UI |
| `anti-flash-white` | `#F2F2F2` | Input backgrounds |
| `cultured` | `#F5F5F5` | Neutral backgrounds |
| `magnolia` | `#F5F2FB` | Purple-tinted bg |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#222222` | Body text |
| `secondary` | `#997ADB` | Brand purple text |
| `boulder` | `#757575` | Secondary/muted text |
| `grey-muted` | `#BDBDBD` | Placeholder text |
| `footer` | `rgba(245,241,249,0.85)` | Footer text |
| `txt-secondary` | `rgba(0,0,0,0.54)` | Subdued labels |
| `mirage` | `#202020` | Near-black |
| `neutral` | `#98A1AE` | Tertiary text |
| `[#8D8383]` | `#8D8383` | Most-used muted gray |

### Loyalty Program Colors

| Token | Hex |
|-------|-----|
| `loyalty-gold` | `#DAB162` |
| `loyalty-platinum` | `#272828` |
| `loyalty-silver` | `#D2D2D2` |

---

## Typography

### Font Families

| Role | Family | Weights |
|------|--------|---------|
| **Arabic / RTL** | `IBM Plex Sans Arabic` | 300, 400, 500 (via Google Fonts) |
| **English / LTR** | `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif` | — |
| **Currency / Icons** | `niceone-currency` (custom embedded TTF) | 400 |
| **UI components** | `vant-icon` (Vant component library icon font) | 400 |

### Font Weight Scale

| Class | Weight |
|-------|--------|
| `font-niceone-light` | 300 |
| `font-niceone-normal` | 400 |
| `font-niceone-medium` | 500 |
| `font-niceone-bold` | 600–700 |

### Type Scale

| Class | Size | Line-height |
|-------|------|-------------|
| `text-xss` | 10px | 1 |
| `text-xs` | 12px (0.75rem) | 16px |
| `text-sm` | 14px (0.875rem) | 20px |
| `text-base` | 16px (1rem) | 24px |
| `text-lg` | 18px (1.125rem) | — |
| `text-xl` | 20px (1.25rem) | 28px |

---

## Spacing

Base unit: **4px**

| Step | Value |
|------|-------|
| 1 | 4px (0.25rem) |
| 2 | 8px (0.5rem) |
| 3 | 12px (0.75rem) |
| 4 | 16px (1rem) |
| 5 | 20px (1.25rem) |
| 6 | 24px (1.5rem) |
| 8 | 32px (2rem) |
| 10 | 40px (2.5rem) |

---

## Border Radius

| Token | Value |
|-------|-------|
| `rounded-sm` | 2px |
| `rounded-md` | 6px — most used on cards |
| `rounded-lg` | 8px |
| `rounded-xl` | 12px |
| `rounded-2xl` | 16px |
| `rounded-3xl` | 24px |
| `rounded-full` | 9999px — pills, avatars |

---

## Shadows

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)` |
| `shadow-cus` | `0 0 5px rgba(0,0,6,0.14)` — custom card shadow |

---

## Layout

| Property | Value |
|----------|-------|
| Max content width | 1440px (at ≥1280px) |
| Breakpoints | 640px / 768px / 1024px / 1280px |
| RTL support | Full — `[dir=ltr]` / `[dir=rtl]` wrappers on all directional utilities |
| Component library | [Vant UI](https://vant-ui.github.io/) — mobile-first Vue component library |

---

## Key Design Signatures

- **Brand purple** `#997ADB` is the dominant accent — used on selected states, CTAs, borders, and active tabs
- **Discount red** `#EE2D64` signals promotional pricing (hot pink, not traditional red)
- **Card style**: `bg-white rounded-md shadow-cus` — clean white cards with subtle shadow
- **Page background**: `bg-light-grey` (`#F8F8F8`) — off-white, not pure white
- **Body text**: `#222222` near-black, not pure black, for softer readability
- **Framework**: Nuxt 3 (SSR) with Tailwind CSS + Vant UI component library
