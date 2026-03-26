import fs from 'node:fs/promises'
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
const STORAGE_FILE = path.join(ADMIN_DATA_DIR, 'admin-site-config.json')

export async function ensureAdminDataDir() {
  await fs.mkdir(ADMIN_DATA_DIR, { recursive: true })
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
    const raw = await fs.readFile(STORAGE_FILE, 'utf-8')
    return normalizeSiteConfigState(JSON.parse(raw))
  } catch {
    return initialState()
  }
}

export async function writeSiteConfig(state: SiteConfigState): Promise<void> {
  await ensureAdminDataDir()
  await fs.writeFile(STORAGE_FILE, JSON.stringify(normalizeSiteConfigState(state), null, 2), 'utf-8')
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
