import { CampaignCard } from '../CampaignCard'

type BrandStoryBannerProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  onPress?: (href?: string) => void
}

export function BrandStoryBanner({
  title,
  subtitle,
  ctaLabel,
  href,
  imageUrl,
  onPress,
}: BrandStoryBannerProps) {
  return (
    <CampaignCard
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      href={href}
      imageUrl={imageUrl}
      onPress={onPress}
      aspectRatio={36 / 7}
      titleVariant='title'
    />
  )
}
