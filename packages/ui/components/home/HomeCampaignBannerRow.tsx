import { spacing } from '@real/tokens'
import { Box } from '../../primitives'
import { CampaignCard } from '../CampaignCard'
import { HomeCampaignItem } from './types'

type HomeCampaignBannerRowProps = {
  primary?: HomeCampaignItem
  secondary: HomeCampaignItem[]
  onPressItem?: (href?: string) => void
}

export function HomeCampaignBannerRow({
  primary,
  secondary,
  onPressItem,
}: HomeCampaignBannerRowProps) {
  if (!primary && secondary.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['16'] }}>
      {primary ? (
        <CampaignCard
          title={primary.title}
          subtitle={primary.subtitle}
          ctaLabel={primary.ctaLabel}
          href={primary.href}
          imageUrl={primary.imageUrl}
          onPress={onPressItem}
          aspectRatio={21 / 4}
          titleVariant='title'
        />
      ) : null}
      {secondary.length > 0 ? (
        <Box style={{ flexDirection: 'row', gap: spacing['16'] }}>
          {secondary.slice(0, 1).map((item) => (
            <CampaignCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              ctaLabel={item.ctaLabel}
              href={item.href}
              imageUrl={item.imageUrl}
              onPress={onPressItem}
              aspectRatio={32 / 9}
              titleVariant='subtitle'
              compact
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
