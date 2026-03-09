import { Image, Modal, Platform, Pressable } from 'react-native'
import { borderWidth, colors, motionDuration, motionEasing, radius, shadows, spacing, zIndex } from '@real/tokens'
import { Box, Divider, Text, Touchable } from '../../primitives'
import { Card } from '../Card'
import { Icon } from '../Icon'

type SearchItem = {
  id: string
  label: string
  type: 'product' | 'category' | 'brand'
  href: string
  imageUrl?: string
  brandName?: string
  productName?: string
  price?: number
  compareAtPrice?: number
  discountLabel?: string
}

type SearchPanelProps = {
  open: boolean
  query: string
  panelRegionId?: string
  compact?: boolean
  maxWidth?: number
  centered?: boolean
  panelWidth?: number
  fixed?: boolean
  topOffset?: number
  onRequestClose?: () => void
  loading?: boolean
  error?: string | null
  disabled?: boolean
  suggestions: SearchItem[]
  trendingSearches: string[]
  popularBrands: string[]
  recents: string[]
  onSelectSuggestion: (item: SearchItem) => void
  onSelectRecent: (query: string) => void
  onClearRecents: () => void
  copy?: {
    titles?: {
      trendingSearches?: string
      popularBrands?: string
      recentSearches?: string
      suggestions?: string
      products?: string
    }
    messages?: {
      loadingSuggestions?: string
      unavailableSuggestions?: string
      noMatchingSuggestions?: string
      noProductSuggestions?: string
      noPopularBrands?: string
      noRecentSearches?: string
    }
    clearRecentLabel?: string
  }
}

export function SearchPanel({
  open,
  query,
  panelRegionId,
  compact = false,
  maxWidth,
  centered = false,
  panelWidth,
  fixed = false,
  topOffset,
  onRequestClose,
  loading = false,
  error,
  disabled = false,
  suggestions,
  trendingSearches,
  popularBrands,
  recents,
  onSelectSuggestion,
  onSelectRecent,
  onClearRecents,
  copy,
}: SearchPanelProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  if (!open) {
    return null
  }

  const panelContainerStyle: any = {
    position: fixed && Platform.OS === 'web' ? ('fixed' as any) : ('absolute' as const),
    top: fixed ? (topOffset ?? spacing['8']) : '100%',
    start: centered ? undefined : 0,
    end: centered ? undefined : 0,
    width: centered ? panelWidth : '100%',
    maxWidth,
    alignSelf: 'center' as const,
    left: centered ? '50%' : undefined,
    transform: centered && panelWidth ? [{ translateX: -(panelWidth / 2) }] : undefined,
    zIndex: zIndex.searchTop + 3,
    marginTop: spacing['8'],
  }

  const normalizedQuery = query.trim()
  const hasQuery = normalizedQuery.length > 0
  const termSuggestions = suggestions.filter((item) => item.type !== 'product')
  const popularBrandsDisplay = popularBrands.slice(0, compact ? 4 : 6)
  const productSuggestions = suggestions.filter((item) => item.type === 'product')
  const panelBodyStyle = {
    gap: compact ? spacing['8'] : spacing['16'],
    overflow: 'auto' as any,
    overflowY: Platform.OS === 'web' ? ('scroll' as any) : undefined,
    scrollbarGutter: Platform.OS === 'web' ? ('stable' as any) : undefined,
    scrollbarWidth: Platform.OS === 'web' ? ('thin' as any) : undefined,
    overscrollBehavior: Platform.OS === 'web' ? ('contain' as any) : undefined,
    padding: spacing['16'],
    maxHeight: spacing.xxl * 9,
  }
  const titleTrending = copy?.titles?.trendingSearches ?? 'Trending Searches'
  const titlePopularBrands = copy?.titles?.popularBrands ?? 'Popular Brands'
  const titleRecent = copy?.titles?.recentSearches ?? 'Recent Searches'
  const titleSuggestions = copy?.titles?.suggestions ?? 'Search Suggestions'
  const titleProducts = copy?.titles?.products ?? 'Products'
  const msgLoading = copy?.messages?.loadingSuggestions ?? 'Loading suggestions...'
  const msgUnavailable = copy?.messages?.unavailableSuggestions ?? 'No suggestions right now.'
  const msgNoMatch = copy?.messages?.noMatchingSuggestions ?? 'No matching suggestions.'
  const msgNoProduct = copy?.messages?.noProductSuggestions ?? 'No product suggestions.'
  const msgNoBrands = copy?.messages?.noPopularBrands ?? 'No popular brands.'
  const msgNoRecents = copy?.messages?.noRecentSearches ?? 'No recent searches.'
  const clearLabel = copy?.clearRecentLabel ?? 'Clear'

  const panelContent = (
    <>
      {Platform.OS === 'web' ? (
        <Pressable
          onPress={onRequestClose}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: zIndex.searchTop + 2,
            backgroundColor: 'transparent',
          } as any}
        />
      ) : null}
      <Box nativeID={panelRegionId} style={panelContainerStyle}>
      <Card
        variant='raised'
        style={{
          borderRadius: radius.xs,
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          overflow: 'hidden',
          ...(shadows.md as object),
          maxHeight: spacing.xxl * 11,
        }}
      >
        {disabled ? (
          <Text tone='muted'>Search is disabled.</Text>
        ) : loading ? (
          <Text tone='muted'>{msgLoading}</Text>
        ) : error ? (
          <Text tone='danger'>{msgUnavailable}</Text>
        ) : !hasQuery ? (
          <Box style={panelBodyStyle}>
            <Box style={{ gap: spacing['8'] }}>
              <Text variant='overline' tone='muted' style={{ textTransform: 'uppercase' }}>
                {titleTrending}
              </Text>
              {trendingSearches.map((item) => (
                <Touchable
                  key={item}
                  onPress={() => onSelectRecent(item)}
                  accessibilityRole='button'
                  accessibilityLabel={`Search ${item}`}
                  style={({ hovered, focused }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing['8'],
                    minHeight: spacing['48'],
                    paddingHorizontal: spacing['16'],
                    borderRadius: radius.xs,
                    backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                    transitionProperty: 'background-color',
                    transitionDuration: `${motionDuration.microInteraction}ms`,
                    transitionTimingFunction: motionEasing.standard,
                  })}
                >
                  <Icon name='trending' size={spacing['16']} color={colors.textSecondary} />
                  <Text variant='bodySm' style={{ flex: 1 }}>
                    {item}
                  </Text>
                  <Icon name='trendArrow' size={spacing['16']} color={colors.textSecondary} />
                </Touchable>
              ))}
            </Box>

            <Divider tone='muted' />

            <Box style={{ gap: spacing['8'] }}>
              <Text variant='overline' tone='muted' style={{ textTransform: 'uppercase' }}>
                {titlePopularBrands}
              </Text>
              {popularBrandsDisplay.length === 0 ? (
                <Text tone='muted' variant='bodySm'>
                  {msgNoBrands}
                </Text>
              ) : (
                popularBrandsDisplay.map((brand) => (
                  <Touchable
                    key={brand}
                    onPress={() => onSelectRecent(brand)}
                    accessibilityRole='button'
                    accessibilityLabel={`Search brand ${brand}`}
                    style={({ hovered, focused }) => ({
                      minHeight: spacing['48'],
                      justifyContent: 'center',
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.xs,
                      backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                      transitionProperty: 'background-color',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transitionTimingFunction: motionEasing.standard,
                    })}
                  >
                    <Text variant='bodySm'>{brand}</Text>
                  </Touchable>
                ))
              )}
            </Box>

            <Divider tone='muted' />

            <Box style={{ gap: spacing['8'] }}>
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant='overline' tone='muted' style={{ textTransform: 'uppercase' }}>
                  {titleRecent}
                </Text>
                {recents.length > 0 ? (
                  <Touchable onPress={onClearRecents}>
                    <Text variant='caption' tone='primary'>
                      {clearLabel}
                    </Text>
                  </Touchable>
                ) : null}
              </Box>
              {recents.length === 0 ? (
                <Text tone='muted' variant='bodySm'>
                  {msgNoRecents}
                </Text>
              ) : (
                recents.slice(0, compact ? 3 : recents.length).map((recentQuery) => (
                  <Touchable
                    key={recentQuery}
                    onPress={() => onSelectRecent(recentQuery)}
                    accessibilityRole='button'
                    accessibilityLabel={`Search recent ${recentQuery}`}
                    style={({ hovered, focused }) => ({
                      minHeight: spacing['48'],
                      justifyContent: 'center',
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.xs,
                      backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                      transitionProperty: 'background-color',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transitionTimingFunction: motionEasing.standard,
                    })}
                  >
                    <Text variant='bodySm'>{recentQuery}</Text>
                  </Touchable>
                ))
              )}
            </Box>
          </Box>
        ) : (
          <Box style={panelBodyStyle}>
            <Box style={{ gap: spacing['8'] }}>
              <Text variant='overline' style={{ textTransform: 'uppercase' }}>
                {titleSuggestions}
              </Text>
              {termSuggestions.length === 0 ? (
                <Text tone='muted' variant='bodySm'>
                  {msgNoMatch}
                </Text>
              ) : (
                termSuggestions.slice(0, compact ? 5 : 7).map((item) => (
                  <Touchable
                    key={item.id}
                    onPress={() => onSelectSuggestion(item)}
                    accessibilityRole='button'
                    accessibilityLabel={`Suggestion ${item.label}`}
                    style={({ hovered, focused }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing['8'],
                      minHeight: spacing['48'],
                      paddingVertical: spacing['8'],
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.xs,
                      borderBottomWidth: borderWidth.thin,
                      borderColor: colors.border,
                      backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                      transitionProperty: 'background-color',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transitionTimingFunction: motionEasing.standard,
                    })}
                  >
                    <Icon name='search' size={spacing.md} color={colors.textSecondary} />
                    <Text variant='body'>{item.label}</Text>
                  </Touchable>
                ))
              )}
            </Box>

            {productSuggestions.length > 0 ? <Divider tone='muted' /> : null}

            <Box style={{ gap: spacing['8'] }}>
              <Text variant='overline' style={{ textTransform: 'uppercase' }}>
                {titleProducts}
              </Text>
              {productSuggestions.length === 0 ? (
                <Text tone='muted' variant='bodySm'>
                  {msgNoProduct}
                </Text>
              ) : (
                productSuggestions.slice(0, compact ? 5 : 7).map((item) => (
                  <Touchable
                    key={item.id}
                    onPress={() => onSelectSuggestion(item)}
                    accessibilityRole='button'
                    accessibilityLabel={`Product ${item.productName ?? item.label}`}
                    style={({ hovered, focused }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing['16'],
                      minHeight: spacing['64'],
                      paddingVertical: spacing['8'],
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.xs,
                      borderBottomWidth: borderWidth.thin,
                      borderColor: colors.border,
                      backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                      transitionProperty: 'background-color',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transitionTimingFunction: motionEasing.standard,
                    })}
                  >
                    <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['16'], flex: 1 }}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{
                            width: spacing.xxl + spacing['16'],
                            height: spacing.xxl + spacing['16'],
                            borderRadius: radius.xs,
                            borderWidth: borderWidth.thin,
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundSecondary,
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            width: spacing.xxl + spacing['16'],
                            height: spacing.xxl + spacing['16'],
                            borderRadius: radius.xs,
                            borderWidth: borderWidth.thin,
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundSecondary,
                          }}
                        />
                      )}
                      <Box style={{ flex: 1, gap: spacing['8'] }}>
                        <Text variant='caption' tone='muted' numberOfLines={1}>
                          {item.brandName ?? 'Brand'}
                        </Text>
                        <Text variant='body' numberOfLines={1}>
                          {item.productName ?? item.label}
                        </Text>
                      </Box>
                    </Box>
                    <Box style={{ alignItems: 'flex-end', minWidth: spacing.xxl + spacing['16'] }}>
                      {typeof item.compareAtPrice === 'number' ? (
                        <Text variant='caption' tone='muted' style={{ textDecorationLine: 'line-through' }}>
                          {formatCurrency(item.compareAtPrice)}
                        </Text>
                      ) : null}
                      {typeof item.price === 'number' ? (
                        <Text variant='label' tone='primary'>
                          {formatCurrency(item.price)}
                        </Text>
                      ) : null}
                      {item.discountLabel ? (
                        <Text variant='caption' tone='danger'>
                          {item.discountLabel}
                        </Text>
                      ) : null}
                    </Box>
                  </Touchable>
                ))
              )}
            </Box>
          </Box>
        )}
      </Card>
      </Box>
    </>
  )

  if (fixed) {
    if (Platform.OS === 'web') {
      return panelContent
    }

    return (
      <Modal transparent visible animationType='none' onRequestClose={onRequestClose}>
        <Box style={{ flex: 1 }}>
          <Pressable style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onPress={onRequestClose} />
          {panelContent}
        </Box>
      </Modal>
    )
  }

  return panelContent
}
