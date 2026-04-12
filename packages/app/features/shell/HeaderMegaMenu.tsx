import React from 'react'
import { Platform } from 'react-native'
import { borderWidth, radius, spacing, layout } from '@real/tokens'
import { Box, Icon, Text } from '@real/ui'
import { Button as ReusableButton } from '@real/ui/reusables/button'
import { useThemeColors } from '@real/ui/responsive'
import type { ShellFeaturedSlot, ShellMegaMenuSection } from './types'

type HeaderMegaMenuProps = {
  activeSectionId: string
  browseAllLabel: string
  featuredBrandsLabel: string
  panelRegionId: string
  sections: ShellMegaMenuSection[]
  onClose: () => void
  onSectionHover: (sectionId: string) => void
  onSectionPress: (section: ShellMegaMenuSection) => void
  onLinkPress: (link: {
    id: string
    href?: string
    analytics?: { clickKey?: string; impressionKey?: string }
  }) => void
  onBrandPress: (brand: {
    id: string
    href?: string
    analytics?: { clickKey?: string; impressionKey?: string }
  }) => void
  onFeaturedSlotPress: (slot: ShellFeaturedSlot) => void
}

export function HeaderMegaMenu({
  activeSectionId,
  browseAllLabel,
  featuredBrandsLabel,
  panelRegionId,
  sections,
  onClose,
  onSectionHover,
  onSectionPress,
  onLinkPress,
  onBrandPress,
  onFeaturedSlotPress,
}: HeaderMegaMenuProps) {
  const c = useThemeColors()
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0]
  const activeColumns = activeSection?.columns ?? []
  const activeBrands = activeSection?.brandRail?.items ?? []
  const activeFeaturedSlot = activeSection?.featuredSlot

  if (sections.length === 0) {
    return null
  }

  return (
    <Box
      nativeID={panelRegionId}
      style={{
        borderTopWidth: borderWidth.thin,
        borderColor: c.divider,
        backgroundColor: c.surfaceMuted,
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: layout.containerMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.pageX,
          paddingVertical: spacing['24'],
          flexDirection: 'row',
          gap: spacing['24'],
        }}
      >
        <Box
          style={{
            ...(Platform.OS === 'web' ? { width: 'clamp(180px, 20vw, 220px)' as any } : { width: 220 }),
            borderEndWidth: borderWidth.thin,
            borderColor: c.divider,
            paddingEnd: spacing['16'],
            gap: spacing['8'],
          }}
        >
          {sections.map((section) => {
            const interactive = section.id === activeSectionId
            return (
              <ReusableButton
                key={section.id}
                onHoverIn={() => onSectionHover(section.id)}
                onFocus={() => onSectionHover(section.id)}
                onPress={() => onSectionPress(section)}
                variant='ghost'
                size='default'
              >
                {({ hovered, focused }) => {
                  const active = interactive || hovered || focused
                  return (
                    <Box
                      style={{
                        minHeight: 64,
                        borderRadius: radius.lg,
                        paddingHorizontal: spacing['12'],
                        paddingVertical: spacing['12'],
                        gap: spacing['4'],
                        backgroundColor: active ? c.surfaceMuted : 'transparent',
                        borderWidth: borderWidth.thin,
                        borderColor: active ? c.textPrimary : 'transparent',
                      }}
                    >
                      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text variant='bodySm' weight='700' tone={active ? 'default' : 'muted'}>
                          {section.label}
                        </Text>
                        <Icon
                          name='caretRight'
                          size={14}
                          color={active ? c.textPrimary : c.textSecondary}
                        />
                      </Box>
                      <Text variant='meta' tone='muted'>
                        {section.description ?? browseAllLabel}
                      </Text>
                    </Box>
                  )
                }}
              </ReusableButton>
            )
          })}
        </Box>

        <Box style={{ flex: 1, flexDirection: 'row', gap: spacing['24'] }}>
          {activeColumns.map((group) => (
            <Box key={group.id} style={{ flex: 1, gap: spacing['8'] }}>
              <Text variant='meta' weight='700' style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
                {group.label}
              </Text>
              <Box style={{ gap: spacing['4'] }}>
                {group.children.map((link) => (
                  <ReusableButton
                    key={link.id}
                    href={link.href}
                    onPress={() => {
                      onLinkPress(link)
                      onClose()
                    }}
                    variant='ghost'
                    size='sm'
                  >
                    {({ hovered, focused }) => (
                      <Text tone={hovered || focused ? 'default' : 'muted'} variant='bodySm'>
                        {link.label}
                      </Text>
                    )}
                  </ReusableButton>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          style={{
            width: 220,
            borderStartWidth: borderWidth.thin,
            borderColor: c.divider,
            paddingStart: spacing['16'],
            gap: spacing['12'],
          }}
        >
          <Text variant='caption' weight='700' tone='muted' style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {activeSection?.brandRail?.title ?? featuredBrandsLabel}
          </Text>
          <Box style={{ gap: spacing['6'] }}>
            {activeBrands.map((brand) => (
              <ReusableButton
                key={brand.id}
                href={brand.href}
                onPress={() => onBrandPress(brand)}
                variant='ghost'
                size='sm'
              >
                {({ hovered, focused }) => (
                  <Text
                    variant='bodySm'
                    weight='700'
                    tone={hovered || focused ? 'primary' : 'muted'}
                  >
                    {brand.label}
                  </Text>
                )}
              </ReusableButton>
            ))}
          </Box>

          {activeFeaturedSlot ? (
            <Box
              style={{
                marginTop: spacing['8'],
                padding: spacing['12'],
                borderRadius: radius.lg,
                borderWidth: borderWidth.thin,
                borderColor: c.divider,
                backgroundColor: c.surface,
                gap: spacing['6'],
              }}
            >
              <Text variant='caption' weight='700' tone='muted' style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {activeFeaturedSlot.type}
              </Text>
              <Text variant='bodySm' weight='700'>
                {activeFeaturedSlot.title}
              </Text>
              {activeFeaturedSlot.subtitle ? (
                <Text variant='meta' tone='muted'>
                  {activeFeaturedSlot.subtitle}
                </Text>
              ) : null}
              {activeFeaturedSlot.href ? (
                <ReusableButton
                  href={activeFeaturedSlot.href}
                  onPress={() => onFeaturedSlotPress(activeFeaturedSlot)}
                  variant='ghost'
                  size='sm'
                >
                  <Text variant='meta' weight='700' tone='primary'>
                    {activeFeaturedSlot.ctaLabel ?? browseAllLabel}
                  </Text>
                </ReusableButton>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}
