import type { SiteConfigState, SiteLocaleBranding, LogoSizeKey } from './types'

export type { SiteConfigState, SiteLocaleBranding, LogoSizeKey }

export function normalizeLogoSize(value: unknown): LogoSizeKey {
  return value === 'sm' || value === 'lg' ? value : 'md'
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
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

export function normalizeBranding(input: unknown): SiteConfigState['branding'] {
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

export function normalizeSiteConfigState(input: unknown): SiteConfigState {
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

export function initialSiteConfigState(): SiteConfigState {
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
