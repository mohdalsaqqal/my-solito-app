import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { borderWidth, layout, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Container, Text } from '../../primitives'
import { Badge } from '../Badge'
import { useThemeColors } from '../../responsive'

type CategoryItem = {
  id: string
  label: string
}

type CategoryRowProps = {
  items: CategoryItem[]
  activeId?: string
  scopeLabel?: string
  onSelect?: (id: string) => void
  mobile?: boolean
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export const CategoryRow = React.memo(function CategoryRow({
  items,
  activeId,
  scopeLabel,
  onSelect,
  mobile = false,
  state = 'default',
}: CategoryRowProps) {
  const c = useThemeColors()
  if (state === 'loading') {
    return (
      <Container>
        <Box style={{ minHeight: layout.header.navRowHeight, justifyContent: 'center' }}>
          <Text tone='muted' variant='caption'>
            Loading categories...
          </Text>
        </Box>
      </Container>
    )
  }

  if (state === 'error') {
    return (
      <Container>
        <Box style={{ minHeight: layout.header.navRowHeight, justifyContent: 'center' }}>
          <Text tone='danger' variant='caption'>
            Categories unavailable.
          </Text>
        </Box>
      </Container>
    )
  }

  if (state === 'empty' || items.length === 0) {
    return (
      <Container>
        <Box style={{ minHeight: layout.header.navRowHeight, justifyContent: 'center' }}>
          <Text tone='muted' variant='caption'>
            No categories.
          </Text>
        </Box>
      </Container>
    )
  }

  return (
    <Box>
      <Container>
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: '100%' }}
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'nowrap',
            minHeight: layout.header.navRowHeight,
            alignItems: 'center',
            gap: spacing['16'],
            paddingVertical: spacing['8'],
            justifyContent: mobile ? undefined : 'center',
            flexGrow: mobile ? undefined : 1,
          }}
        >
          {scopeLabel ? (
            <Box
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.md,
                borderWidth: borderWidth.thin,
                borderColor: c.border,
                backgroundColor: c.backgroundSecondary,
              }}
            >
              <Text variant='caption' tone='muted'>
                {scopeLabel}
              </Text>
            </Box>
          ) : null}
          {items.map((item) => {
            const active = item.id === activeId
            if (mobile) {
              return (
                <Pressable key={item.id} disabled={state === 'disabled'} onPress={() => onSelect?.(item.id)} accessibilityLabel={item.label}>
                  <Badge tone={active ? 'accent' : 'outline'}>{item.label}</Badge>
                </Pressable>
              )
            }

            return (
              <Pressable key={item.id} disabled={state === 'disabled'} onPress={() => onSelect?.(item.id)} accessibilityLabel={item.label}>
                {({ hovered, focused }) => {
                  const flashSale = item.id.includes('flash-sale') || item.label.includes('%')
                  const luxury = item.id.includes('luxury')
                  const emphasize = flashSale || luxury
                  const tone = flashSale ? 'danger' : active ? 'primary' : 'default'
                  const underlineVisible = active || hovered || focused

                  return (
                    <Box
                      style={{
                        paddingHorizontal: emphasize ? spacing.sm : spacing['8'],
                        paddingVertical: spacing.xs,
                        alignItems: 'center',
                        gap: spacing.xxs,
                      }}
                    >
                      <Text
                        variant='nav'
                        tone={tone}
                        weight={luxury || active ? '700' : '500'}
                      >
                        {item.label}
                      </Text>
                      <Box
                        style={{
                          height: 2,
                          width: underlineVisible ? spacing['24'] : 0,
                          borderRadius: 2,
                          backgroundColor: c.brandPrimary,
                          transitionProperty: 'width',
                          transitionDuration: `${motionDuration.normal}ms`,
                        }}
                      />
                    </Box>
                  )
                }}
              </Pressable>
            )
          })}
        </ScrollView>
      </Container>
    </Box>
  )
})
