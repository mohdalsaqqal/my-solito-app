import React from 'react'
import { Platform } from 'react-native'
import { spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Icon } from '../Icon'
import { useThemeColors } from '../../responsive'

type SocialItem = {
  id: string
  label: string
  href?: string
}

type FooterSocialLinksProps = {
  items: SocialItem[]
  onPress: (id: string) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export const FooterSocialLinks = React.memo(function FooterSocialLinks({ items, onPress, state = 'default' }: FooterSocialLinksProps) {
  const c = useThemeColors()
  if (state === 'loading') {
    return (
      <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center' }}>
        <Text tone='muted' variant='caption'>Loading social links...</Text>
      </Box>
    )
  }

  if (state === 'error') {
    return (
      <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center' }}>
        <Text tone='danger' variant='caption'>Social links unavailable.</Text>
      </Box>
    )
  }

  if (state === 'empty' || items.length === 0) {
    return null
  }

  return (
    <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
      {items.map((social) => (
        <ReusableButton
          key={social.id}
          disabled={state === 'disabled'}
          href={social.href}
          target={social.href?.startsWith('http') ? '_blank' : undefined}
          rel={social.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          variant='ghost'
          accessibilityLabel={social.label}
          onPress={() => {
            if (Platform.OS !== 'web' || !social.href) {
              onPress(social.id)
            }
          }}
          style={{ paddingHorizontal: 0, paddingVertical: 0 }}
        >
          {({ hovered, focused }) => {
            const active = hovered || focused
            return (
              <Box style={{ opacity: active ? 1 : 0.8 }}>
                <Icon
                  name={toSocialIconName(social.id)}
                  size={18}
                  color={c.inkFrost}
                  weight='fill'
                />
              </Box>
            )
          }}
        </ReusableButton>
      ))}
    </Box>
  )
})

function toSocialIconName(id: string): 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'unknown' {
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
  if (normalized.includes('tiktok') || normalized === 'tt') {
    return 'tiktok'
  }
  return 'unknown'
}
