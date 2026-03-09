# Tasks.md — Real Cosmetics Execution Plan

This file defines granular execution tasks per milestone.
Milestones.md is the phase authority.
Tasks must align strictly to milestone phase order.

---

# Sprint Board (Agile Execution)

Use this board for active delivery while keeping phase discipline below.

## Backlog
- `[S-004]` Pharmacist flow hardening:
  - web/expo responsive UX across:
    - `/pharmacist/scan`
    - `/pharmacist/customer/[id]`
    - `/pharmacist/customer/[id]/new-test`
    - `/pharmacist/customer/[id]/review`
  - acceptance:
    - no overflow/cut controls on mobile widths
    - scan/search/review/submit flow works end-to-end
    - role guard behavior remains correct
- `[S-005]` Checkout parity and reliability:
  - ensure web + expo show full checkout sections (contact/fulfillment/address/payment)
  - keep cart state consistent when navigating cart <-> checkout <-> home
  - acceptance:
    - no empty-cart desync on route changes
    - order place succeeds with valid payload
- `[S-006]` Account UX parity pass:
  - finalize tab behavior and data consistency (orders/tests/wishlist/addresses/loyalty)
  - acceptance:
    - all tabs load provider data correctly
    - order details and test details complete and stable

## In Progress
- `[S-001]` Establish sprint board + top priorities in `Tasks.md` (this task)
- `[S-002]` Documentation baseline freeze:
  - keep `docs/TECHNICAL_IMPLEMENTATION_DOCUMENTATION.md` updated with contracts/routes/flows
- `[S-003]` Feature-freeze checklist enforcement:
  - update docs + run checks (`tsc`, `guard:checks`) on each frozen feature

## QA
- _(empty)_

## Done
- _(empty)_

---

# Phase 0 — Foundation

0.1 Initialize monorepo structure
0.2 Setup apps/next (App Router)
0.3 Setup apps/expo (Solito shell)
0.4 Create packages/app shared layer
0.5 Configure TypeScript + ESLint
0.6 Verify shared screen renders in web + mobile
0.7 Run architecture gates + build checks

No UI implementation allowed.

---

# Phase 1 — Design System (CRITICAL)

Reference:
UI_EXECUTION_STRATEGY.md

1.1 Create design tokens (colors, typography, spacing, radius, breakpoints, shadow)
1.2 Setup styling system (NativeWind/Tailwind/etc.)
1.3 Build core primitives:
    - Box
    - Stack
    - Row
    - Text
    - Image
    - Button (token-based)
    - Card base
1.4 Implement Cairo font (web + mobile)
1.5 Validate no hardcoded design values
1.6 Run lint + build gates

No feature-level components allowed yet.

---

# Phase 2 — Provider Abstraction

2.1 Define provider interfaces (commerce, cms, payment)
2.2 Implement mock provider
2.3 Implement Odoo provider
2.4 Create runtime provider selector
2.5 Wire BFF to provider runtime
2.6 Add provider unit tests
2.7 Validate no Odoo leakage in BFF

No UI changes allowed.

---

# Phase 3 — Backend Infrastructure

3.1 Implement BFF route layer
3.2 Add /v1 API endpoints
3.3 Create API response envelope
3.4 Implement pagination shape
3.5 Add filtering support (category, brand, sale)
3.6 Add contract + smoke tests
3.7 Create packages/api client
3.8 Validate build + test gates

Backend contract freezes after this phase.

---

# Phase 4 — Core Layout (Structural UI Layer)

Reference:
UI_EXECUTION_STRATEGY.md

This phase builds the UI scaffolding, not commerce features.

4.1 Create packages/ui/components directory
4.2 Implement structural components:
    - Container
    - Section
    - PageLayout
    - Grid (3→4 responsive)
    - SidebarLayout
    - Header
    - Footer
    - Carousel base
4.3 Wire Header/Footer into shell
4.4 Implement navigation structure (Solito-compatible)
4.5 Replace placeholder feature shells
4.6 Validate layout consistency with tokens
4.7 Run build + style gates

No ProductCard yet.
No Shop screen yet.

---

# Phase 5 — Commerce UI

Reference:
UI_EXECUTION_STRATEGY.md

5.1 Implement ProductCard (variant: shop + slider)
5.2 Implement Shop screen
5.3 Implement Sidebar filters
5.4 Implement Pagination + limit selector
5.5 Connect Shop to API client
5.6 Implement Product page
5.7 Implement Sticky Add-to-Cart
5.8 Validate API → UI data flow
5.9 Run build + token compliance gates

Homepage not fully assembled yet.

---

# Phase 6 — Homepage Assembly

6.1 Implement Hero section
6.2 Implement 4 commercial blocks (2x2 grid)
6.3 Implement Flash Deals rail
6.4 Implement Bundle section
6.5 Implement Trending section
6.6 Implement Brand blocks
6.7 Validate density + spacing rhythm
6.8 Performance pass

---

# Phase 7 — Cart + Checkout UI

7.1 Implement Cart drawer
7.2 Implement Cart page
7.3 Implement Checkout screen
7.4 Wire payment flow
7.5 Validate order submission via API

---

# Phase 8 — CMS Integration

8.1 Connect banners to CMS provider
8.2 Connect homepage blocks to CMS
8.3 Replace mock content gradually
8.4 Validate provider switching (mock → Odoo)

---

# Non-Negotiable Rules

- No skipping phases
- No hardcoded design values
- No direct API calls inside UI components
- All UI must use tokens
- All layout must use primitives
- Features must not contain styling logic
- Provider layer must remain ERP-agnostic
