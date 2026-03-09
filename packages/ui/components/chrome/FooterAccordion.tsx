import { borderWidth, colors, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Divider, Text, Touchable } from '../../primitives'

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

export function FooterAccordion({
  sections,
  openSectionId,
  onToggleSection,
  onPressLink,
  state = 'default',
}: FooterAccordionProps) {
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
    <Box style={{ gap: spacing.xs }}>
      {sections.map((section) => {
        const open = section.id === openSectionId

        return (
          <Box
            key={section.id}
            style={{
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.sm,
              gap: spacing.xs,
            }}
          >
            <Touchable disabled={state === 'disabled'} onPress={() => onToggleSection(section.id)}>
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant='label'>{section.title}</Text>
                <Text variant='caption' tone='muted'>
                  {open ? '-' : '+'}
                </Text>
              </Box>
            </Touchable>
            {open ? (
              <>
                <Divider tone='muted' />
                <Box style={{ gap: spacing.xs }}>
                  {section.links.map((link) => (
                    <Touchable key={link.id} disabled={state === 'disabled'} onPress={() => onPressLink?.(link.id)}>
                      {({ hovered, focused }) => (
                        <Box style={{ alignItems: 'flex-start', gap: spacing.xxs }}>
                          <Text tone='muted' variant='footer'>
                            {link.label}
                          </Text>
                          <Box
                            style={{
                              height: 2,
                              width: hovered || focused ? '100%' : 0,
                              borderRadius: 2,
                              backgroundColor: colors.brandPrimary,
                              transitionProperty: 'width',
                              transitionDuration: `${motionDuration.normal}ms`,
                            }}
                          />
                        </Box>
                      )}
                    </Touchable>
                  ))}
                </Box>
              </>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}
