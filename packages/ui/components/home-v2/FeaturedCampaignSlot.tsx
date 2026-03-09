import { CampaignCard } from '../CampaignCard'

type FeaturedCampaignSlotProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  onPress?: (href?: string) => void
}

export function FeaturedCampaignSlot({
  title,
  subtitle,
  ctaLabel,
  href,
  imageUrl,
  onPress,
}: FeaturedCampaignSlotProps) {
  return (
    <CampaignCard
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      href={href}
      imageUrl={imageUrl}
      onPress={onPress}
      aspectRatio={21 / 4}
      titleVariant='h2'
    />
  )
}
