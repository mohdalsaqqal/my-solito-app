# Requirements Traceability Map

This document links the human-facing requirements in `Req.md` to the technical implementation requirements in `Requirments.md`.

## 1) Product Intent
- Human (`Req.md`): Premium cosmetics commerce engine, ERP-connected, loyalty-enabled, pharmacist tool, future scale.
- Technical (`Requirments.md`): Multi-channel platform (Next.js, Expo, pharmacist/admin), ERP integration, loyalty, adapter architecture.
- Implementation target: Keep architecture stable while adapters absorb infrastructure changes.

## 2) Premium UX Direction
- Human (`Req.md`): Luxury feel, calm layout, black/white base, red only for interaction/urgency.
- Technical (`Requirments.md`): Visual identity constraints, low clutter, shadow-based elevation.
- Implementation target: Token-driven visual system and strict component styling discipline.
- Styling enforcement: `UniWind` is the required styling path; tokens define values, UniWind applies them consistently on web and mobile.

## 3) RTL From Day One
- Human (`Req.md`): Arabic + English from start.
- Technical (`Requirments.md`): Mandatory RTL support, logical spacing, avoid left/right hardcoding.
- Implementation target: Direction-aware layout primitives and verified RTL rendering on web + mobile.

## 4) Stable UI With Dynamic Data
- Human (`Req.md`): UI renders structure first; skeleton/empty/error states required.
- Technical (`Requirments.md`): Loading and stateful behavior implied across shop/product/cart flows.
- Implementation target: Every data surface must define `loading`, `empty`, `error`, and `success` states explicitly.

## 5) Core Commerce Scope
- Human (`Req.md`): Listing, PDP, cart, checkout, account, order history.
- Technical (`Requirments.md`): Product/cart/order system sections with ERP as source of truth.
- Implementation target: API/BFF endpoints and provider contracts for product, cart, checkout, orders.

## 6) Global Header and Navigation
- Human (`Req.md`): CMS-driven menus, live cart, mobile bottom nav.
- Technical (`Requirments.md`): Header requirements for desktop/mobile and CMS control.
- Implementation target: Shared shell layout consumes CMS payload and supports real-time cart count updates.

## 7) Shop Experience
- Human (`Req.md`): 4-col desktop, 2-col mobile, bottom-sheet filters.
- Technical (`Requirments.md`): Shop page layout, filters, sorting, loading strategy.
- Implementation target: Responsive grid + filter system with mobile-specific interaction model.

## 8) Product Detail Conversion
- Human (`Req.md`): Sticky add-to-cart, variants, reviews, stock visibility, cross-sell.
- Technical (`Requirments.md`): PDP behavior and required data blocks.
- Implementation target: PDP contract includes variant matrix, inventory signal, and recommendation slots.

## 9) Cart and Checkout
- Human (`Req.md`): Drawer + full page cart; clean checkout with validation.
- Technical (`Requirments.md`): Cart/checkout requirements and behavior.
- Implementation target: Session cart, merge logic, validation pipeline, normalized failure responses.

## 10) Loyalty
- Human (`Req.md`): points, tiers, expiration, multipliers, history, barcode redemption.
- Technical (`Requirments.md`): Loyalty system requirements and ERP synchronization.
- Implementation target: Loyalty module with configurable rules and ERP sync adapter.

## 11) Pharmacist Tool
- Human (`Req.md`): scan, diagnostics, recommendations, purchase visibility, no loyalty edits.
- Technical (`Requirments.md`): Pharmacist role capabilities and restrictions.
- Implementation target: Dedicated role surfaces, strict permission checks, read-only loyalty controls.

## 12) CMS Ownership
- Human (`Req.md`): marketing/content changes without code deploy.
- Technical (`Requirments.md`): CMS controls menus, hero, campaigns, conversion rules (when allowed).
- Implementation target: CMS controls content payloads; layout structure remains code-owned.

## 13) Architecture Pattern
- Human (`Req.md`): UI -> API client -> BFF -> provider -> adapter -> ERP.
- Technical (`Requirments.md`): Core + Adapter + Extension pattern and integration boundaries.
- Implementation target: Enforced import boundaries and registry-only adapter selection.

## 14) Mobile Quality
- Human (`Req.md`): native-feeling interactions, bottom sheets/nav, touch-safe controls.
- Technical (`Requirments.md`): mobile patterns embedded in UI/UX sections.
- Implementation target: native-first component behavior with platform-appropriate interactions.

## 15) Performance
- Human (`Req.md`): fast mobile, no layout shift, resilient image grids.
- Technical (`Requirments.md`): explicit performance requirements and loading rules.
- Implementation target: image strategy, skeletons, and stable layout constraints.

## 16) Security
- Human (`Req.md`): no client secrets, protected roles/routes, normalized API.
- Technical (`Requirments.md`): security requirements and BFF response contract.
- Implementation target: env discipline, middleware RBAC, BFF normalization.

## 17) Future-Proofing
- Human (`Req.md`): multiple adapters, modules, multi-tenant direction, theming by tokens.
- Technical (`Requirments.md`): extension architecture + replaceable integrations.
- Implementation target: adapter registry + module slots without changing core flows.

---

## Alignment Notes
- `Req.md` is outcome-first and intentionally non-technical.
- `Requirments.md` is implementation-first and should carry acceptance criteria.
- Keep both updated together: if one section changes, update its mapped pair in the other file.
