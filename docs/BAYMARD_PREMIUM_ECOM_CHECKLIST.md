# Baymard-Based Premium Ecommerce UX Checklist

Use this as the UX acceptance checklist before releasing any major UI flow.

Scope: web (Next.js), mobile (Expo), shared UI (`@real/ui`) and shared screens (`@real/app`).

## 0) Core UX Baseline

- [ ] Every key screen has `loading`, `empty`, `error`, and `success` states.
- [ ] Layout renders before data; API latency never collapses structure.
- [ ] Typography, spacing, color, and radius come from tokens only.
- [ ] RTL is validated for all primary flows (`dir=ltr` and `dir=rtl`).

## 1) Header, Navigation, Search

- [ ] Global header exposes logo, search, account, cart on web.
- [ ] Mobile keeps cart and primary nav instantly reachable.
- [ ] Search supports both product and non-product queries (for example returns/shipping/help).
- [ ] Empty/no-result search states suggest recovery actions.
- [ ] Menus remain scannable (no overloaded mega menu groups).

## 2) Product Listing (PLP / Shop)

- [ ] Grid density is stable across mixed image sizes.
- [ ] Filters are easy to discover and reversible.
- [ ] Filter state remains visible after scrolling.
- [ ] Sort behavior is explicit and persistent.
- [ ] Applied filters are clearly shown and removable.
- [ ] Product cards expose: image, name, price, stock/sale cues.
- [ ] Card actions are platform-appropriate: hover on web, press/tap on native.

## 3) Product Detail (PDP)

- [ ] Above-the-fold area communicates title, price, key variant state, and add-to-cart.
- [ ] Variant/shade selection errors are clear before add-to-cart.
- [ ] Descriptions/specs are complete enough for purchase confidence.
- [ ] Cross-sell and alternatives are transparent (clearly labeled relationship).
- [ ] Stock state is explicit (`in stock`, `low stock`, `out of stock`).
- [ ] Primary CTA remains reachable while scrolling (sticky behavior per platform).

## 4) Cart

- [ ] Cart drawer + full cart page behave consistently.
- [ ] Quantity edits are immediate and reversible.
- [ ] Remove actions are obvious and low-friction.
- [ ] Price summary updates in real time after changes.
- [ ] Shipping/tax/promotions do not surprise users late in flow.

## 5) Checkout

- [ ] Checkout minimizes distractions and keeps progress clear.
- [ ] Field labels and validation errors are specific and inline.
- [ ] Guest checkout path is available unless business forbids it.
- [ ] Address/payment form defaults reduce typing burden.
- [ ] Final review step shows full cost and key policy links.
- [ ] Recovery path exists for payment failure (no dead-end state).

## 6) Trust, Policies, and Service Content

- [ ] Return/shipping/contact info is easy to find from product and checkout flows.
- [ ] Policy pages are reachable via search and footer.
- [ ] Promo urgency copy is truthful and not visually aggressive.
- [ ] Security/reassurance cues are placed near sensitive actions (payment/account).

## 7) Mobile-Specific UX

- [ ] Touch targets are finger-safe and consistently spaced.
- [ ] Sticky mobile CTAs do not block core content.
- [ ] Bottom sheets and drawers are dismissible and accessible.
- [ ] Keyboard behavior does not hide active form fields.
- [ ] Scrolling performance remains smooth on long PLP/PDP pages.

## 8) Implementation Mapping (This Repo)

- [ ] `@real/ui`: component states and interaction variants are implemented first.
- [ ] `@real/app`: screens consume reusable primitives, no ad-hoc styling systems.
- [ ] `apps/next`: BFF errors map to clean user-facing messages.
- [ ] `apps/expo`: mirrors customer journeys through BFF, no direct ERP access.
- [ ] `@real/providers` + `@real/adapters`: backend complexity hidden behind contracts.

## 9) Release Gate (Premium UX)

Ship only when all are true:

- [ ] Core flows pass this checklist for both LTR and RTL.
- [ ] No unresolved severe usability issues in search, PLP, PDP, cart, checkout.
- [ ] Visual system remains premium and calm under real CMS content.

---

## Research Sources

- Baymard methodology: https://baymard.com/research/methodology
- Baymard checkout usability research: https://baymard.com/research/checkout-usability
- Baymard checkout benchmark update (2025): https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark
- Baymard search UX: https://baymard.com/ecommerce-search
- Baymard non-product search guidance: https://baymard.com/blog/support-non-product-search
- Baymard product list benchmark: https://baymard.com/blog/ecommerce-product-lists-report-and-benchmark
- Baymard product page research: https://baymard.com/blog/product-page-usability-report-and-benchmark
