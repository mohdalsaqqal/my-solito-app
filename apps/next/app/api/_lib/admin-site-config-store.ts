import { prisma } from '../../../server/lib/prisma'
import path from 'node:path'

export type LogoSizeKey = 'sm' | 'md' | 'lg'

export type SiteLocaleBranding = {
  logoUrl: string
  logoAlt: string
  logoSize: LogoSizeKey
}

export interface SiteConfigState {
  branding: {
    en: SiteLocaleBranding
    ar: SiteLocaleBranding
  }
  topBar: {
    messageEn: string
    messageAr: string
    ctaLabelEn: string
    ctaLabelAr: string
    ctaHref: string
  }
  footer: {
    newsletterTitleEn: string
    newsletterTitleAr: string
    legalEn: string
    legalAr: string
  }
  search: {
    panelTitleEn: string
    panelTitleAr: string
  }
}

export const ADMIN_DATA_DIR = path.join(process.cwd(), '.data')

export async function ensureAdminDataDir() {
  // No-op: Prisma doesn't need directory creation
}

const DEFAULT_BRANDING: SiteConfigState['branding'] = {
  en: {
    logoUrl: '',
    logoAlt: 'Real Cosmetics',
    logoSize: 'md',
  },
  ar: {
    logoUrl: '',
    logoAlt: 'ريال كوزمتكس',
    logoSize: 'md',
  },
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeLogoSize(value: unknown): LogoSizeKey {
  return value === 'sm' || value === 'lg' ? value : 'md'
}

function normalizeBranding(input: unknown): SiteConfigState['branding'] {
  const source = input && typeof input === 'object' ? (input as Partial<SiteConfigState['branding']>) : {}

  return {
    en: {
      logoUrl: normalizeText(source.en?.logoUrl),
      logoAlt: normalizeText(source.en?.logoAlt) || DEFAULT_BRANDING.en.logoAlt,
      logoSize: normalizeLogoSize(source.en?.logoSize),
    },
    ar: {
      logoUrl: normalizeText(source.ar?.logoUrl),
      logoAlt: normalizeText(source.ar?.logoAlt) || DEFAULT_BRANDING.ar.logoAlt,
      logoSize: normalizeLogoSize(source.ar?.logoSize),
    },
  }
}

function normalizeSiteConfigState(input: unknown): SiteConfigState {
  const source = input && typeof input === 'object' ? (input as Partial<SiteConfigState>) : {}

  return {
    branding: normalizeBranding(source.branding),
    topBar: {
      messageEn: normalizeText(source.topBar?.messageEn),
      messageAr: normalizeText(source.topBar?.messageAr),
      ctaLabelEn: normalizeText(source.topBar?.ctaLabelEn),
      ctaLabelAr: normalizeText(source.topBar?.ctaLabelAr),
      ctaHref: normalizeText(source.topBar?.ctaHref),
    },
    footer: {
      newsletterTitleEn: normalizeText(source.footer?.newsletterTitleEn),
      newsletterTitleAr: normalizeText(source.footer?.newsletterTitleAr),
      legalEn: normalizeText(source.footer?.legalEn),
      legalAr: normalizeText(source.footer?.legalAr),
    },
    search: {
      panelTitleEn: normalizeText(source.search?.panelTitleEn),
      panelTitleAr: normalizeText(source.search?.panelTitleAr),
    },
  }
}

function initialState(): SiteConfigState {
  return {
    branding: DEFAULT_BRANDING,
    topBar: {
      messageEn: '',
      messageAr: '',
      ctaLabelEn: '',
      ctaLabelAr: '',
      ctaHref: '',
    },
    footer: {
      newsletterTitleEn: '',
      newsletterTitleAr: '',
      legalEn: '',
      legalAr: '',
    },
    search: {
      panelTitleEn: '',
      panelTitleAr: '',
    },
  }
}

export async function readSiteConfig(): Promise<SiteConfigState> {
  try {
    const config = await prisma.cmsSiteConfig.findUnique({ where: { id: 'default' } })
    if (!config) return initialState()

    return {
      branding: {
        en: {
          logoUrl: config.brandingEnLogoUrl,
          logoAlt: config.brandingEnLogoAlt,
          logoSize: normalizeLogoSize(config.brandingEnLogoSize),
        },
        ar: {
          logoUrl: config.brandingArLogoUrl,
          logoAlt: config.brandingArLogoAlt,
          logoSize: normalizeLogoSize(config.brandingArLogoSize),
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
  } catch {
    return initialState()
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
  patch: Partial<SiteConfigState>
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
