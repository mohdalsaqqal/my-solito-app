# Backup & Recovery Runbook

Purpose: define backup scope, schedule, and recovery procedures for production data.

## What to Back Up

### Critical (must back up)

| Asset | Contains | Recovery Impact |
|---|---|---|
| Postgres database | Orders, customers, CMS content, referral/loyalty records, pharmacist consultations, rate-limit state, audit logs | Full data loss if not backed up |
| Environment variables | Auth secrets, API keys, DB URLs, payment/webhook secrets | App cannot start without them |

### Important (back up, can regenerate)

| Asset | Contains | Recovery Impact |
|---|---|---|
| Prisma migration history | Schema change log | Can regenerate with `prisma migrate dev`, but production migration history is authoritative |
| Uploaded media (if local) | Product images, brand logos, CMS block images | Lost if only stored on app disk |

### Not Required (regenerate from source)

| Asset | Why |
|---|---|
| Next.js build output | Rebuilt by `next build` |
| node_modules | Rebuilt by `yarn install` |
| Expo app binary | Rebuilt by `eas build` |

## Backup Schedule

### Postgres

| Frequency | Method | Retention |
|---|---|---|
| Continuous | WAL archiving (if available from provider) | 7 days for PITR |
| Daily | `pg_dump` (full, custom format) | 30 days |
| Weekly | `pg_dump` (full, plain SQL) | 90 days |
| Before each migration | `pg_dump` (schema-only) | 90 days |

Daily backup command:

```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --file="backups/$(date +%Y-%m-%d)-real-commerce.dump"
```

### Environment Variables

Export from Vercel or secret manager before any rotation:

```bash
# Vercel
vercel env pull --environment=production > .env.production.backup.$(date +%Y-%m-%d)

# Manual (from secret manager UI or CLI)
# Save securely, encrypt at rest, do not commit to repo
```

### Uploaded Media

If using local storage (Next.js `public/` uploads):

```bash
# Backup to off-instance storage (S3, GCS, or separate volume)
tar -czf "backups/$(date +%Y-%m-%d)-media.tar.gz" apps/next/public/uploads/
```

If using S3/GCS already, ensure bucket versioning is enabled.

## Point-in-Time Recovery (PITR)

### Prerequisites

- WAL archiving enabled (provider-managed Postgres: typically included)
- Base backup available (daily full dump)
- WAL segments retained for recovery window (7 days minimum)

### Recovery Steps

1. Restore base backup to a new Postgres instance:
   ```bash
   pg_restore --dbname="$RECOVERY_DB_URL" backups/YYYY-MM-DD-real-commerce.dump
   ```

2. Apply WAL segments to reach desired point-in-time:
   ```bash
   # Provider-specific: use their PITR UI or pg_rewind
   # AWS RDS: rds-restore-db-instance-to-point-in-time
   # Vercel Postgres: use dashboard PITR restore
   # Supabase: use dashboard point-in-time recovery
   ```

3. Verify recovery:
   ```bash
   psql "$RECOVERY_DB_URL" -c "SELECT count(*) FROM orders WHERE created_at < 'target-timestamp';"
   ```

4. Point app at recovered database (update `DATABASE_URL`).

## Full Disaster Recovery

1. Provision new Postgres instance.
2. Restore latest daily backup.
3. Apply WAL to latest available point.
4. Restore environment variables from backup.
5. Restore uploaded media from backup.
6. Run migrations to confirm schema is current:
   ```bash
   npx prisma migrate deploy
   ```
7. Deploy app to Vercel (or existing deployment already points at new DB URL).
8. Verify:
   ```bash
   yarn verify:functional-storefront
   ```

## Recovery Verification

Test recovery quarterly:

- [ ] Restore latest daily backup to a staging DB.
- [ ] Run `npx prisma migrate deploy` against restored DB.
- [ ] Run `yarn verify:functional-storefront` against restored DB.
- [ ] Confirm order history, customer accounts, CMS content, referral/loyalty records are intact.
- [ ] Confirm pharmacist consultation records are intact.
- [ ] Time the full process from backup file to verified running app.

## Provider-Specific Notes

### Vercel Postgres

- Dashboard has built-in PITR restore.
- Daily automated backups included.
- Run `vercel env pull` to back up env vars separately.

### Supabase

- Dashboard PITR under Database → Backups.
- WAL retention depends on plan tier.
- Backups page shows available restore points.

### AWS RDS

- Automated backups enabled by default (retention configurable).
- `rds-restore-db-instance-to-point-in-time` for PITR.
- Manual snapshots for long-term retention.

### Self-Managed Postgres

- Use `pg_dump` + WAL archiving with `archive_command`.
- Store WAL segments off-instance.
- Use `pg_basebackup` for base backups.
- Test recovery with `pg_rewind` or manual PITR.

## Retention Policy

| Backup Type | Retention | Reason |
|---|---|---|
| Continuous WAL | 7 days | PITR within recovery window |
| Daily full | 30 days | Operational restore |
| Weekly full | 90 days | Compliance / audit |
| Pre-migration schema | 90 days | Rollback capability |
| Env var exports | 90 days | Rotated after each secret rotation |

## Related Documents

- `docs/delivery/PRODUCTION_BLOCKERS.md` — Database section (Postgres required, migrations)
- `docs/delivery/CLIENT_HANDOFF_PACK.md` — Env vars reference
- `docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md` — Operator docs index
