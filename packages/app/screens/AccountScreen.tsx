import { useEffect, useMemo, useState } from 'react'
import { Image, Platform, useWindowDimensions } from 'react-native'
import { borderWidth, breakpoints, colors, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, HorizontalScroll, Input, Text, Touchable } from '@real/ui/primitives'
import { Button, Card, MetricCard } from '@real/ui/components'
import { AccountQrPreview } from './AccountQrPreview'
import {
  AccountAddress,
  AccountOverview,
  AccountTestRecord,
  LoyaltyWallet,
  LoyaltyHistoryEntry,
  OrderSummary,
  WishlistItem,
} from '@real/app/lib/types'

type LoyaltySummary = AccountOverview['loyaltySummary']

type AccountScreenProps = {
  customerName: string
  customerEmail?: string
  userQrCode?: string
  promoTitle?: string
  promoSubtitle?: string
  orders?: OrderSummary[]
  addresses?: AccountAddress[]
  loyalty?: LoyaltySummary | null
  loyaltyWallet?: LoyaltyWallet | null
  loyaltyHistory?: LoyaltyHistoryEntry[]
  wishlist?: WishlistItem[]
  tests?: AccountTestRecord[]
  loading?: boolean
  error?: string | null
  signingOut?: boolean
  onSignOut?: () => void
  onSelectOrder?: (orderId: string) => void
  onSelectTest?: (testId: string) => void
  onOpenWishlistItem?: (id: string) => void
  onAddWishlistItemToCart?: (id: string) => void | Promise<void>
  initialTab?: AccountTab
  onTabChange?: (tab: AccountTab) => void
  onAddAddress?: (input: {
    label: string
    city: string
    area: string
    building: string
    floor?: string
    apartment?: string
  }) => void | Promise<void>
  onEditAddress?: (
    id: string,
    input: {
      label: string
      city: string
      area: string
      building: string
      floor?: string
      apartment?: string
    }
  ) => void | Promise<void>
  onRemoveAddress?: (id: string) => void
  onSetDefaultAddress?: (id: string) => void
}

type AccountTab = 'dashboard' | 'orders' | 'tests' | 'addresses' | 'loyalty' | 'wishlist' | 'settings'

const IN_PAGE_TABS: Array<{ key: AccountTab; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'tests', label: 'Tests' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'settings', label: 'Settings' },
]

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`
}

function toRelativePoints(pointsDelta: number) {
  return pointsDelta > 0 ? `+${pointsDelta}` : `${pointsDelta}`
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

export function AccountScreen({
  customerName,
  customerEmail,
  userQrCode,
  promoTitle = 'Loyalty unlocks better routines',
  promoSubtitle = 'Earn points on every checkout and redeem on essentials.',
  orders = [],
  addresses = [],
  loyalty = null,
  loyaltyWallet = null,
  loyaltyHistory = [],
  wishlist = [],
  tests = [],
  loading = false,
  error = null,
  signingOut = false,
  onSignOut,
  onSelectOrder,
  onSelectTest,
  onOpenWishlistItem,
  onAddWishlistItemToCart,
  initialTab = 'dashboard',
  onTabChange,
  onAddAddress,
  onEditAddress,
  onRemoveAddress,
  onSetDefaultAddress,
}: AccountScreenProps) {
  const { width } = useWindowDimensions()
  const isNative = Platform.OS !== 'web'
  const isDesktop = !isNative && (width >= breakpoints.desktopMin || width === 0)
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressArea, setAddressArea] = useState('')
  const [addressBuilding, setAddressBuilding] = useState('')
  const [addressFloor, setAddressFloor] = useState('')
  const [addressApartment, setAddressApartment] = useState('')
  const [addressFormError, setAddressFormError] = useState<string | null>(null)
  const [addressFormSaving, setAddressFormSaving] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState<string | null>(null)
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    let active = true
    if (!userQrCode || Platform.OS !== 'web') {
      setQrImageDataUrl(null)
      return
    }
    void import('qrcode')
      .then((mod) => mod.toDataURL(userQrCode, { width: 192, margin: 1 }))
      .then((dataUrl) => {
        if (active) {
          setQrImageDataUrl(dataUrl)
        }
      })
      .catch(() => {
        if (active) {
          setQrImageDataUrl(null)
        }
      })
    return () => {
      active = false
    }
  }, [userQrCode])

  const mostRecentOrder = useMemo(() => {
    if (orders.length === 0) return null
    return [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0] ?? null
  }, [orders])

  const summaryMetrics = useMemo(() => {
    const currency = loyalty?.currency ?? mostRecentOrder?.currency ?? 'USD'
    return [
      {
        label: 'Tier',
        value: loyalty?.tier ?? 'Starter',
      },
      {
        label: 'Points',
        value: `${loyalty?.points ?? 0}`,
      },
      {
        label: 'Redeemable',
        value: formatMoney(loyalty?.redeemableValue ?? 0, currency),
      },
      {
        label: 'Last order',
        value: mostRecentOrder
          ? formatMoney(mostRecentOrder.total, mostRecentOrder.currency)
          : 'No orders',
      },
    ]
  }, [loyalty?.currency, loyalty?.points, loyalty?.redeemableValue, loyalty?.tier, mostRecentOrder])

  const resetAddressForm = () => {
    setAddressLabel('')
    setAddressCity('')
    setAddressArea('')
    setAddressBuilding('')
    setAddressFloor('')
    setAddressApartment('')
    setAddressFormError(null)
    setAddressFormSaving(false)
    setEditingAddressId(null)
    setShowAddressForm(false)
  }

  const handleSaveAddress = async () => {
    const label = addressLabel.trim()
    const city = addressCity.trim()
    const area = addressArea.trim()
    const building = addressBuilding.trim()
    if (!label || !city || !area || !building) {
      setAddressFormError('Label, city, area, and building are required.')
      return
    }

    setAddressFormSaving(true)
    setAddressFormError(null)
    try {
      const payload = {
        label,
        city,
        area,
        building,
        floor: addressFloor.trim() || undefined,
        apartment: addressApartment.trim() || undefined,
      }
      if (editingAddressId) {
        await onEditAddress?.(editingAddressId, payload)
      } else {
        await onAddAddress?.(payload)
      }
      resetAddressForm()
    } catch (error) {
      setAddressFormSaving(false)
      setAddressFormError(error instanceof Error ? error.message : 'Unable to save address.')
    }
  }

  const setTab = (tab: AccountTab) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  if (loading) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  const content = (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='24'>
      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'stretch',
          gap: spacing['24'],
        }}
      >
        <Card
          variant='raised'
          style={{
            width: isDesktop ? spacing['128'] * 2 : '100%',
            gap: spacing['16'],
            alignSelf: isDesktop ? 'flex-start' : 'stretch',
          }}
        >
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='h2'>Account</Text>
            <Text variant='bodySm'>Welcome, {customerName}</Text>
            {customerEmail ? <Text variant='caption' tone='muted'>{customerEmail}</Text> : null}
          </Box>

          {isDesktop ? (
            <Box style={{ gap: spacing['8'] }}>
              {IN_PAGE_TABS.map((tab) => (
                <Touchable
                  key={tab.key}
                  onPress={() => setTab(tab.key)}
                  accessibilityRole='button'
                  accessibilityLabel={`Open ${tab.label}`}
                  style={{
                    paddingVertical: spacing['8'],
                    paddingHorizontal: spacing['16'],
                    borderRadius: radius.sm,
                    backgroundColor: activeTab === tab.key ? colors.brandPrimarySubtle : colors.surfaceMuted,
                  }}
                >
                  <Text tone={activeTab === tab.key ? 'primary' : 'default'} variant='label'>
                    {tab.label}
                  </Text>
                </Touchable>
              ))}

            </Box>
          ) : (
            <HorizontalScroll>
              <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                {IN_PAGE_TABS.map((tab) => (
                  <Touchable
                    key={tab.key}
                    onPress={() => setTab(tab.key)}
                    style={{
                      paddingVertical: spacing['8'],
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.full,
                      backgroundColor: activeTab === tab.key ? colors.brandPrimarySubtle : colors.surfaceMuted,
                    }}
                    >
                      <Text tone={activeTab === tab.key ? 'primary' : 'default'} variant='label'>
                        {tab.label}
                      </Text>
                    </Touchable>
                ))}
              </Box>
            </HorizontalScroll>
          )}

          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button size='sm' variant='outline' onPress={onSignOut} disabled={signingOut}>
              {signingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </Box>
        </Card>

        <Box style={{ flex: 1, gap: spacing['16'] }}>
          {activeTab === 'dashboard' || activeTab === 'loyalty' ? (
            <Card variant='raised' style={{ gap: spacing['8'] }}>
              <Text variant='title'>{promoTitle}</Text>
              <Text tone='muted'>{promoSubtitle}</Text>
            </Card>
          ) : null}

          {error ? (
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text tone='danger'>Unable to load account data.</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
            </Card>
          ) : null}

          {activeTab === 'dashboard' ? (
            <Box style={{ gap: spacing['16'] }}>
              <Box
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: spacing['16'],
                }}
              >
                {summaryMetrics.map((metric) => (
                  <Box
                    key={metric.label}
                    style={{
                      flexBasis: isDesktop ? '48%' : '100%',
                      flexGrow: 1,
                    }}
                  >
                    <MetricCard label={metric.label} value={metric.value} />
                  </Box>
                ))}
              </Box>

              <Card variant='flat' style={{ gap: spacing['8'] }}>
                <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant='title'>Recent orders</Text>
                  <Touchable onPress={() => setTab('orders')}>
                    <Text variant='label' tone='primary'>View all</Text>
                  </Touchable>
                </Box>

                {orders.length === 0 ? (
                  <Text tone='muted'>No orders yet.</Text>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <Touchable
                      key={order.id}
                      onPress={() => onSelectOrder?.(order.id)}
                      accessibilityRole='button'
                      accessibilityLabel={`Open order ${order.id}`}
                    >
                      <Box
                        style={{
                          paddingVertical: spacing['8'],
                          borderBottomColor: colors.divider,
                          borderBottomWidth: borderWidth.thin,
                          gap: spacing['4'],
                        }}
                      >
                        <Text variant='label'>Order {order.id}</Text>
                        <Text variant='caption' tone='muted'>
                          {order.status} • {formatMoney(order.total, order.currency)}
                        </Text>
                      </Box>
                    </Touchable>
                  ))
                )}
              </Card>

              <Card variant='flat' style={{ gap: spacing['8'] }}>
                <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant='title'>Diagnostics tests</Text>
                  <Touchable onPress={() => setTab('tests')}>
                    <Text variant='label' tone='primary'>Open tests</Text>
                  </Touchable>
                </Box>
                {tests.length === 0 ? (
                  <Text tone='muted'>No tests recorded yet.</Text>
                ) : (
                  tests.slice(0, 2).map((test) => (
                    <Box key={test.id} style={{ gap: spacing['4'] }}>
                      <Text variant='label'>{test.title}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(test.createdAt).toLocaleDateString()} • {test.recommendedCount} recommendations
                      </Text>
                    </Box>
                  ))
                )}
              </Card>
            </Box>
          ) : null}

          {activeTab === 'orders' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>Orders</Text>
              {orders.length === 0 ? (
                <Text tone='muted'>No orders yet.</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {orders.map((order) => (
                    <Card key={order.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Text variant='label'>Order {order.id}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(order.createdAt).toLocaleDateString()} • {order.status}
                      </Text>
                      <Text tone='muted' variant='caption'>
                        {formatMoney(order.total, order.currency)}
                      </Text>
                      <Box style={isDesktop ? { width: spacing['128'] } : isCompact ? undefined : { alignSelf: 'flex-start' }}>
                        <Button
                          size='sm'
                          variant='outline'
                          onPress={() => onSelectOrder?.(order.id)}
                        >
                          View order
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Card>
          ) : null}

          {activeTab === 'tests' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>Diagnostics tests</Text>
              {userQrCode ? (
                <Card tone='subtle' style={{ gap: spacing['8'] }}>
                  <Text variant='label'>My QR code</Text>
                  <Text tone='muted' variant='caption'>
                    Pharmacist can scan this code to open your profile instantly.
                  </Text>
                  <AccountQrPreview userQrCode={userQrCode} qrImageDataUrl={qrImageDataUrl} />
                  <Text variant='caption' tone='muted'>
                    {userQrCode}
                  </Text>
                </Card>
              ) : null}
              {tests.length === 0 ? (
                <Text tone='muted'>No tests recorded yet.</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {tests.map((test) => (
                    <Card key={test.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Text variant='label'>{test.title}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(test.createdAt).toLocaleDateString()} • {test.recommendedCount} recommendations
                      </Text>
                      <Text tone='muted' variant='caption'>
                        Purchased from recommendations: {test.purchasedCount}
                      </Text>
                      <Box style={isDesktop ? { width: spacing['128'] } : isCompact ? undefined : { alignSelf: 'flex-start' }}>
                        <Button
                          size='sm'
                          variant='outline'
                          onPress={() => onSelectTest?.(test.id)}
                        >
                          View result
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Card>
          ) : null}

          {activeTab === 'addresses' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant='title'>Addresses</Text>
                <Button
                  size='sm'
                  variant='outline'
                  onPress={() => {
                    setAddressFormError(null)
                    setShowAddressForm((current) => {
                      const next = !current
                      if (!next) {
                        setEditingAddressId(null)
                      }
                      return next
                    })
                  }}
                >
                  {showAddressForm ? 'Close form' : 'Add address'}
                </Button>
              </Box>

              {showAddressForm ? (
                <Card tone='subtle' style={{ gap: spacing['12'] }}>
                  <Text variant='label'>{editingAddressId ? 'Edit address' : 'Add a new address'}</Text>
                  <Input
                    value={addressLabel}
                    onChangeText={setAddressLabel}
                    placeholder='Label (Home, Work, etc.)'
                  />
                  <Input
                    value={addressCity}
                    onChangeText={setAddressCity}
                    placeholder='City'
                  />
                  <Input
                    value={addressArea}
                    onChangeText={setAddressArea}
                    placeholder='Area'
                  />
                  <Input
                    value={addressBuilding}
                    onChangeText={setAddressBuilding}
                    placeholder='Building'
                  />
                  <Input
                    value={addressFloor}
                    onChangeText={setAddressFloor}
                    placeholder='Floor (optional)'
                  />
                  <Input
                    value={addressApartment}
                    onChangeText={setAddressApartment}
                    placeholder='Apartment (optional)'
                  />
                  {addressFormError ? (
                    <Text variant='caption' tone='danger'>
                      {addressFormError}
                    </Text>
                  ) : null}
                  <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                    <Button
                      size='sm'
                    onPress={() => void handleSaveAddress()}
                    disabled={addressFormSaving}
                  >
                      {addressFormSaving ? 'Saving...' : editingAddressId ? 'Update address' : 'Save address'}
                  </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onPress={resetAddressForm}
                      disabled={addressFormSaving}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Card>
              ) : null}

              {addresses.length === 0 ? (
                <Text tone='muted'>No addresses saved yet.</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {addresses.map((address) => (
                    <Card key={address.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text variant='label'>{address.label}</Text>
                        {address.isDefault ? <Text variant='caption' tone='primary'>Default</Text> : null}
                      </Box>
                      <Text tone='muted' variant='caption'>
                        {address.city}, {address.area}, {address.building}
                      </Text>
                      <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                        <Button
                          size='sm'
                          variant='outline'
                          onPress={() => {
                            setAddressLabel(address.label)
                            setAddressCity(address.city)
                            setAddressArea(address.area)
                            setAddressBuilding(address.building)
                            setAddressFloor(address.floor ?? '')
                            setAddressApartment(address.apartment ?? '')
                            setAddressFormError(null)
                            setEditingAddressId(address.id)
                            setShowAddressForm(true)
                          }}
                        >
                          Edit
                        </Button>
                        {!address.isDefault ? (
                          <Button size='sm' variant='outline' onPress={() => onSetDefaultAddress?.(address.id)}>
                            Set default
                          </Button>
                        ) : null}
                        {confirmDeleteAddressId === address.id ? (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onPress={async () => {
                                setConfirmDeleteAddressId(null)
                                await onRemoveAddress?.(address.id)
                              }}
                            >
                              Confirm delete
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onPress={() => setConfirmDeleteAddressId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onPress={() => setConfirmDeleteAddressId(address.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                      {confirmDeleteAddressId === address.id ? (
                        <Text variant='caption' tone='danger'>
                          This action cannot be undone.
                        </Text>
                      ) : null}
                    </Card>
                  ))}
                </Box>
              )}
            </Card>
          ) : null}

          {activeTab === 'loyalty' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>Loyalty wallet</Text>
              {!loyalty ? (
                <Text tone='muted'>Loyalty is not available for this account yet.</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  <Text variant='bodySm'>Tier: {loyalty.tier}</Text>
                  <Text variant='bodySm'>Points balance: {loyalty.points}</Text>
                  <Text variant='bodySm'>
                    Redeemable value: {formatMoney(loyalty.redeemableValue, loyalty.currency)}
                  </Text>
                  {loyaltyWallet ? (
                    <>
                      <Card tone='subtle' style={{ gap: spacing['8'] }}>
                        <Box
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text variant='label'>{loyaltyWallet.tierProgress.currentTierName}</Text>
                          <Text variant='caption' tone='muted'>
                            {`${loyaltyWallet.tierProgress.currentPoints} pts`}
                          </Text>
                        </Box>
                        <Box
                          style={{
                            width: '100%',
                            height: spacing['8'],
                            borderRadius: radius.sm,
                            backgroundColor: colors.surfaceMuted,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            style={{
                              width: `${loyaltyWallet.tierProgress.progressPercent}%`,
                              height: '100%',
                              backgroundColor: colors.brandPrimary,
                            }}
                          />
                        </Box>
                        <Box
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text variant='caption' tone='muted'>
                            Current: {loyaltyWallet.tierProgress.currentTierName}
                          </Text>
                          <Text variant='caption' tone='muted'>
                            {loyaltyWallet.tierProgress.nextTierName
                              ? `Next: ${loyaltyWallet.tierProgress.nextTierName}`
                              : 'Top tier reached'}
                          </Text>
                        </Box>
                        {loyaltyWallet.tierProgress.nextTierName ? (
                          <Text variant='caption' tone='muted'>
                            {`${loyaltyWallet.tierProgress.pointsToNextTier} points to reach ${loyaltyWallet.tierProgress.nextTierName}`}
                          </Text>
                        ) : null}
                      </Card>
                      <Text variant='caption' tone='muted'>
                        {`Expiring soon: ${loyaltyWallet.expiringSoonPoints} points${
                          loyaltyWallet.expiringSoonAt
                            ? ` by ${new Date(loyaltyWallet.expiringSoonAt).toLocaleDateString()}`
                            : ''
                        }`}
                      </Text>
                      <Text variant='caption' tone='muted'>
                        {`In-store barcode: ${loyaltyWallet.barcode.code} (expires ${new Date(
                          loyaltyWallet.barcode.expiresAt
                        ).toLocaleDateString()})`}
                      </Text>
                      <Box style={{ gap: spacing['4'] }}>
                        <Text variant='caption' tone='muted'>Available redeem options</Text>
                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                          {loyaltyWallet.redeemOptions.map((option) => (
                            <Text key={option.percent} variant='caption' tone='muted'>
                              {`${option.percent}% (${option.pointsCost} pts)`}
                            </Text>
                          ))}
                        </Box>
                      </Box>
                    </>
                  ) : null}
                </Box>
              )}

              <Text variant='title'>History</Text>
              {loyaltyHistory.length === 0 ? (
                <Text tone='muted'>No loyalty activity yet.</Text>
              ) : (
                loyaltyHistory.slice(0, 6).map((entry) => (
                  <Box
                    key={entry.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: spacing['8'],
                      borderBottomColor: colors.divider,
                      borderBottomWidth: borderWidth.thin,
                    }}
                  >
                    <Box>
                      <Text variant='label'>{entry.title}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>
                    <Text tone={entry.pointsDelta > 0 ? 'success' : 'default'} variant='label'>
                      {toRelativePoints(entry.pointsDelta)}
                    </Text>
                  </Box>
                ))
              )}
            </Card>
          ) : null}

          {activeTab === 'wishlist' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>Wishlist</Text>
              {wishlist.length === 0 ? (
                <Text tone='muted'>No saved items yet.</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {wishlist.map((item) => (
                    <Touchable
                      key={item.id}
                      onPress={() => onOpenWishlistItem?.(item.id)}
                      accessibilityRole='button'
                      accessibilityLabel={`Open product ${item.name}`}
                    >
                      <Card tone='subtle'>
                        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['12'] }}>
                          <Box
                            style={{
                              width: spacing['48'],
                              height: spacing['48'],
                              borderRadius: radius.sm,
                              backgroundColor: colors.surfaceMuted,
                              overflow: 'hidden',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.imageUrl ? (
                              <Image
                                source={{ uri: item.imageUrl }}
                                style={{
                                  width: spacing['48'],
                                  height: spacing['48'],
                                }}
                                resizeMode='cover'
                              />
                            ) : (
                              <Text variant='caption' tone='muted'>IMG</Text>
                            )}
                          </Box>

                          <Box style={{ flex: 1, gap: spacing['4'] }}>
                            <Text tone='muted' variant='caption'>
                              {item.brand || splitProductName(item.name).brand}
                            </Text>
                            <Text variant='label'>
                              {item.brand ? splitProductName(item.name).name : item.name}
                            </Text>
                            <Text tone='primary' variant='label'>
                              {formatMoney(item.price, item.currency)}
                            </Text>
                            <Box style={isDesktop ? { width: spacing['128'] } : isCompact ? undefined : { alignSelf: 'flex-start' }}>
                              <Button
                                size='sm'
                                variant='outline'
                                onPress={() => onAddWishlistItemToCart?.(item.id)}
                              >
                                Add to cart
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    </Touchable>
                  ))}
                </Box>
              )}
            </Card>
          ) : null}

          {activeTab === 'settings' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>Settings</Text>
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text variant='label'>Notifications</Text>
                <Text variant='caption' tone='muted'>Email and campaign preferences.</Text>
                <Button size='sm' variant='outline'>Manage notifications</Button>
              </Card>
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text variant='label'>Password</Text>
                <Text variant='caption' tone='muted'>Update your account password and security.</Text>
                <Button size='sm' variant='outline'>Change password</Button>
              </Card>
            </Card>
          ) : null}
        </Box>
      </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )

  return content
}
