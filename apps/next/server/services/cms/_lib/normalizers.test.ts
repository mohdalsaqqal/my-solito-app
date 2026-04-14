import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeLogoSize,
  normalizeText,
  normalizeBranding,
  normalizeSiteConfigState,
  initialSiteConfigState,
  mergeSiteConfigState,
  type SiteConfigState,
} from './normalizers'

describe('CMS normalizers', () => {
  describe('normalizeLogoSize', () => {
    it('returns sm when input is sm', () => {
      assert.equal(normalizeLogoSize('sm'), 'sm')
    })
    it('returns lg when input is lg', () => {
      assert.equal(normalizeLogoSize('lg'), 'lg')
    })
    it('returns md for unknown or invalid input', () => {
      assert.equal(normalizeLogoSize('xl'), 'md')
      assert.equal(normalizeLogoSize(undefined), 'md')
      assert.equal(normalizeLogoSize(null), 'md')
    })
  })

  describe('normalizeText', () => {
    it('trims whitespace', () => {
      assert.equal(normalizeText('  hello  '), 'hello')
    })
    it('returns empty string for non-string', () => {
      assert.equal(normalizeText(null), '')
      assert.equal(normalizeText(undefined), '')
      assert.equal(normalizeText(123), '')
    })
  })

  describe('normalizeBranding', () => {
    it('returns defaults for empty input', () => {
      const result = normalizeBranding({})
      assert.equal(result.en.logoAlt, 'Real Cosmetics')
      assert.equal(result.ar.logoAlt, 'ريال كوزمتكس')
      assert.equal(result.en.logoSize, 'md')
    })
    it('passes through valid values', () => {
      const result = normalizeBranding({
        en: { logoUrl: '/logo.png', logoAlt: 'My Logo', logoSize: 'lg' },
        ar: { logoUrl: '/logo-ar.png', logoAlt: 'شعار', logoSize: 'sm' },
      })
      assert.equal(result.en.logoUrl, '/logo.png')
      assert.equal(result.en.logoSize, 'lg')
      assert.equal(result.ar.logoUrl, '/logo-ar.png')
      assert.equal(result.ar.logoSize, 'sm')
    })
  })

  describe('normalizeSiteConfigState', () => {
    it('returns defaults for empty input', () => {
      const result = normalizeSiteConfigState({})
      assert.equal(result.topBar.messageEn, '')
      assert.equal(result.footer.legalEn, '')
      assert.equal(result.search.panelTitleEn, '')
    })
  })

  describe('initialSiteConfigState', () => {
    it('returns a complete default state', () => {
      const state = initialSiteConfigState()
      assert(state.branding.en.logoAlt)
      assert(state.branding.ar.logoAlt)
      assert.equal(state.topBar.messageEn, '')
    })
  })

  describe('mergeSiteConfigState', () => {
    it('applies a patch over current state', () => {
      const current = initialSiteConfigState()
      const patch: Partial<SiteConfigState> = { topBar: { ...current.topBar, messageEn: 'Hello' } }
      const merged = mergeSiteConfigState(current, patch)
      assert.equal(merged.topBar.messageEn, 'Hello')
      assert.equal(merged.topBar.messageAr, '')
    })
  })
})
