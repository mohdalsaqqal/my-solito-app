# Client Onboarding Runbook

Purpose: move a merchant from signed agreement to go-live with explicit handoffs and verification gates.

## Phase 1 - Sales Handoff

- [ ] Agreement and statement of work are signed.
- [ ] Client business owner, technical owner, finance owner, and marketing/CMS owner are named.
- [ ] Launch markets, languages, currencies, tax rules, and fulfillment modes are captured.
- [ ] Brand kit is collected: logo, colors, typography, imagery, tone, legal footer copy.
- [ ] Existing backend system is identified: Odoo, Shopify, custom ERP, or other.
- [ ] Payment methods are confirmed: COD, pay at branch, online gateway, card on delivery.

Exit gate:

- [ ] `client-agreement-checklist.md` is complete or exceptions are recorded.

## Phase 2 - Provisioning

- [ ] Create client config record or folder.
- [ ] Provision web deployment.
- [ ] Provision database.
- [ ] Provision secrets in the approved secret manager.
- [ ] Configure staging and production URLs.
- [ ] Initialize Expo/EAS project if mobile is in scope.
- [ ] Configure app identifiers for iOS and Android.

Exit gate:

- [ ] Staging web app boots.
- [ ] Expo app config resolves.
- [ ] Required env vars are present.

## Phase 3 - Adapter Configuration

- [ ] Configure catalog adapter.
- [ ] Configure order write-back adapter.
- [ ] Configure payment provider.
- [ ] Configure search provider if Meilisearch is enabled.
- [ ] Configure notification provider if push/email is enabled.
- [ ] Run adapter smoke tests.

Exit gate:

- [ ] Product list/get smoke passes.
- [ ] Checkout quote/order placement smoke passes in staging.
- [ ] Payment sandbox flow passes when gateway credentials exist.

## Phase 4 - Content Migration

- [ ] Import or create homepage content.
- [ ] Configure header, footer, announcement bar, and menu.
- [ ] Upload brand/media assets.
- [ ] Configure key CMS blocks.
- [ ] Review SEO metadata and structured data.
- [ ] Store manager validates CMS preview/publish flow.

Exit gate:

- [ ] Store manager completes edit -> preview -> publish script.

## Phase 5 - QA And Launch

- [ ] Run `yarn verify:delivery:functional`.
- [ ] Run web storefront smoke.
- [ ] Run native smoke on physical devices if mobile is in scope.
- [ ] Verify payment live/sandbox keys according to launch stage.
- [ ] Verify DNS, SSL, security headers, and analytics.
- [ ] Verify monitoring/alerts.
- [ ] Client signs go-live approval.

Exit gate:

- [ ] Go-live checklist is signed off.
- [ ] Known limitations are documented and accepted.

## Phase 6 - Post-Launch

- [ ] Monitor errors and orders for the first 48 hours.
- [ ] Confirm payment settlement and order write-back.
- [ ] Confirm CMS team can publish content.
- [ ] Schedule first post-launch review.
- [ ] Move open items into delivery aspect trackers.
