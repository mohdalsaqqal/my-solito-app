import React from 'react'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Divider, Text } from '../../primitives'
import { useThemeColors } from '../../responsive'
import { Button as ReusableButton } from '../../reusables/button'

type FooterLinkItem = {
  id: string
  label: string
}

type FooterAccordionSection = {
  id: string
  title: string
  links: FooterLinkItem[]
}

type FooterAccordionProps = {
  sections: FooterAccordionSection[]
  openSectionId?: string | null
  onToggleSection: (sectionId: string) => void
  onPressLink?: (linkId: string) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export const FooterAccordion = React.memo(function FooterAccordion({
  sections,
  openSectionId,
  onToggleSection,
  onPressLink,
  state = 'default',
}: FooterAccordionProps) {
  const c = useThemeColors()
  if (state === 'loading') {
    return <Text tone='muted'>Loading sections...</Text>
  }

  if (state === 'error') {
    return <Text tone='danger'>Unable to load footer sections.</Text>
  }

  if (state === 'empty' || sections.length === 0) {
    return <Text tone='muted'>No footer sections.</Text>
  }

  return (
    <Box style={{ gap: spacing.space2 }}>
      {sections.map((section) => {
        const open = section.id === openSectionId

        return (
          <Box
            key={section.id}
            style={{
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              borderRadius: radius.md,
              padding: spacing.space3,
              gap: spacing.space2,
            }}
          >
            <ReusableButton
              disabled={state === 'disabled'}
              onPress={() => onToggleSection(section.id)}
              variant='ghost'
              size='sm'
              style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}
            >
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant='label'>{section.title}</Text>
                <Text variant='caption' tone='muted'>
                  {open ? '-' : '+'}
                </Text>
              </Box>
            </ReusableButton>
            {open ? (
              <>
                <Divider tone='muted' />
                <Box style={{ gap: spacing.space2 }}>
                  {section.links.map((link) => (
                    <ReusableButton
                      key={link.id}
                      disabled={state === 'disabled'}
                      onPress={() => onPressLink?.(link.id)}
                      variant='link'
                      size='sm'
                      style={{ alignItems: 'flex-start', justifyContent: 'flex-start', paddingHorizontal: 0 }}
                    >
                      <Text tone='muted' variant='bodySm'>
                        {link.label}
                      </Text>
                    </ReusableButton>
                  ))}
                </Box>
              </>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
})
