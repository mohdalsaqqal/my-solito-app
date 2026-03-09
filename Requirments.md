Real Cosmetics — Premium Commerce Platform
1. Project Overview

Real Cosmetics is a premium, multi-channel commerce platform designed for:

Web (Next.js)

Mobile App (Expo)

Pharmacist Web Tool

Admin/CMS Interface

ERP Integration (external)

Loyalty System

Future SaaS extensibility

The system must:

Be visually premium

Be architecturally modular

Be ERP-integrated

Be CMS-driven

Be RTL-ready

Be extension-ready (adapter-based)

2. Architectural Principles
2.1 Core Philosophy

The system follows a Core + Adapter + Extension architecture:

UI → App API Client → BFF → Provider Registry → Adapter → External System


Rules:

UI never imports adapters

UI never calls ERP directly

BFF normalizes responses

Providers define contracts

Adapters implement external integrations

2.2 Monorepo Structure (Solito v5)
apps/
  next/        → Web
  expo/        → Mobile

packages/
  ui/          → Shared UI primitives
  tokens/      → Design system tokens
  app/         → Shared screens & features
  providers/   → Contracts + registry
  adapters/    → ERP, payment, auth, etc.


Shared screens must render identically across web and mobile.

3. UI / UX Requirements
3.0 Styling System (UniWind Mandatory)

UniWind is the required styling system for shared UI implementation.

Rules:

UniWind utilities are the default styling path in UI components

Design tokens are the single source of truth for color/spacing/radius/shadow values

No parallel styling system for component visuals

No hardcoded left/right directional styling; all styling must remain RTL-safe

Web and mobile shared UI must preserve the same visual semantics

3.1 Visual Identity

Platform must:

Look premium, not discount-heavy

Use black/white base

Use red only for:

Primary CTA

Urgency

Interactive states

Avoid visual clutter

Avoid excessive borders

Use shadow-based elevation system

3.2 RTL Support (Mandatory)

All UI must:

Use logical spacing (start, end)

Avoid left/right

Avoid marginLeft / paddingRight

Work in:

English (LTR)

Arabic (RTL)

RTL must not be an afterthought.

3.3 Header Requirements

Desktop:

TopBar (editable via CMS)

MainHeaderRow:

Logo (CMS controlled)

Search

Account

Cart

NavigationRow:

Main Categories (CMS)

Luxury Brands (CMS)

Flash Deals (CMS)

Mobile:

Minimal header

Search in drawer

Cart as drawer

Bottom Tab Navigation:

Home

Categories

Cart

Account

Cart icon must show real-time count.

3.4 Footer Requirements

Footer includes:

Newsletter (CMS controlled)

Link columns

Contact info

Social icons

Legal links

Footer must be CMS-editable.

3.5 Product Card Requirements

Default state:

Square image (1:1)

Product name

Price

Subtle offer badge (if exists)

Hover (web):

Elevation increase

Show:

Add to Cart

Quick View

No aggressive red base

Red only on interaction

Mobile:

No hover

Buttons visible or revealed via tap

States required:

Default

Hover

Selected

Out of stock

Loading

Disabled

3.6 Shop Page Requirements

Desktop:

4-column grid (default)

Sticky filter sidebar

Filter by:

Category

Brand

Price

Sale

Bundle

Mobile:

2-column grid

Filters in bottom sheet

Must support:

Infinite scroll or paginated loading

Sort dropdown

Skeleton loading states

3.7 Product Detail Page (PDP)

Desktop:

60/40 layout

Sticky mini-header when scrolled

Add to Cart always visible

Mobile:

Full-width image slider

Sticky bottom Add to Cart bar

Must support:

Variants

Shade selection

Bundle selection

Reviews

Cross-sell

Accordion specs

Real-time stock display

3.8 Cart & Checkout

Cart:

Drawer preview

Full cart page

Quantity editing

Remove item

Checkout:

2-column desktop

1-column mobile

Reduced header

Real-time validation

Promo code collapsible

Order summary sticky on desktop

4. Commerce Core Requirements
4.1 Product System

Full ERP sync

Stock per store

Price lists

Discounts

Bundles

Multi-country pricing (future)

4.2 Cart System

Session-based cart

Authenticated cart merge

Real-time count

API endpoint /api/cart

4.3 Order System

Checkout submission

Payment gateway integration

ERP order creation

Order history in account

4.4 Loyalty System

Must support:

Points earning

Tier system (Silver / Gold / Loyal)

Conversion rate configurable

Campaign multiplier support

Expiration policy

Points purchase

Real-time balance

Transaction history

Expiring soon indicator

Barcode for POS redemption

Redemption must:

Work in-store

Sync to ERP

Reflect in user dashboard

5. Pharmacist Tool Requirements

Separate login role.

Must support:

QR/barcode scan

Customer profile view

Test entry

Diagnostic recommendations

Product recommendation

See recommended purchases

See purchase status of recommended items

Check product availability (at least global)

No manual loyalty adjustment allowed.

6. CMS Requirements

CMS controls:

Header menus

Hero slides

Top bar text

Newsletter copy

Promotional banners

Category visuals

Loyalty campaigns

Conversion rate (if allowed)

CMS must not require UI code change for content updates.

7. Integration Requirements
7.1 ERP Integration

System must support:

Product sync

Inventory sync

Order push

Customer sync

Loyalty sync

Integration must be via adapter.

7.2 Payment Gateway

Pluggable adapter

Multiple providers possible (future)

Secure secret handling

7.3 Authentication

Adapter-based

Replaceable in future

8. BFF Requirements

Normalize all provider results

Public response shape:

{ success: true, data }
{ success: false, error }


Log structured failures

No adapter import in routes

9. Performance Requirements

Lazy loading images

LCP hero optimization

No heavy blur effects

No layout shift

Grid must not break from mixed image ratios

Mobile performance target: Lighthouse > 90

10. Extension Architecture Requirements

System must allow:

Multiple ERP adapters

Multiple payment adapters

Multiple auth adapters

Loyalty extension toggle

Future multi-brand support

Registry must allow swapping without UI change.

11. Security Requirements

No secrets in client code

Env variables enforced

Role-based access control

Admin routes protected

Pharmacist routes protected

12. Testing Requirements

Must include:

BFF route tests

Adapter tests

Provider contract validation

Guard scans (import discipline)

RTL pattern enforcement

Build validation for Next + Expo

UniWind usage enforcement in shared UI

13. Future SaaS Consideration

Architecture must support:

Multi-tenant possibility

Brand theming via tokens

Adapter swap

Feature module injection

14. Non-Goals (Phase 1–2)

Not included yet:

Multi-brand white-label

Multi-country tax engine

Subscription engine

AI recommendations

Advanced analytics

15. Success Criteria

System is successful when:

UI renders independently of data availability

Data is dynamic, UI stable

ERP can be swapped

Loyalty logic does not leak into UI

No provider contract leaks to UI

Premium visual identity maintained

Mobile and Web feel native to platform
