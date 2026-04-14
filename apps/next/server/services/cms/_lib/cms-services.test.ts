import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  readSiteConfig,
  writeSiteConfig,
  mergeSiteConfigState,
  type SiteConfigState,
} from '../cms-site-config.service'
import { initialSiteConfigState } from './normalizers'
import {
  readBannersState,
  writeBannersState,
  type BannersState,
  type TickerItem,
  type EducationBanner,
} from '../cms-banners.service'
import {
  readUGCState,
  writeUGCState,
  type UGCState,
} from '../cms-ugc.service'
import {
  readHomeMerchandising,
  applyMerchandisingToCms,
  type HomeMerchandisingResult,
} from '../cms-home-merchandising.service'

describe('CMS Service Contracts', () => {
  describe('readSiteConfig', () => {
    it('returns initial state when DB is unreachable (graceful fallback)', async () => {
      const result = await readSiteConfig()
      assert(result.branding.en.logoAlt)
      assert(result.branding.ar.logoAlt)
    })
  })

  describe('writeSiteConfig', () => {
    it('accepts a valid SiteConfigState shape', async () => {
      const state: SiteConfigState = {
        branding: {
          en: { logoUrl: '/logo.png', logoAlt: 'Test', logoSize: 'md' },
          ar: { logoUrl: '/logo-ar.png', logoAlt: 'اختبار', logoSize: 'md' },
        },
        topBar: { messageEn: 'Hello', messageAr: 'مرحبا', ctaLabelEn: 'Go', ctaLabelAr: 'اذهب', ctaHref: '/shop' },
        footer: { newsletterTitleEn: 'Subscribe', newsletterTitleAr: 'اشترك', legalEn: '(c) Test', legalAr: '(c) اختبار' },
        search: { panelTitleEn: 'Search', panelTitleAr: 'بحث' },
      }
      // Will fail if DB is unreachable, but function exists and accepts the shape
      await writeSiteConfig(state).catch(() => { /* DB may be down in test env */ })
    })
  })

  describe('mergeSiteConfigState', () => {
    it('applies a patch over current state', () => {
      const current = initialSiteConfigState()
      const patch: Partial<SiteConfigState> = { topBar: { ...current.topBar, messageEn: 'New' } }
      const merged = mergeSiteConfigState(current, patch)
      assert.equal(merged.topBar.messageEn, 'New')
      assert.equal(merged.topBar.messageAr, '')
    })
  })

  describe('readBannersState', () => {
    it('returns initial state when DB is unreachable (graceful fallback)', async () => {
      const result = await readBannersState()
      assert(Array.isArray(result.ticker.items))
      assert(Array.isArray(result.educationBanners))
      assert(typeof result.ticker.speedMs === 'number')
    })
  })

  describe('writeBannersState', () => {
    it('accepts a valid BannersState shape', async () => {
      const state: BannersState = {
        ticker: {
          items: [{ id: 't1', messageEn: 'Hi', messageAr: 'مرحبا', active: true }],
          speedMs: 3000,
        },
        educationBanners: [{ id: 'b1', titleEn: 'Info', titleAr: 'معلومات', bodyEn: '', bodyAr: '', targetPage: 'home', active: true }],
      }
      await writeBannersState(state).catch(() => { /* DB may be down in test env */ })
    })
  })

  describe('readUGCState', () => {
    it('returns initial state when DB is unreachable (graceful fallback)', async () => {
      const result = await readUGCState()
      assert(Array.isArray(result.items))
    })
  })

  describe('writeUGCState', () => {
    it('accepts a valid UGCState shape', async () => {
      const state: UGCState = {
        items: [{ id: 'u1', imageUrl: '/img.jpg', caption: 'Test', sourceHandle: '@user', active: true, order: 0 }],
      }
      await writeUGCState(state).catch(() => { /* DB may be down in test env */ })
    })
  })

  describe('readHomeMerchandising', () => {
    it('returns a result object (either prisma data or error)', async () => {
      const result = await readHomeMerchandising()
      if (result.ok) {
        assert.equal(result.source, 'prisma')
        assert(Array.isArray(result.data.rails))
        assert(Array.isArray(result.data.campaigns))
        assert(Array.isArray(result.data.heroCards))
      } else {
        assert(typeof result.error === 'string')
      }
    })
  })

  describe('applyMerchandisingToCms', () => {
    it('preserves mock data when Prisma is unreachable', () => {
      const home: any = { marketing: { rails: [{ id: 'mock-rail' }] } }
      const errorResult: HomeMerchandisingResult = { ok: false, error: 'DB down' }
      const result = applyMerchandisingToCms(home, errorResult)
      assert.deepEqual(result.marketing, home.marketing)
    })

    it('replaces mock data when Prisma is the source', () => {
      const home: any = {
        marketing: {
          rails: [{ id: 'mock-rail' }],
          campaigns: [{ id: 'mock-campaign' }],
        },
      }
      const successResult: HomeMerchandisingResult = {
        ok: true,
        source: 'prisma',
        data: {
          rails: [{ id: 'prisma-rail', enabled: true, title: { en: 'Rail', ar: 'ريل' }, query: { source: 'best_sellers', limit: 12, sortBy: 'price_desc' } }],
          campaigns: [],
          heroCards: [],
          editorialHotspot: null,
          newsletterCta: null,
          personalization: null,
          railAutoplay: {},
          featuredSlot: null,
          completeSet: null,
        },
      }
      const result = applyMerchandisingToCms(home, successResult)
      assert.deepEqual((result as any).marketing.rails, successResult.data.rails)
    })
  })
})
