import { colors, motionDuration, radius, shadows, spacing } from '@real/tokens'
import { Box, Touchable } from '../../primitives'
import { Icon, IconName } from '../Icon'

type SocialItem = {
  id: string
  label: string
}

type FooterSocialLinksProps = {
  items: SocialItem[]
  onPress: (id: string) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export function FooterSocialLinks({ items, onPress, state = 'default' }: FooterSocialLinksProps) {
  if (state === 'loading') {
    return null
  }

  if (state === 'error') {
    return null
  }

  if (state === 'empty' || items.length === 0) {
    return null
  }

  return (
    <Box style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
      {items.map((social) => (
        <Touchable key={social.id} disabled={state === 'disabled'} onPress={() => onPress(social.id)}>
          {({ hovered, focused }) => (
            <Box
              p='xs'
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: spacing['32'],
                minHeight: spacing['32'],
                borderRadius: radius.md,
                backgroundColor: hovered || focused ? colors.brandPrimarySubtle : colors.surface,
                transitionProperty: 'background-color',
                transitionDuration: `${motionDuration.microInteraction}ms`,
                ...shadows.xs,
              }}
            >
              <Icon
                name={toSocialIconName(social.id)}
                color={hovered || focused ? colors.brandPrimary : colors.textPrimary}
              />
            </Box>
          )}
        </Touchable>
      ))}
    </Box>
  )
}

function toSocialIconName(id: string): IconName {
  const normalized = id.toLowerCase()
  if (normalized.includes('insta') || normalized === 'ig') {
    return 'instagram'
  }
  if (normalized.includes('face') || normalized === 'fb') {
    return 'facebook'
  }
  if (normalized.includes('you') || normalized === 'yt') {
    return 'youtube'
  }
  return 'unknown'
}
