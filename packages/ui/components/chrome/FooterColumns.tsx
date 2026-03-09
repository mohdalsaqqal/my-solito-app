import { colors, letterSpacing, motionDuration, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'

type FooterLinkItem = {
  id: string
  label: string
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

export function FooterColumns({ columns, onPressLink, state = 'default' }: FooterColumnsProps) {
  if (state === 'loading') {
    return <Text tone='muted'>Loading footer links...</Text>
  }

  if (state === 'error') {
    return <Text tone='danger'>Unable to load footer links.</Text>
  }

  if (state === 'empty' || columns.length === 0) {
    return <Text tone='muted'>No footer links.</Text>
  }

  return (
    <Box style={{ flexDirection: 'row', gap: spacing.xl, flexWrap: 'wrap' }}>
      {columns.map((column) => (
        <Box key={column.id} style={{ gap: spacing.md, flex: 1, minWidth: spacing['96'] }}>
          <Text
            variant='label'
            weight='700'
            style={{ textTransform: 'uppercase', letterSpacing: letterSpacing.caps }}
          >
            {column.title}
          </Text>
          {column.links.map((link) => (
            <Touchable key={link.id} disabled={state === 'disabled'} onPress={() => onPressLink?.(link.id)}>
              {({ hovered, focused }) => (
                <Box style={{ alignItems: 'flex-start', gap: spacing.xs }}>
                  <Text tone={hovered || focused ? 'default' : 'muted'} variant='footer' weight={hovered || focused ? '600' : '400'}>
                    {link.label}
                  </Text>
                  <Box
                    style={{
                      height: 2,
                      width: hovered || focused ? spacing['24'] : 0,
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
      ))}
    </Box>
  )
}
