# Client Agreement Checklist

Purpose: make the commercial/legal frame explicit before a client project starts. This is an implementation checklist, not legal advice; final terms require legal review.

## Parties And Scope

- [ ] Merchant legal entity name, address, registration number, and billing contact are captured.
- [ ] Platform operator legal entity and support contact are captured.
- [ ] Storefront scope is defined: web, iOS, Android, admin/CMS, integrations, and launch markets.
- [ ] Out-of-scope items are listed, including marketplace, self-serve onboarding, A/B testing, or custom ERP work not in the statement of work.

## Platform Ownership

- [ ] Agreement states the platform framework remains owned by the platform operator.
- [ ] Client-specific content, brand assets, catalog data, customer data, and order data ownership is defined.
- [ ] Source-code buyout option is defined separately and not implied by normal subscription.
- [ ] Reusable adapters, CMS blocks, design-system improvements, and operational tooling ownership is defined.

## Data And Isolation

- [ ] Deployment model is recorded: isolated per-client web app, mobile app, and database unless otherwise agreed.
- [ ] Tenant/data isolation responsibilities are defined.
- [ ] Data processor/controller roles are defined.
- [ ] Data export obligations and timelines are defined.
- [ ] Data deletion/offboarding obligations are defined.

## Integrations

- [ ] Merchant backend owner and access path are identified.
- [ ] Odoo/custom ERP/Shopify integration responsibility is defined.
- [ ] Payment gateway responsibility is defined.
- [ ] Integration sandbox and production credential ownership is defined.
- [ ] Failure modes are defined for backend downtime, payment downtime, and webhook failures.

## Service Levels

- [ ] Uptime target is defined.
- [ ] Support hours and channels are defined.
- [ ] Severity levels and response targets are attached from `sla-support.md`.
- [ ] Exclusions are defined: third-party outage, client credential failure, app store review delay, force majeure.

## Commercial Terms

- [ ] Setup fee is defined.
- [ ] Monthly platform fee is defined.
- [ ] Custom adapter/block work rate is defined.
- [ ] Maintenance and upgrade coverage is defined.
- [ ] App store, cloud, payment, search, monitoring, and third-party costs are assigned.

## Acceptance

- [ ] Acceptance criteria are linked to the delivery matrix.
- [ ] Staging acceptance window is defined.
- [ ] Go-live approval process is defined.
- [ ] Post-launch warranty period is defined.

## Required Attachments

- [ ] Statement of work.
- [ ] SLA/support terms.
- [ ] Data processing addendum if required.
- [ ] Source-code buyout terms if offered.
- [ ] Integration handoff checklist.
