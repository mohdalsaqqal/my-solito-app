# Product Page V1 Design

Date: 2026-02-20
Status: Approved and implemented

## Understanding Summary
- Build Product Page V1 with strong UI/UX focus and AGENTS-compliant architecture.
- Keep architecture chain: UI -> apiClient -> BFF -> provider registry -> adapters.
- Product page should support desktop + mobile with RTL-safe layout behavior.
- Include required UI states: loading, empty, error, disabled, out-of-stock.
- Add marketing feature: "Complete the set" with CMS-curated intent.

## Final Decisions
1. Base layout: desktop gallery-left + details-right; mobile stacked.
2. Gallery: main image + vertical thumbnails; hide thumbnails when not available.
3. Purchase area: sticky right column on desktop.
4. Product content: tabbed sections (Description, How to use, Ingredients).
5. Related products: horizontal carousel below details.
6. Out-of-stock handling: disabled "Out of stock" primary + "Notify me" secondary.
7. Mobile behavior: sticky bottom purchase action.
8. Variations: include generic option selector block in V1.
9. Complete set: CMS-curated strategy, preselect top 1 item, add main + selected together.

## Approach Options Considered
- Option 1 (chosen): component-first in packages/app + @real/ui, thin route.
- Option 2: large route-first implementation.
- Option 3: full module split immediately.

Chosen because it balances speed and maintainable architecture while staying adapter-safe.

## Data & Behavior Notes
- Product page route fetches product detail + product list + CMS home.
- Complete set currently uses config fallback in app layer while preserving CMS-curated model intent.
- Related products derive from product list excluding current and complete-set IDs.
- Search click-through to PDP is intentionally deferred until PDP finalization complete.

## Risks / Follow-ups
- CMS contract does not yet expose explicit `completeSetByProductId`; fallback config is temporary.
- Product contract does not yet include rich media arrays and structured content fields.
- Next iteration should move complete-set mapping from config fallback to CMS payload once contract update is approved.

## Validation Targets
- Guard scans pass.
- Next build passes.
- Manual visual validation required for desktop/mobile + LTR/RTL + all required states.
