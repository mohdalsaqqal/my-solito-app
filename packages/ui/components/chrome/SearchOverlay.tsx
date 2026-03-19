import { Platform, ScrollView, View } from 'react-native'
import { AnimatePresence, MotiView } from 'moti'
import { borderWidth, colors, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { SearchField } from '../SearchField'
import { Icon } from '../Icon'

export type SearchSuggestionItem = {
  id: string
  label: string
  href?: string
  type?: string
}

export type SearchOverlayProps = {
  open: boolean
  query: string
  placeholder: string
  onClose: () => void
  onQueryChange: (value: string) => void
  onSubmit: () => void
  onSelectSuggestion: (item: SearchSuggestionItem) => void
  suggestions: SearchSuggestionItem[]
  loading: boolean
  error: string | null
  dir?: 'ltr' | 'rtl'
  clearLabel?: string
}

export function SearchOverlay({
  open,
  query,
  placeholder,
  onClose,
  onQueryChange,
  onSubmit,
  onSelectSuggestion,
  suggestions,
  loading,
  error,
  dir = 'ltr',
  clearLabel = 'Clear',
}: SearchOverlayProps) {
  const isWeb = Platform.OS === 'web'

  const overlayPositionStyle: any = {
    position: isWeb ? ('fixed' as any) : ('absolute' as const),
    top: 0,
    start: 0,
    end: 0,
    bottom: 0,
    zIndex: zIndex.modal,
    backgroundColor: colors.surface,
  }

  return (
    <AnimatePresence>
      {open ? (
        <MotiView
          from={{ opacity: 0, translateY: -24 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -24 }}
          transition={{ type: 'timing', duration: 300 }}
          style={overlayPositionStyle}
        >
          {/* Header row: search input + close button */}
          <Box
            style={{
              flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: spacing['12'],
              paddingHorizontal: spacing['16'],
              paddingTop: spacing['16'],
              paddingBottom: spacing['12'],
              borderBottomWidth: borderWidth.thin,
              borderColor: colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <SearchField
                value={query}
                onChange={onQueryChange}
                placeholder={placeholder}
                autoFocus
                onSubmitEditing={onSubmit}
                returnKeyType='search'
              />
            </View>

            <Touchable
              onPress={onClose}
              accessibilityRole='button'
              accessibilityLabel='Close search'
              style={{
                width: spacing['40'],
                height: spacing['40'],
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: colors.backgroundSecondary,
                flexShrink: 0,
              }}
            >
              {/* Unicode multiplication sign as close icon — no 'x' icon exists in design system */}
              <Text
                variant='title'
                tone='muted'
                style={{ lineHeight: spacing['24'], includeFontPadding: false }}
                accessibilityHidden
              >
                ×
              </Text>
            </Touchable>
          </Box>

          {/* Suggestions body */}
          <ScrollView
            keyboardShouldPersistTaps='handled'
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: spacing['8'] }}
          >
            {loading ? (
              <Box style={{ paddingHorizontal: spacing['16'], paddingVertical: spacing['24'] }}>
                <Text tone='muted' variant='bodySm'>
                  Loading…
                </Text>
              </Box>
            ) : error ? (
              <Box style={{ paddingHorizontal: spacing['16'], paddingVertical: spacing['24'] }}>
                <Text tone='danger' variant='bodySm'>
                  {error}
                </Text>
              </Box>
            ) : suggestions.length === 0 ? (
              <Box style={{ paddingHorizontal: spacing['16'], paddingVertical: spacing['24'] }}>
                <Text tone='muted' variant='bodySm'>
                  No results found.
                </Text>
              </Box>
            ) : (
              suggestions.map((item) => (
                <Touchable
                  key={item.id}
                  onPress={() => onSelectSuggestion(item)}
                  accessibilityRole='button'
                  accessibilityLabel={item.label}
                  style={({ hovered, focused }) => ({
                    flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: spacing['12'],
                    minHeight: spacing['48'],
                    paddingVertical: spacing['12'],
                    paddingHorizontal: spacing['16'],
                    borderBottomWidth: borderWidth.thin,
                    borderColor: colors.border,
                    backgroundColor:
                      hovered || focused ? colors.backgroundSecondary : 'transparent',
                    transitionProperty: 'background-color',
                    transitionDuration: `${motionDuration.microInteraction}ms`,
                    transitionTimingFunction: motionEasing.standard,
                  })}
                >
                  <Icon name='search' size={spacing['16']} color={colors.textSecondary} />
                  <Text variant='body' style={{ flex: 1 }} numberOfLines={1}>
                    {item.label}
                  </Text>
                </Touchable>
              ))
            )}
          </ScrollView>
        </MotiView>
      ) : null}
    </AnimatePresence>
  )
}
