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
