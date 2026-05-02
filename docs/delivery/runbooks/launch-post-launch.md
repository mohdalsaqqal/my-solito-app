# Launch And Post-Launch Runbook

Purpose: move a client from staging approval to go-live, then operate the first launch window without guessing.

## Beta Client Plan

Start with one or two beta clients before wider rollout.

Selection criteria:

- Client has named business, technical, finance, and CMS owners.
- Client can provide Odoo/backend and payment gateway sandbox access.
- Client accepts staged rollout and documented limitations.
- Client can test web storefront and mobile app on real devices.

Beta exit criteria:

- Storefront browse/search/product/detail/cart/checkout pass.
- Admin CMS edit, preview, publish, rollback, and schedule flows pass.
- Order write-back behavior is accepted.
- Payment sandbox flow and webhook handling pass.
- Push/email notification path is validated or explicitly deferred.
- Production blockers are either resolved or accepted with a launch decision.

## Migration Checklist

Content:

- Homepage blocks.
- Header, footer, menus, announcement bar.
- SEO metadata and structured data.
- Media library assets.
- Legal pages and policy links.

Commerce:

- Product catalog mapping.
- Categories, brands, variants, prices, inventory.
- Customer account migration decision.
- Order history migration decision.
- Coupon/loyalty/referral migration decision.

Verification:

```bash
yarn verify:functional-storefront:static
yarn verify:cms-lifecycle
yarn verify:search-discovery
```

## Go-Live Checklist

Infrastructure:

- Vercel project/environment exists.
- PostgreSQL database is provisioned and migrations are applied.
- Production environment variables are set.
- DNS records point to the production deployment.
- SSL certificate is active.
- Security headers are present.
- Monitoring and alerts are active.

Integrations:

- Odoo or merchant backend credentials are set.
- Payment gateway live keys are set only after sandbox sign-off.
- Webhook URL is registered with the payment gateway.
- Meilisearch is configured if enabled.
- Push credentials are configured if mobile notifications are enabled.
- Email vendor is configured if transactional email is enabled.

Mobile:

- EAS project is linked.
- iOS bundle identifier and Android package are final.
- App store metadata is ready.
- Push certificates are configured.
- Store review submission is planned.
- EAS Update branch/channel strategy is documented.

Final verification:

```bash
yarn verify:delivery:quality
node scripts/verify-delivery.mjs --profile deploy
node scripts/verify-delivery.mjs --profile operations
node scripts/verify-delivery.mjs --profile security
```

## SLA And Support Channels

Use `sla-support.md` for severity definitions and response targets.

Before go-live, confirm:

- Primary support channel.
- Emergency escalation channel.
- Business owner contact.
- Technical owner contact.
- Finance/payment owner contact.
- CMS/content owner contact.

## First 48 Hours

- Monitor `/api/health`.
- Watch Sentry and deployment logs.
- Check checkout/order creation regularly.
- Confirm payment settlement.
- Confirm order write-back in merchant backend.
- Confirm CMS publish path.
- Confirm push/email delivery if enabled.
- Record issues in the relevant delivery aspect.

## Feedback Loop

Cadence:

- Daily during first launch week.
- Weekly during first month.
- Monthly after stabilization.

Review:

- Merchant admin friction.
- Customer checkout drop-offs.
- Search quality.
- Payment failures.
- Backend sync issues.
- Performance and device reports.
- Requested blocks/adapters.

Outputs:

- Product backlog items.
- Platform hardening items.
- Client-specific configuration tasks.
- Updated blockers or acceptance notes.

## Verification

```bash
yarn verify:launch-post-launch
node scripts/verify-delivery.mjs --profile launch
```
