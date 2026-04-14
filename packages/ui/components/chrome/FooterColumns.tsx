import React from 'react'
import { Platform } from 'react-native'
import { letterSpacing, motionDuration, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

type FooterLinkItem = {
  id: string
  label: string
  href?: string
}

type FooterColumnItem = {
  id: string
  title: string
  links: FooterLinkItem[]
}

type FooterColumnsProps = {
  columns: FooterColumnItem[]
  onPressLink?: (linkId: string) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export const FooterColumns = React.memo(function FooterColumns({ columns, onPressLink, state = 'default' }: FooterColumnsProps) {
  const c = useThemeColors()
  if (state === 'loading') {
    return <Text tone='muted'>Loading footer links…</Text>
  }

  if (state === 'error') {
    return <Text tone='danger'>Unable to load footer links.</Text>
  }

  if (state === 'empty' || columns.length === 0) {
    return <Text tone='muted'>No footer links.</Text>
  }

  return (
    <Box style={{ flexDirection: 'row', gap: spacing.space8, flexWrap: 'wrap' }}>
      {columns.map((column) => (
        <Box key={column.id} style={{ gap: spacing.space4, flex: 1, minWidth: spacing['96'] }}>
          <Text
            variant='overline'
            weight='700'
            tone='inverse'
            style={{ textTransform: 'uppercase', letterSpacing: letterSpacing.caps }}
          >
            {column.title}
          </Text>
          {column.links.map((link) => (
            <ReusableButton
              key={link.id}
              disabled={state === 'disabled'}
              href={link.href}
              target={link.href?.startsWith('http') ? '_blank' : undefined}
              rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              variant='ghost'
              onPress={() => {
                if (Platform.OS !== 'web' || !link.href) {
                  onPressLink?.(link.id)
                }
              }}
              style={{ paddingHorizontal: 0, paddingVertical: 0, alignItems: 'flex-start' }}
            >
              {({ hovered, focused }) => (
                <Box style={{ alignItems: 'flex-start', gap: spacing.space2 }}>
                  <Text
                    tone='inverse'
                    variant='bodySm'
                    weight={hovered || focused ? '600' : '400'}
                    style={{ opacity: hovered || focused ? 1 : 0.78 }}
                  >
                    {link.label}
                  </Text>
                  <Box
                    style={{
                      height: 2,
                      width: hovered || focused ? spacing['24'] : 0,
                      borderRadius: 2,
                      backgroundColor: c.white,
                      transitionProperty: 'width',
                      transitionDuration: `${motionDuration.medium}ms`,
                    }}
                  />
                </Box>
              )}
            </ReusableButton>
          ))}
        </Box>
      ))}
    </Box>
  )
})
