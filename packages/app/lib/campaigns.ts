import { CMSHome, MarketingCampaign, MarketingCampaignZone } from './types'

export function localizeCopy(
  copy: { en: string; ar: string } | undefined,
  locale: 'en' | 'ar',
) {
  if (!copy) return undefined
  return locale === 'ar' ? copy.ar : copy.en
}

export function resolveMarketingCampaign(
  cmsHome: CMSHome | null | undefined,
  locale: 'en' | 'ar',
  zone: MarketingCampaignZone,
) {
  const campaigns = cmsHome?.marketing?.campaigns?.filter(
    (campaign) => campaign.enabled ?? true,
  )
  if (!campaigns || campaigns.length === 0) {
    return null
  }

  const overrideId =
    zone === 'home_hero_primary'
      ? cmsHome?.marketing?.campaignZoneOverrides?.home?.heroPrimaryCampaignId
      : zone === 'home_flash_sale'
        ? cmsHome?.marketing?.campaignZoneOverrides?.home?.flashSaleCampaignId
        : zone === 'home_inline_banner'
          ? cmsHome?.marketing?.campaignZoneOverrides?.home?.inlineBannerCampaignId
          : zone === 'shop_banner'
            ? cmsHome?.marketing?.campaignZoneOverrides?.shop?.bannerCampaignId
            : cmsHome?.marketing?.campaignZoneOverrides?.shop?.flashSaleCampaignId

  const selected = overrideId
    ? campaigns.find((campaign) => campaign.id === overrideId)
    : campaigns.find((campaign) => campaign.zone === zone)
  if (!selected) return null

  return mapCampaign(selected, locale)
}

function mapCampaign(campaign: MarketingCampaign, locale: 'en' | 'ar') {
  return {
    id: campaign.id,
    title: localizeCopy(campaign.title, locale) ?? '',
    subtitle: localizeCopy(campaign.subtitle, locale),
    ctaLabel: localizeCopy(campaign.ctaLabel, locale),
    href: campaign.href,
    imageUrl: campaign.imageUrl,
    timerEndsAt: campaign.timerEndsAt,
    urgencyBadge: localizeCopy(campaign.urgencyBadge, locale),
    showTimer: campaign.showTimer ?? false,
    showUrgency: campaign.showUrgency ?? false,
  }
}
