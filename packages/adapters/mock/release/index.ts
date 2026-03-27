import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import {
  ReleaseProvider,
  ReleaseRecord,
  ReleaseBlockRecord,
  ReleaseEnvironment,
  ReleaseStatus,
  ReleaseBlockType,
} from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-releases.json')

type ReleaseStore = {
  releases: ReleaseRecord[]
  blocks: ReleaseBlockRecord[]
}

const now = new Date().toISOString()

const seedStore: ReleaseStore = {
  releases: [
    {
      id: 'rel-prod-home-v1',
      environment: 'production',
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rel-staging-home-v1',
      environment: 'staging',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ],
  blocks: [
    {
      id: 'blk-hero-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 1,
      type: 'hero',
      payloadJson: {
        id: 'hero-main',
        type: 'hero',
        title: { en: 'Luxury marketplace deals', ar: 'عروض سوق فاخر' },
        subtitle: { en: 'Curated premium picks', ar: 'اختيارات فاخرة بعناية' },
        ctaLabel: { en: 'Shop now', ar: 'تسوق الآن' },
        imageUrl:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
      },
    },
    {
      id: 'blk-slider-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 2,
      type: 'product_slider',
      payloadJson: {
        id: 'slider-best-items',
        type: 'product_slider',
        title: { en: 'Best Items for This Month', ar: 'أفضل المنتجات لهذا الشهر' },
        querySlug: 'home-best-items',
      },
    },
    {
      id: 'blk-strip-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 3,
      type: 'promo_strip',
      payloadJson: {
        id: 'strip-shipping',
        type: 'promo_strip',
        text: { en: 'Free shipping over 20 JDS', ar: 'شحن مجاني فوق 20 دينار' },
        ctaLabel: { en: 'Shop now', ar: 'تسوق الآن' },
        href: '/shop',
      },
    },
    // ── New block type seeds ──────────────────────────────────────────────────
    {
      id: 'blk-hero-carousel-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 4,
      type: 'hero_carousel',
      payloadJson: {
        id: 'hero-carousel-main',
        type: 'hero_carousel',
        autoplayMs: 4000,
        cards: [
          {
            id: 'hc-card-1',
            titleEn: 'Build a Better Daily Ritual',
            titleAr: 'ابنِ روتيناً يومياً أفضل',
            subtitleEn: 'A skin-first edit of cleansers, serums, and moisturizers.',
            subtitleAr: 'تشكيلة تُعنى بالبشرة من المنظفات والسيروم والمرطبات.',
            imageUrl: '/figma/hero/tile-2-editorial.png',
            ctaLabelEn: 'Explore the edit',
            ctaLabelAr: 'استكشف التشكيلة',
            href: '/shop',
            badgeLabelEn: 'Routine Notes',
            badgeLabelAr: 'ملاحظات الروتين',
          },
          {
            id: 'hc-card-2',
            titleEn: 'Fresh Launches Across the Floor',
            titleAr: 'إطلاقات جديدة في جميع الأقسام',
            subtitleEn: 'Trending drops, exclusive bundles, and just-landed beauty.',
            subtitleAr: 'أحدث الإطلاقات والباقات الحصرية والمستجدات الجمالية.',
            imageUrl: '/figma/hero/tile-3-new.jpg',
            ctaLabelEn: 'Shop new arrivals',
            ctaLabelAr: 'تسوق الوافد الجديد',
            href: '/shop',
            badgeLabelEn: 'New In',
            badgeLabelAr: 'جديد',
          },
        ],
      },
    },
    {
      id: 'blk-flash-sale-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 5,
      type: 'flash_sale',
      payloadJson: {
        id: 'flash-sale-main',
        type: 'flash_sale',
        titleEn: 'Flash Zone: up to 45% off',
        titleAr: 'منطقة العروض: حتى 45% خصم',
        timerEndsAt: '2026-04-01T20:00:00.000Z',
        urgencyLabelEn: 'Selling fast',
        urgencyLabelAr: 'يباع بسرعة',
        ctaLabelEn: 'Open flash sale',
        ctaLabelAr: 'افتح العروض',
        href: '/sales',
        imageUrl:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&h=600&q=80',
      },
    },
    {
      id: 'blk-brand-spotlight-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 6,
      type: 'brand_spotlight',
      payloadJson: {
        id: 'brand-spotlight-cerave',
        type: 'brand_spotlight',
        bannerTitleEn: 'CeraVe Spotlight',
        bannerTitleAr: 'إبراز CeraVe',
        bannerSubtitleEn: 'Shop the most-loved skincare picks from CeraVe.',
        bannerSubtitleAr: 'تسوق أبرز منتجات CeraVe للعناية بالبشرة.',
        bannerImageUrl:
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1800&h=700&q=80',
        bannerCtaLabelEn: 'Shop CeraVe',
        bannerCtaLabelAr: 'تسوق CeraVe',
        bannerHref: '/shop?brands=cerave',
        railTitleEn: 'CeraVe Highlights',
        railTitleAr: 'أبرز منتجات CeraVe',
        querySlug: 'home-best-items',
      },
    },
    {
      id: 'blk-offer-banners-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 7,
      type: 'offer_banners',
      payloadJson: {
        id: 'offer-banners-main',
        type: 'offer_banners',
        items: [
          {
            id: 'ob-1',
            imageUrl:
              'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&h=600&q=80',
            href: '/shop/categories/skincare',
            ctaLabelEn: 'Shop Skincare',
            ctaLabelAr: 'تسوق العناية بالبشرة',
          },
          {
            id: 'ob-2',
            imageUrl:
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&h=600&q=80',
            href: '/shop/categories/makeup',
            ctaLabelEn: 'Shop Makeup',
            ctaLabelAr: 'تسوق المكياج',
          },
          {
            id: 'ob-3',
            imageUrl:
              'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=900&h=600&q=80',
            href: '/shop/categories/fragrance',
            ctaLabelEn: 'Shop Fragrance',
            ctaLabelAr: 'تسوق العطور',
          },
          {
            id: 'ob-4',
            imageUrl:
              'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&h=600&q=80',
            href: '/shop/categories/haircare',
            ctaLabelEn: 'Shop Haircare',
            ctaLabelAr: 'تسوق العناية بالشعر',
          },
        ],
      },
    },
    {
      id: 'blk-education-banner-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 8,
      type: 'education_banner',
      payloadJson: {
        id: 'education-banner-quiz',
        type: 'education_banner',
        titleEn: 'Find Your Perfect Routine',
        titleAr: 'ابحثي عن روتينك المثالي',
        bodyEn: 'Take a guided skin quiz and unlock expert product picks.',
        bodyAr: 'خذي اختبار البشرة واحصلي على ترشيحات دقيقة.',
        ctaLabelEn: 'Take Test',
        ctaLabelAr: 'ابدأ الاختبار',
        href: '/shop',
        imageUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&h=700&q=80',
      },
    },
    {
      id: 'blk-newsletter-cta-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 9,
      type: 'newsletter_cta',
      payloadJson: {
        id: 'newsletter-cta-main',
        type: 'newsletter_cta',
        titleEn: 'Join our rewards program',
        titleAr: 'انضم لبرنامج المكافآت',
        subtitleEn: 'Earn points on every order and unlock exclusive launches.',
        subtitleAr: 'اكسب نقاطاً مع كل طلب واحصل على إطلاقات حصرية.',
        ctaLabelEn: 'Subscribe',
        ctaLabelAr: 'اشترك',
        href: '/account',
      },
    },
    {
      id: 'blk-top-brands-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 10,
      type: 'top_brands',
      payloadJson: {
        id: 'top-brands-main',
        type: 'top_brands',
        titleEn: 'Top Brands',
        titleAr: 'أهم العلامات التجارية',
        items: [
          { id: 'tb-1', name: 'CeraVe', href: '/shop?brands=cerave' },
          { id: 'tb-2', name: 'La Roche-Posay', href: '/shop?brands=la-roche-posay' },
          { id: 'tb-3', name: 'Neutrogena', href: '/shop?brands=neutrogena' },
          { id: 'tb-4', name: 'Olay', href: '/shop?brands=olay' },
          { id: 'tb-5', name: 'Maybelline', href: '/shop?brands=maybelline' },
          { id: 'tb-6', name: 'L\'Oréal', href: '/shop?brands=loreal' },
        ],
      },
    },
    {
      id: 'blk-ugc-gallery-1',
      releaseId: 'rel-prod-home-v1',
      enabled: true,
      position: 11,
      type: 'ugc_gallery',
      payloadJson: {
        id: 'ugc-gallery-main',
        type: 'ugc_gallery',
        titleEn: 'Looks From Our Community',
        titleAr: 'إطلالات من مجتمعنا',
      },
    },
    {
      id: 'blk-personalized-rail-1',
      releaseId: 'rel-prod-home-v1',
      position: 12,
      type: 'personalized_rail',
      enabled: false,
      payloadJson: {
        id: 'personalized-rail-for-you',
        type: 'personalized_rail',
        titleEn: 'Recommended for You',
        titleAr: 'موصى بها لك',
        mode: 'rule-based',
      },
    },
    // ── Staging release extra examples ────────────────────────────────────────
    {
      id: 'blk-staging-hero-carousel-1',
      releaseId: 'rel-staging-home-v1',
      enabled: true,
      position: 1,
      type: 'hero_carousel',
      payloadJson: {
        id: 'staging-hero-carousel',
        type: 'hero_carousel',
        autoplayMs: 5000,
        cards: [
          {
            id: 'stg-hc-1',
            titleEn: 'Staging: New Season Edit',
            titleAr: 'تجريبي: تشكيلة الموسم الجديد',
            imageUrl: '/figma/hero/tile-4-luxury.png',
            ctaLabelEn: 'Preview now',
            ctaLabelAr: 'معاينة الآن',
            href: '/shop',
          },
        ],
      },
    },
    {
      id: 'blk-staging-flash-sale-1',
      releaseId: 'rel-staging-home-v1',
      enabled: true,
      position: 2,
      type: 'flash_sale',
      payloadJson: {
        id: 'staging-flash-sale',
        type: 'flash_sale',
        titleEn: 'Staging Flash Sale',
        titleAr: 'عروض سريعة تجريبية',
        timerEndsAt: '2026-05-01T20:00:00.000Z',
        ctaLabelEn: 'See deals',
        ctaLabelAr: 'عرض التخفيضات',
        href: '/sales',
      },
    },
  ],
}

function releaseId() {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function blockId() {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function readStore(): Promise<ReleaseStore> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ReleaseStore>
    return {
      releases: Array.isArray(parsed.releases) ? (parsed.releases as ReleaseRecord[]) : [],
      blocks: Array.isArray(parsed.blocks) ? (parsed.blocks as ReleaseBlockRecord[]) : [],
    }
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(STORAGE_FILE, JSON.stringify(seedStore), 'utf8')
    return seedStore
  }
}

async function writeStore(store: ReleaseStore) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(store), 'utf8')
}

export const mockReleaseAdapter: ReleaseProvider = {
  async list(environment?: ReleaseEnvironment) {
    const store = await readStore()
    const rows = environment
      ? store.releases.filter((item) => item.environment === environment)
      : store.releases
    return { ok: true, data: rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }
  },
  async create(input) {
    const store = await readStore()
    const nowIso = new Date().toISOString()
    const created: ReleaseRecord = {
      id: releaseId(),
      name: input.name,
      environment: input.environment,
      status: input.status ?? 'draft',
      scheduledAt: input.scheduledAt,
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    store.releases.unshift(created)
    await writeStore(store)
    return { ok: true, data: created }
  },
  async update(id, input) {
    const store = await readStore()
    const index = store.releases.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_NOT_FOUND', message: 'Release not found.' } }
    }
    const current = store.releases[index]
    const updated: ReleaseRecord = {
      ...current,
      name: input.name !== undefined ? input.name : current.name,
      environment: input.environment ?? current.environment,
      status: input.status ?? current.status,
      scheduledAt: input.scheduledAt !== undefined ? input.scheduledAt : current.scheduledAt,
      updatedAt: new Date().toISOString(),
    }
    store.releases[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async publish(id) {
    const store = await readStore()
    const index = store.releases.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_NOT_FOUND', message: 'Release not found.' } }
    }
    const current = store.releases[index]
    const nowIso = new Date().toISOString()
    for (let i = 0; i < store.releases.length; i += 1) {
      const release = store.releases[i]
      if (release.environment === current.environment && release.status === 'published') {
        store.releases[i] = { ...release, status: 'draft', updatedAt: nowIso }
      }
    }
    const updated: ReleaseRecord = { ...current, status: 'published', updatedAt: nowIso }
    store.releases[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async getPublished(environment: ReleaseEnvironment) {
    const store = await readStore()
    const release = store.releases.find((item) => item.environment === environment && item.status === 'published')
    if (!release) {
      return {
        ok: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'No published release found for the requested environment.',
        },
      }
    }
    return { ok: true, data: release }
  },
  async getById(id: string) {
    const store = await readStore()
    const release = store.releases.find((item) => item.id === id)
    if (!release) {
      return {
        ok: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'Release not found.',
        },
      }
    }
    return { ok: true, data: release }
  },
  async listBlocks(releaseId: string) {
    const store = await readStore()
    const blocks = store.blocks.filter((item) => item.releaseId === releaseId)
    return { ok: true, data: [...blocks].sort((a, b) => a.position - b.position) }
  },
  async createBlock(input) {
    const store = await readStore()
    const created: ReleaseBlockRecord = {
      id: blockId(),
      releaseId: input.releaseId,
      position: input.position,
      type: input.type as ReleaseBlockType,
      payloadJson: input.payloadJson,
      enabled: true,
    }
    store.blocks.push(created)
    await writeStore(store)
    return { ok: true, data: created }
  },
  async updateBlock(id, input) {
    const store = await readStore()
    const index = store.blocks.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_BLOCK_NOT_FOUND', message: 'Release block not found.' } }
    }
    const current = store.blocks[index]
    const updated: ReleaseBlockRecord = {
      ...current,
      position: input.position ?? current.position,
      type: (input.type as ReleaseBlockType | undefined) ?? current.type,
      payloadJson: input.payloadJson ?? current.payloadJson,
      enabled: input.enabled ?? current.enabled ?? true,
    }
    store.blocks[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async deleteBlock(id) {
    const store = await readStore()
    const exists = store.blocks.some((item) => item.id === id)
    if (!exists) {
      return { ok: false, error: { code: 'RELEASE_BLOCK_NOT_FOUND', message: 'Release block not found.' } }
    }
    store.blocks = store.blocks.filter((item) => item.id !== id)
    await writeStore(store)
    return { ok: true, data: { id, deleted: true } }
  },
}

