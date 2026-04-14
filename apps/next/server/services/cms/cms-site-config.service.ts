/**
 * CMS Site Config — canonical read/write service.
 *
 * Owns Prisma-backed site config persistence and normalization.
 */
import { prisma } from '../../lib/prisma'
import {
  normalizeSiteConfigState,
  initialSiteConfigState,
  type SiteConfigState,
} from './_lib/normalizers'

export type { SiteConfigState }
export type { SiteLocaleBranding, LogoSizeKey } from './_lib/normalizers'

export async function readSiteConfig(): Promise<SiteConfigState> {
  try {
    const config = await prisma.cmsSiteConfig.findUnique({ where: { id: 'default' } })
    if (!config) return initialSiteConfigState()

    return {
      branding: {
        en: {
          logoUrl: config.brandingEnLogoUrl,
          logoAlt: config.brandingEnLogoAlt,
          logoSize: config.brandingEnLogoSize as SiteConfigState['branding']['en']['logoSize'],
        },
        ar: {
          logoUrl: config.brandingArLogoUrl,
          logoAlt: config.brandingArLogoAlt,
          logoSize: config.brandingArLogoSize as SiteConfigState['branding']['ar']['logoSize'],
        },
      },
      topBar: {
        messageEn: config.topBarMessageEn,
        messageAr: config.topBarMessageAr,
        ctaLabelEn: config.topBarCtaLabelEn,
        ctaLabelAr: config.topBarCtaLabelAr,
        ctaHref: config.topBarCtaHref,
      },
      footer: {
        newsletterTitleEn: config.footerNewsletterTitleEn,
        newsletterTitleAr: config.footerNewsletterTitleAr,
        legalEn: config.footerLegalEn,
        legalAr: config.footerLegalAr,
      },
      search: {
        panelTitleEn: config.searchPanelTitleEn,
        panelTitleAr: config.searchPanelTitleAr,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'production') {
      console.error('[cms-site-config] Prisma read failed, returning initial state:', message)
    }
    return initialSiteConfigState()
  }
}

export async function writeSiteConfig(state: SiteConfigState): Promise<void> {
  const normalized = normalizeSiteConfigState(state)
  await prisma.cmsSiteConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      brandingEnLogoUrl: normalized.branding.en.logoUrl,
      brandingEnLogoAlt: normalized.branding.en.logoAlt,
      brandingEnLogoSize: normalized.branding.en.logoSize,
      brandingArLogoUrl: normalized.branding.ar.logoUrl,
      brandingArLogoAlt: normalized.branding.ar.logoAlt,
      brandingArLogoSize: normalized.branding.ar.logoSize,
      topBarMessageEn: normalized.topBar.messageEn,
      topBarMessageAr: normalized.topBar.messageAr,
      topBarCtaLabelEn: normalized.topBar.ctaLabelEn,
      topBarCtaLabelAr: normalized.topBar.ctaLabelAr,
      topBarCtaHref: normalized.topBar.ctaHref,
      footerNewsletterTitleEn: normalized.footer.newsletterTitleEn,
      footerNewsletterTitleAr: normalized.footer.newsletterTitleAr,
      footerLegalEn: normalized.footer.legalEn,
      footerLegalAr: normalized.footer.legalAr,
      searchPanelTitleEn: normalized.search.panelTitleEn,
      searchPanelTitleAr: normalized.search.panelTitleAr,
    },
    update: {
      brandingEnLogoUrl: normalized.branding.en.logoUrl,
      brandingEnLogoAlt: normalized.branding.en.logoAlt,
      brandingEnLogoSize: normalized.branding.en.logoSize,
      brandingArLogoUrl: normalized.branding.ar.logoUrl,
      brandingArLogoAlt: normalized.branding.ar.logoAlt,
      brandingArLogoSize: normalized.branding.ar.logoSize,
      topBarMessageEn: normalized.topBar.messageEn,
      topBarMessageAr: normalized.topBar.messageAr,
      topBarCtaLabelEn: normalized.topBar.ctaLabelEn,
      topBarCtaLabelAr: normalized.topBar.ctaLabelAr,
      topBarCtaHref: normalized.topBar.ctaHref,
      footerNewsletterTitleEn: normalized.footer.newsletterTitleEn,
      footerNewsletterTitleAr: normalized.footer.newsletterTitleAr,
      footerLegalEn: normalized.footer.legalEn,
      footerLegalAr: normalized.footer.legalAr,
      searchPanelTitleEn: normalized.search.panelTitleEn,
      searchPanelTitleAr: normalized.search.panelTitleAr,
    },
  })
}

export function mergeSiteConfigState(
  current: SiteConfigState,
  patch: Partial<SiteConfigState>,
): SiteConfigState {
  return normalizeSiteConfigState({
    branding: {
      en: {
        ...current.branding.en,
        ...(patch.branding?.en ?? {}),
      },
      ar: {
        ...current.branding.ar,
        ...(patch.branding?.ar ?? {}),
      },
    },
    topBar: {
      ...current.topBar,
      ...(patch.topBar ?? {}),
    },
    footer: {
      ...current.footer,
      ...(patch.footer ?? {}),
    },
    search: {
      ...current.search,
      ...(patch.search ?? {}),
    },
  })
}
