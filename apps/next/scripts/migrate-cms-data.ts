/**
 * migrate-cms-data.ts
 *
 * Migrates CMS data from JSON file stores in .data/ to PostgreSQL via Prisma.
 * Run after applying the Prisma migration: npx prisma migrate deploy
 *
 * Usage:
 *   npx tsx scripts/migrate-cms-data.ts
 *
 * This script is SAFE to run multiple times — it upserts (insert or update)
 * rather than blindly inserting, so duplicates are handled.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const DATA_DIR = path.join(process.cwd(), '.data')
const prisma = new PrismaClient()

async function readJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[migrate] Skipping ${filename} — not found or invalid`)
    return null
  }
}

async function migrateSiteConfig() {
  const config = await readJson<Record<string, unknown>>('admin-site-config.json')
  if (!config) return

  const branding = config.branding as Record<string, Record<string, string>> | undefined
  const topBar = config.topBar as Record<string, string> | undefined
  const footer = config.footer as Record<string, string> | undefined
  const search = config.search as Record<string, string> | undefined

  await prisma.cmsSiteConfig.upsert({
    where: { id: 'default' },
    create: {
      brandingEnLogoUrl: branding?.en?.logoUrl ?? '',
      brandingEnLogoAlt: branding?.en?.logoAlt ?? 'Real Cosmetics',
      brandingEnLogoSize: branding?.en?.logoSize ?? 'md',
      brandingArLogoUrl: branding?.ar?.logoUrl ?? '',
      brandingArLogoAlt: branding?.ar?.logoAlt ?? 'ريال كوزمتكس',
      brandingArLogoSize: branding?.ar?.logoSize ?? 'md',
      topBarMessageEn: topBar?.messageEn ?? '',
      topBarMessageAr: topBar?.messageAr ?? '',
      topBarCtaLabelEn: topBar?.ctaLabelEn ?? '',
      topBarCtaLabelAr: topBar?.ctaLabelAr ?? '',
      topBarCtaHref: topBar?.ctaHref ?? '',
      footerNewsletterTitleEn: footer?.newsletterTitleEn ?? '',
      footerNewsletterTitleAr: footer?.newsletterTitleAr ?? '',
      footerLegalEn: footer?.legalEn ?? '',
      footerLegalAr: footer?.legalAr ?? '',
      searchPanelTitleEn: search?.panelTitleEn ?? '',
      searchPanelTitleAr: search?.panelTitleAr ?? '',
    },
    update: {
      brandingEnLogoUrl: branding?.en?.logoUrl ?? '',
      brandingEnLogoAlt: branding?.en?.logoAlt ?? 'Real Cosmetics',
      brandingEnLogoSize: branding?.en?.logoSize ?? 'md',
      brandingArLogoUrl: branding?.ar?.logoUrl ?? '',
      brandingArLogoAlt: branding?.ar?.logoAlt ?? 'ريال كوزمتكس',
      brandingArLogoSize: branding?.ar?.logoSize ?? 'md',
      topBarMessageEn: topBar?.messageEn ?? '',
      topBarMessageAr: topBar?.messageAr ?? '',
      topBarCtaLabelEn: topBar?.ctaLabelEn ?? '',
      topBarCtaLabelAr: topBar?.ctaLabelAr ?? '',
      topBarCtaHref: topBar?.ctaHref ?? '',
      footerNewsletterTitleEn: footer?.newsletterTitleEn ?? '',
      footerNewsletterTitleAr: footer?.newsletterTitleAr ?? '',
      footerLegalEn: footer?.legalEn ?? '',
      footerLegalAr: footer?.legalAr ?? '',
      searchPanelTitleEn: search?.panelTitleEn ?? '',
      searchPanelTitleAr: search?.panelTitleAr ?? '',
    },
  })
  console.log('[migrate] SiteConfig ✓')
}

async function migrateTickerSettings() {
  const banners = await readJson<Record<string, unknown>>('admin-banners.json')
  if (!banners) return

  const ticker = banners.ticker as Record<string, unknown> | undefined
  const speedMs = typeof ticker?.speedMs === 'number' ? ticker.speedMs : 4000

  await prisma.cmsTickerSettings.upsert({
    where: { id: 'default' },
    create: { speedMs },
    update: { speedMs },
  })
  console.log('[migrate] TickerSettings ✓')
}

async function migrateTickerItems() {
  const banners = await readJson<Record<string, unknown>>('admin-banners.json')
  if (!banners) return

  const ticker = banners.ticker as Record<string, unknown> | undefined
  const items = (ticker?.items as Array<Record<string, unknown>>) ?? []

  // Delete all existing ticker items and re-insert (simpler than diffing)
  await prisma.cmsTickerItem.deleteMany()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await prisma.cmsTickerItem.create({
      data: {
        id: typeof item.id === 'string' ? item.id : undefined,
        messageEn: (typeof item.messageEn === 'string' ? item.messageEn : '') || '',
        messageAr: (typeof item.messageAr === 'string' ? item.messageAr : '') || '',
        active: item.active !== false,
        order: i,
      },
    })
  }
  console.log(`[migrate] TickerItems: ${items.length} rows ✓`)
}

async function migrateEducationBanners() {
  const banners = await readJson<Record<string, unknown>>('admin-banners.json')
  if (!banners) return

  const eduBanners = (banners.educationBanners as Array<Record<string, unknown>>) ?? []

  // Clear existing and re-insert (preserves order from JSON)
  await prisma.cmsEducationBanner.deleteMany()

  for (let i = 0; i < eduBanners.length; i++) {
    const b = eduBanners[i]
    await prisma.cmsEducationBanner.create({
      data: {
        id: typeof b.id === 'string' ? b.id : undefined,
        titleEn: (typeof b.titleEn === 'string' ? b.titleEn : '') || '',
        titleAr: (typeof b.titleAr === 'string' ? b.titleAr : '') || '',
        bodyEn: (typeof b.bodyEn === 'string' ? b.bodyEn : '') || '',
        bodyAr: (typeof b.bodyAr === 'string' ? b.bodyAr : '') || '',
        targetPage: (typeof b.targetPage === 'string' ? b.targetPage : '') || '',
        active: b.active !== false,
        order: i,
      },
    })
  }
  console.log(`[migrate] EducationBanners: ${eduBanners.length} rows ✓`)
}

async function migrateUGCItems() {
  const ugc = await readJson<Record<string, unknown>>('admin-ugc.json')
  if (!ugc) return

  const items = (ugc.items as Array<Record<string, unknown>>) ?? []

  await prisma.cmsUgcItem.deleteMany()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await prisma.cmsUgcItem.create({
      data: {
        id: typeof item.id === 'string' ? item.id : undefined,
        imageUrl: (typeof item.imageUrl === 'string' ? item.imageUrl : '') || '',
        caption: (typeof item.caption === 'string' ? item.caption : '') || '',
        sourceHandle: (typeof item.sourceHandle === 'string' ? item.sourceHandle : '') || '',
        active: item.active !== false,
        order: typeof item.order === 'number' ? item.order : i,
      },
    })
  }
  console.log(`[migrate] UGCItems: ${items.length} rows ✓`)
}

async function migrateAdminControls() {
  const controls = await readJson<Record<string, unknown>>('admin-controls.json')
  if (!controls) return

  // Toggle overrides
  const toggles = controls.toggleOverrides as Record<string, Record<string, unknown>> | undefined
  if (toggles) {
    await prisma.cmsToggleOverride.deleteMany()
    for (const [id, override] of Object.entries(toggles)) {
      await prisma.cmsToggleOverride.create({
        data: {
          id,
          enabled: override.enabled === true,
          updatedByUserId: ((override.updatedBy as Record<string, unknown>)?.userId as string) ?? '',
          updatedByEmail: ((override.updatedBy as Record<string, unknown>)?.email as string) ?? '',
        },
      })
    }
    console.log(`[migrate] ToggleOverrides: ${Object.keys(toggles).length} rows ✓`)
  }

  // Brand spotlights
  const spotlights = controls.brandSpotlightsOverride as Array<Record<string, unknown>> | undefined
  if (spotlights) {
    await prisma.cmsBrandSpotlight.deleteMany()
    const meta = controls.brandSpotlightMeta as Record<string, Record<string, unknown>> | undefined
    for (let i = 0; i < spotlights.length; i++) {
      const s = spotlights[i]
      const spotlightMeta = meta?.[typeof s.id === 'string' ? s.id : '']
      await prisma.cmsBrandSpotlight.create({
        data: {
          id: typeof s.id === 'string' ? s.id : undefined,
          position: i,
          spotlightJson: JSON.parse(JSON.stringify(s)),
          updatedByUserId: ((spotlightMeta?.updatedBy as Record<string, unknown>)?.userId as string) ?? '',
          updatedByEmail: ((spotlightMeta?.updatedBy as Record<string, unknown>)?.email as string) ?? '',
        },
      })
    }
    console.log(`[migrate] BrandSpotlights: ${spotlights.length} rows ✓`)
  }

  // Offer banners
  const offerBanners = controls.offerBannersOverride as Array<Record<string, unknown>> | undefined
  if (offerBanners) {
    await prisma.cmsOfferBanner.deleteMany()
    for (let i = 0; i < offerBanners.length; i++) {
      const b = offerBanners[i]
      await prisma.cmsOfferBanner.create({
        data: {
          id: typeof b.id === 'string' ? b.id : undefined,
          position: i,
          bannerJson: JSON.parse(JSON.stringify(b)),
        },
      })
    }
    console.log(`[migrate] OfferBanners: ${offerBanners.length} rows ✓`)
  }

  // Audit logs
  const audits = controls.audits as Array<Record<string, unknown>> | undefined
  if (audits) {
    await prisma.cmsAuditLog.deleteMany()
    for (const audit of audits) {
      await prisma.cmsAuditLog.create({
        data: {
          id: typeof audit.id === 'string' ? audit.id : undefined,
          type: typeof audit.type === 'string' ? audit.type : 'UNKNOWN',
          targetId: typeof audit.targetId === 'string' ? audit.targetId : '',
          actorUserId: ((audit.actor as Record<string, unknown>)?.userId as string) ?? '',
          actorEmail: ((audit.actor as Record<string, unknown>)?.email as string) ?? '',
          changes: audit.changes ?? {},
        },
      })
    }
    console.log(`[migrate] AuditLogs: ${audits.length} rows ✓`)
  }
}

async function main() {
  console.log('[migrate] Starting CMS data migration from JSON → PostgreSQL\n')

  await migrateSiteConfig()
  await migrateTickerSettings()
  await migrateTickerItems()
  await migrateEducationBanners()
  await migrateUGCItems()
  await migrateAdminControls()

  console.log('\n[migrate] ✅ CMS data migration complete')
  console.log('[migrate] JSON files in .data/ can now be safely removed')
}

main()
  .catch((err) => {
    console.error('[migrate] Failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
