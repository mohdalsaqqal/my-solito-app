# Account Hybrid Design (Approved)

Date: 2026-02-23

## Scope
Implement Account using hybrid navigation:
- In-page tabs for: Dashboard, Addresses, Loyalty, Wishlist, Settings
- Route-out tabs for: Orders (`/orders`) and Tests (`/account/tests`)

## Architecture
- Keep `/account` as main account shell.
- Keep provider architecture intact: UI -> apiClient -> BFF -> provider registry -> adapters.
- No direct adapter usage in app/ui layers.
- Use stable payload mapping at page-level now, ready for provider-backed endpoints later.

## Data Readiness
Primary account surfaces prepared for provider-backed data:
- Account overview summary (tier, points, redeemable value, last order)
- Address list
- Loyalty history
- Wishlist list
- Diagnostics test summary

Current implementation uses mock-friendly values on the page while preserving component contracts and callbacks for later provider wiring.

## UI Structure
Desktop:
- Left sidebar account nav + sign out
- Right content area with promo, summary cards, and active tab content

Mobile:
- Horizontal tab rail replacing sidebar
- Stacked content cards

## State Requirements
Per AGENTS requirements, account surfaces include:
- loading states
- empty states
- error states
- disabled state handling for actions in progress

## Routes
- `/account`: hybrid account shell
- `/orders`: existing dedicated orders page
- `/account/tests`: dedicated diagnostics tests page

## Notes
- Layout remains code-owned; mutable marketing content still comes from CMS.
- This implementation is intentionally structured to swap mock values with live provider data without redesigning screen contracts.
