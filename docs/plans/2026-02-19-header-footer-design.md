# Header + Footer Design (Web + Mobile)

Date: 2026-02-19
Status: Approved
Scope: Customer-facing header and footer for web-first commerce with mirrored mobile behavior.

## 1) Goals

- Implement premium, consistent header and footer UX across web and Expo.
- Keep architecture aligned with AGENTS rules:
  - `UI -> apiClient -> BFF -> provider registry -> adapters`
  - Tokens only for visual values.
  - No provider/adapter imports in `packages/ui`.
  - No business logic in `packages/ui`.
- Ensure RTL/LTR parity.
- Keep CMS as content/config source for marketing-driven areas.

## 2) Constraints and Guardrails

- `packages/ui`: primitives/components only, UniWind styling allowed.
- `packages/app`: composition and feature behavior; no `className` usage.
- No direct adapter imports from app/ui layers.
- No hardcoded marketing copy/links/social config.
- Future taxonomy shape is fixed:
  - `category -> subcategory -> sub-subcategory`
- Future CMS visibility control must support hide/show at all taxonomy levels, where hiding a node hides all descendant products site-wide.

## 3) Approved Header Design

### 3.1 Desktop Header Structure

Three rows:
1. TopBar: promo-only, clickable text, CMS-editable.
2. MainHeader: logo, search, actions.
3. NavigationRow: main categories only.

Sticky behavior:
- `MainHeader + NavigationRow` are sticky on scroll.
- TopBar is non-sticky.

### 3.2 Mobile Header Structure

Two rows:
1. Main row: logo + search.
2. Category row: horizontally scrollable main categories.

### 3.3 Search Behavior

- Live suggestions + recent searches.
- Recent searches stored locally only.
- Suggestion panel opens on focus and supports:
  - suggestions
  - recent searches
- Enter submits search route.

### 3.4 Header Actions

Visible for guest:
- Account
- Wishlist
- Cart
- Language dropdown

Language switch:
- Instant switch on current page (route locale update, no homepage redirect).

Cart/wishlist source-of-truth:
- Logged-in: backend-synced across platforms.
- Guest: local state.
- On login: guest cart merges into server cart by quantity.

## 4) Approved Footer Design

### 4.1 Desktop Footer Structure

- 4 columns:
  - Brand/About
  - Shop links
  - Help links
  - Newsletter + social
- Bottom legal row.

CMS control:
- Footer links: labels, urls, active/inactive.
- Social links: urls, active/inactive.
- Trust/payment badges: on/off, order, image, link.

### 4.2 Mobile Footer Structure

- Accordion sections (Shop/Help/About).
- Social links.
- Legal row.

### 4.3 Newsletter

- Fields: first name + email.
- Visibility toggle per locale (EN/AR) from CMS.

### 4.4 Legal and Social

Legal row includes:
- copyright
- privacy
- terms
- returns/refund
- contact

Social links behavior:
- Web: open in new tab with safe external handling.
- Mobile: open external via safe platform handling/webview policy.

### 4.5 Footer Positioning

- Sticky-to-bottom only on short pages.
- Normal flow when content is taller than viewport.

## 5) Data Contracts (Initial)

These contracts live in app/provider-facing layers and are consumed by UI components via props.

### Header

- `HeaderCategory`
  - `id: string`
  - `slug: string`
  - `name: string`
  - `locale: string`
  - `isVisible: boolean`
- `HeaderPromo`
  - `id: string`
  - `text: string`
  - `href: string`
  - `isActive: boolean`
  - `locale: string`
- `SearchSuggestion`
  - `id: string`
  - `label: string`
  - `type: 'product' | 'category' | 'brand'`
  - `href: string`
- `RecentSearch`
  - `query: string`
  - `timestamp: number`

### Footer

- `FooterLink`
  - `id: string`
  - `label: string`
  - `href: string`
  - `isActive: boolean`
  - `group: 'about' | 'shop' | 'help' | 'legal'`
  - `locale: string`
- `FooterSocial`
  - `id: string`
  - `platform: string`
  - `href: string`
  - `isActive: boolean`
  - `locale?: string`
- `FooterNewsletterConfig`
  - `enabled: boolean`
  - `locale: string`
  - `title?: string`
  - `description?: string`
- `FooterTrustBadge`
  - `id: string`
  - `title: string`
  - `imageUrl: string`
  - `href?: string`
  - `isActive: boolean`
  - `order: number`

## 6) Component Boundaries

### `packages/ui` (presentation only)

Header primitives:
- `TopPromoBar`
- `HeaderSearchInput`
- `HeaderActionIcons`
- `CategoryScrollBar`
- `LanguageDropdown`

Footer primitives:
- `FooterColumn`
- `FooterAccordion`
- `FooterNewsletterForm`
- `FooterSocialLinks`
- `FooterLegalRow`
- `FooterTrustBadges`

### `packages/app` (composition + behavior)

Header:
- `HeaderShell`
- `useHeaderSearch`
- `useHeaderState`

Footer:
- `FooterShell`
- `useFooterConfig`

### App wrappers (`apps/next`, `apps/expo`)

- Route and platform wiring only.
- No direct adapter calls.

## 7) State and Error Policies

Required states per relevant block:
- `loading`
- `empty`
- `error`
- `disabled`
- `out-of-stock` when product purchasability is shown

Fallback behavior:
- Promo load failure: hide TopBar safely.
- Category load failure: compact fallback + retry action.
- Search suggestion failure: keep input usable, hide suggestions gracefully.
- Badge failure: show icon without count.
- Local recent-search storage failure: disable recent history only.

## 8) RTL Requirements

- Use logical start/end alignment.
- Avoid directional hardcoding (`left/right`, side-specific spacing).
- Mirror directional icons.
- Category scrollbar respects document direction.
- Validate all new header/footer blocks in both LTR and RTL.

## 9) Testing Strategy

- Unit tests (`packages/app`):
  - search state, local recent persistence, auth-aware badge behavior, login merge flow trigger.
- Component tests (`packages/ui`):
  - state rendering, RTL alignment, category overflow behavior.
- Integration tests (`apps/next`):
  - BFF-backed data wiring, locale switch on current route, sticky behavior, footer render from CMS payload.
- Guard checks:
  - `yarn guard:checks` must pass.

## 10) Rollout Plan

1. Build header/footer primitives in `packages/ui` with tokens only.
2. Add shell + hooks in `packages/app`.
3. Wire Next + Expo wrappers.
4. Enable behind feature flag (example: `USE_NEW_CHROME=true`).
5. Validate LTR/RTL and guard checks.
6. Enable by default after QA.

## 11) Open Follow-ups (Deferred by decision)

- CMS schema details for taxonomy visibility inheritance across all levels.
- Final mobile external link handling policy wording (browser vs webview wrapper) while keeping safe external handling.
- Analytics events for header/footer interactions.

