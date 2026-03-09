import { useMemo } from 'react'
import { Image, useWindowDimensions } from 'react-native'
import { borderWidth, breakpoints, colors, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text, Touchable } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'
import { AccountTestDetail } from '@real/app/lib/types'

type AccountTestDetailScreenProps = {
  test?: AccountTestDetail | null
  loading?: boolean
  error?: string | null
  addingProductId?: string | null
  addingAll?: boolean
  cartProductIds?: Set<string>
  onBack?: () => void
  onReload?: () => void
  onAddProduct?: (productId: string) => void
  onAddAll?: () => void
  onViewProduct?: (productId: string) => void
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`
}

function splitProductName(rawName: string) {
  const parts = rawName.split('-')
  if (parts.length < 2) {
    return {
      brand: rawName.trim(),
      name: rawName.trim(),
    }
  }
  return {
    brand: parts[0]?.trim() || rawName.trim(),
    name: parts.slice(1).join('-').trim() || rawName.trim(),
  }
}

export function AccountTestDetailScreen({
  test = null,
  loading = false,
  error = null,
  addingProductId = null,
  addingAll = false,
  cartProductIds = new Set<string>(),
  onBack,
  onReload,
  onAddProduct,
  onAddAll,
  onViewProduct,
}: AccountTestDetailScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin

  const inStockProducts = useMemo(
    () => (test?.recommendedProducts ?? []).filter((item) => item.inStock !== false),
    [test?.recommendedProducts]
  )

  if (loading) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text tone='danger'>Unable to load test details.</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                <Button variant='outline' onPress={onReload}>Retry</Button>
              </Box>
            </Card>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (!test) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Card tone='subtle'>
              <Text tone='muted'>Test not found.</Text>
            </Card>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='16'>
      <Box
        style={{
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: isCompact ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: spacing['8'],
        }}
      >
        <Text variant='h2'>Test details</Text>
        <Touchable onPress={onBack}>
          <Text variant='label' tone='primary'>Back to tests</Text>
        </Touchable>
      </Box>

      <Card variant='raised' style={{ gap: spacing['8'] }}>
        <Text variant='title'>{test.title}</Text>
        <Text tone='muted' variant='caption'>Test ID: {test.id}</Text>
        <Text tone='muted' variant='caption'>Date: {new Date(test.createdAt).toLocaleDateString()}</Text>
        <Text tone='muted' variant='caption'>Pharmacist: {test.pharmacistName}</Text>
        <Text tone='muted' variant='caption'>Branch: {test.branchName}</Text>
        <Text tone='muted' variant='caption'>Status: {test.status}</Text>
      </Card>

      <Card variant='flat' style={{ gap: spacing['8'] }}>
        <Text variant='title'>Result summary</Text>
        <Text tone='muted'>{test.summary}</Text>
        {test.notes ? <Text tone='muted' variant='bodySm'>Notes: {test.notes}</Text> : null}
        <Box style={{ gap: spacing['8'] }}>
          {test.metrics.map((metric) => (
            <Box
              key={metric.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: colors.divider,
                borderBottomWidth: borderWidth.thin,
                paddingVertical: spacing['8'],
              }}
            >
              <Text variant='label'>{metric.label}</Text>
              <Text tone='muted' variant='bodySm'>{metric.value}</Text>
            </Box>
          ))}
        </Box>
      </Card>

      <Card variant='flat' style={{ gap: spacing['12'] }}>
        <Box
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            alignItems: isCompact ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: spacing['8'],
          }}
        >
          <Text variant='title'>Recommended products</Text>
          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button
              size='sm'
              disabled={addingAll || inStockProducts.length === 0}
              onPress={onAddAll}
            >
              {addingAll ? 'Adding...' : 'Add all'}
            </Button>
          </Box>
        </Box>

        {test.recommendedProducts.length === 0 ? (
          <Text tone='muted'>No recommended products for this test.</Text>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            {test.recommendedProducts.map((item) => {
              const split = splitProductName(item.name)
              const isOutOfStock = item.inStock === false
              const alreadyInCart = cartProductIds.has(item.productId)
              const isAddingCurrent = addingProductId === item.productId
              return (
                <Card key={item.productId} tone='subtle'>
                  <Box
                    style={{
                      flexDirection: isCompact ? 'column' : 'row',
                      alignItems: isCompact ? 'flex-start' : 'center',
                      gap: spacing['12'],
                    }}
                  >
                    <Box
                      style={{
                        width: spacing['48'],
                        height: spacing['48'],
                        borderRadius: radius.sm,
                        backgroundColor: colors.surfaceMuted,
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: colors.divider,
                        borderWidth: borderWidth.thin,
                      }}
                    >
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: spacing['48'], height: spacing['48'] }}
                          resizeMode='cover'
                        />
                      ) : (
                        <Text tone='muted' variant='caption'>IMG</Text>
                      )}
                    </Box>

                    <Box style={{ flex: 1, gap: spacing['4'] }}>
                      <Text tone='muted' variant='caption'>{item.brand || split.brand}</Text>
                      <Text variant='label'>{item.brand ? split.name : item.name}</Text>
                      <Text tone='primary' variant='label'>{formatMoney(item.price, item.currency)}</Text>
                      {isOutOfStock ? <Text tone='danger' variant='caption'>Out of stock</Text> : null}
                    </Box>
                  </Box>

                  <Box style={{ flexDirection: isCompact ? 'column' : 'row', flexWrap: 'wrap', gap: spacing['8'], marginTop: spacing['8'] }}>
                    <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                      <Button
                        size='sm'
                        disabled={isOutOfStock || alreadyInCart || isAddingCurrent}
                        onPress={() => onAddProduct?.(item.productId)}
                      >
                        {alreadyInCart ? 'Added' : isAddingCurrent ? 'Adding...' : 'Add to cart'}
                      </Button>
                    </Box>
                    <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                      <Button size='sm' variant='outline' onPress={() => onViewProduct?.(item.productId)}>
                        View product
                      </Button>
                    </Box>
                  </Box>
                </Card>
              )
            })}
          </Box>
        )}
      </Card>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}
