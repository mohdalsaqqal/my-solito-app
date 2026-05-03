// @ts-nocheck
import React from 'react'
import { Platform, Pressable, ScrollView, View } from 'react-native'
import { borderWidth, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { SearchField } from '../SearchField'
import { Icon } from '../Icon'
import { useFocusTrap } from '../useFocusTrap'
import { useThemeColors } from '../../responsive'
import { Button as ReusableButton } from '../../reusables/button'

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

// Web overlay: CSS transition — no Reanimated/moti (worklets fail in Next.js web bundle)
function getWebOverlayStyle(open: boolean, motionDur: number, dir: 'ltr' | 'rtl') {
  return {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: zIndex.modal,
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(-24px)',
    pointerEvents: open ? 'auto' : 'none',
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: motionEasing.standard,
    transitionDuration: `${motionDur}ms`,
    display: 'flex',
    flexDirection: 'column' as const,
    direction: dir as 'ltr' | 'rtl',
  }
}

// Native overlay: absolute fill, no CSS transitions
function getNativeOverlayStyle(dir: string) {
  return {
    position: 'absolute' as const,
    top: 0,
    start: 0,
    end: 0,
    bottom: 0,
    zIndex: zIndex.modal,
    direction: dir as any,
  }
}

export const SearchOverlay = React.memo(function SearchOverlay({
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
}: SearchOverlayProps) {
  const c = useThemeColors()
  const isWeb = Platform.OS === 'web'
  const containerRef = React.useRef<HTMLDivElement | View | null>(null)
  useFocusTrap(containerRef as React.RefObject<HTMLElement | null>, open)

  if (isWeb) {
    // Web: always mounted, CSS opacity+transform transition (no worklets)
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        data-ect-node="SearchOverlay"
        style={{
          ...getWebOverlayStyle(open, motionDuration.medium, dir),
          backgroundColor: c.background,
        } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <OverlayContent
          query={query}
          placeholder={placeholder}
          onClose={onClose}
          onQueryChange={onQueryChange}
          onSubmit={onSubmit}
          onSelectSuggestion={onSelectSuggestion}
          suggestions={suggestions}
          loading={loading}
          error={error}
          dir={dir}
        />
      </div>
    )
  }

  // Native: conditionally mounted (no CSS, Reanimated worklets are fine on native)
  if (!open) return null

  return (
    <View
      ref={containerRef as any}
      data-ect-node="SearchOverlay"
      style={{ ...getNativeOverlayStyle(dir), backgroundColor: c.background }}
    >
      <OverlayContent
        query={query}
        placeholder={placeholder}
        onClose={onClose}
        onQueryChange={onQueryChange}
        onSubmit={onSubmit}
        onSelectSuggestion={onSelectSuggestion}
        suggestions={suggestions}
        loading={loading}
        error={error}
        dir={dir}
      />
    </View>
  )
})

// ── Shared content (web + native) ─────────────────────────────────────────────

type OverlayContentProps = Omit<SearchOverlayProps, 'open' | 'clearLabel'>

function OverlayContent({
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
}: OverlayContentProps) {
  const c = useThemeColors()
  return (
    <>
      {/* Header row: search input + close button */}
      <Box
        style={{
          flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: spacing.space3,
          paddingHorizontal: spacing.space4,
          paddingTop: spacing.space4,
          paddingBottom: spacing.space3,
          borderBottomWidth: borderWidth.thin,
          borderColor: c.border,
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

        <ReusableButton
          onPress={onClose}
          accessibilityRole='button'
          accessibilityLabel='Close search'
          variant='ghost'
          size='icon'
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: c.surfaceMuted,
            flexShrink: 0,
          }}
        >
          <Text
            variant='title'
            tone='muted'
            style={{ includeFontPadding: false }}
          >
            ×
          </Text>
        </ReusableButton>
      </Box>

      {/* Suggestions body */}
      <ScrollView
        keyboardShouldPersistTaps='handled'
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: spacing.space2 }}
      >
        {loading ? (
          <Box style={{ paddingHorizontal: spacing.space4, paddingVertical: spacing.space6 }}>
            <Text tone='muted' variant='bodySm'>
              Loading…
            </Text>
          </Box>
        ) : error ? (
          <Box style={{ paddingHorizontal: spacing.space4, paddingVertical: spacing.space6 }}>
            <Text tone='danger' variant='bodySm'>
              {error}
            </Text>
          </Box>
        ) : suggestions.length === 0 && query.trim().length > 0 ? (
          <Box style={{ paddingHorizontal: spacing.space4, paddingVertical: spacing.space6 }}>
            <Text tone='muted' variant='bodySm'>
              No results found.
            </Text>
          </Box>
        ) : (
          suggestions.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSelectSuggestion(item)}
              accessibilityRole='button'
              accessibilityLabel={item.label}
              style={({ hovered, focused }) => ({
                flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: spacing.space3,
                minHeight: spacing['48'],
                paddingVertical: spacing.space3,
                paddingHorizontal: spacing.space4,
                borderBottomWidth: borderWidth.thin,
                borderColor: c.border,
                ...(hovered || focused ? { backgroundColor: c.surfaceMuted } : {}),
                transitionProperty: 'background-color',
                transitionDuration: `${motionDuration.interactive}ms`,
                transitionTimingFunction: motionEasing.standard,
              })}
            >
              <Icon name='search' size={spacing.space4} color={c.textSecondary} />
              <Text variant='body' style={{ flex: 1 }} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </>
  )
}
