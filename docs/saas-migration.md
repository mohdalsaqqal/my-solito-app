# SaaS Migration Path

AGENTS.md remains the source of truth. This note records the current delivery path for client work and the future migration path to shared SaaS infrastructure.

## Current Model

- Each client is delivered as an isolated deployment: one web storefront, one native app build, and one database.
- Business logic still treats tenant identity as explicit context, even when a deployment only serves one tenant.
- Tenant resolution belongs in the Next.js server layer. Shared packages never read domains, headers, auth tokens, or environment variables.
- Services pass tenant context to providers and providers pass it to adapters when the integration needs tenant-owned data.

## Future Shared Model

- Tenant identity can move from `TENANT_ID` to domain or auth-token resolution without changing shared screens or provider callers.
- Commerce and CMS tables that could become shared should include `tenantId` and tenant-scoped uniqueness.
- Provider contracts should keep tenant context stable so Odoo, Shopify, PostgreSQL, payment, notification, and search adapters can be swapped per tenant.
- A platform management app can later call the same provisioning logic used by `new-client.ts`.

## Migration Steps

1. Keep isolated deployments until there are enough paying clients to justify shared operations.
2. Add `tenantId` to shared-ready mutable tables before consolidating databases.
3. Replace static tenant resolution with domain/auth based resolution in the server tenant context.
4. Move provider configuration from per-deployment environment variables into tenant-scoped config.
5. Consolidate deployments only after tenant-scoped service queries and provider health checks are verified.

## Avoid

- Do not split shared platform code per client.
- Do not use schema-per-tenant as the default PostgreSQL strategy.
- Do not let shared UI know which tenant it is rendering.
- Do not build billing, self-serve onboarding, or a full multi-tenant dashboard before real client demand validates it.
