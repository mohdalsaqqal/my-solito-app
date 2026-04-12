import React, { useEffect, useMemo, useState } from 'react'
import { Image, Platform } from 'react-native'
import { borderWidth, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, HorizontalScroll, Input, Text } from '@real/ui/primitives'
import { Touchable } from '@real/ui/primitives/Touchable'
import { Button, Card, MetricCard } from '@real/ui/components'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import type { TranslationKey } from '@real/app/lib/i18n/generated/translation-keys'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
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
import type { ReferralAccountSummary } from '@real/app/lib/referral/referral-types'

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
  referralSummary?: ReferralAccountSummary | null
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

type AccountTab = 'dashboard' | 'orders' | 'tests' | 'addresses' | 'loyalty' | 'wishlist' | 'settings' | 'referral'

const IN_PAGE_TAB_KEYS: AccountTab[] = ['dashboard', 'orders', 'tests', 'addresses', 'loyalty', 'wishlist', 'settings']

const TAB_LABEL_KEY_MAP: Record<AccountTab, TranslationKey> = {
  dashboard: 'account.tabs.dashboard',
  orders: 'account.tabs.orders',
  tests: 'account.tabs.tests',
  addresses: 'account.tabs.addresses',
  loyalty: 'account.tabs.loyalty',
  wishlist: 'account.tabs.wishlist',
  settings: 'account.tabs.settings',
  referral: 'account.tabs.settings',
}

function getTabLabel(key: AccountTab, t: (k: TranslationKey) => string): string {
  return t(TAB_LABEL_KEY_MAP[key])
}

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

export const AccountScreen = React.memo(function AccountScreen({
  customerName,
  customerEmail,
  userQrCode,
  promoTitle,
  promoSubtitle,
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
  const { t } = useTranslation('account')
  const resolvedPromoTitle = promoTitle ?? t('account.promo.title')
  const resolvedPromoSubtitle = promoSubtitle ?? t('account.promo.subtitle')
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isNative = Platform.OS !== 'web'
  const isDesktop = !isNative && profile.breakpoint === 'desktop'
  const isCompact = profile.breakpoint === 'mobile'
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

  const IN_PAGE_TABS = useMemo(
    () =>
      IN_PAGE_TAB_KEYS.map((key) => ({
        key,
        label: getTabLabel(key, t),
      })),
    [t]
  )

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
        label: t('account.metrics.tier'),
        value: loyalty?.tier ?? 'Starter',
      },
      {
        label: t('account.metrics.points'),
        value: `${loyalty?.points ?? 0}`,
      },
      {
        label: t('account.metrics.redeemable'),
        value: formatMoney(loyalty?.redeemableValue ?? 0, currency),
      },
      {
        label: t('account.metrics.lastOrder'),
        value: mostRecentOrder
          ? formatMoney(mostRecentOrder.total, mostRecentOrder.currency)
          : t('account.metrics.noOrders'),
      },
    ]
  }, [loyalty?.currency, loyalty?.points, loyalty?.redeemableValue, loyalty?.tier, mostRecentOrder, t])

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
      setAddressFormError(t('account.addresses.form.validationError'))
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
      setAddressFormError(error instanceof Error ? error.message : t('account.addresses.form.saveError'))
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
            <Text variant='h1'>{t('account.title')}</Text>
            <Text variant='bodySm'>{t('account.welcome', { name: customerName })}</Text>
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
                    backgroundColor: activeTab === tab.key ? c.brandPrimarySubtle : c.surfaceMuted,
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
                      backgroundColor: activeTab === tab.key ? c.brandPrimarySubtle : c.surfaceMuted,
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
              {signingOut ? t('account.signOut.signingOut') : t('account.signOut.label')}
            </Button>
          </Box>
        </Card>

        <Box style={{ flex: 1, gap: spacing['16'] }}>
          {activeTab === 'dashboard' || activeTab === 'loyalty' ? (
            <Card variant='raised' style={{ gap: spacing['8'] }}>
              <Text variant='title'>{resolvedPromoTitle}</Text>
              <Text tone='muted'>{resolvedPromoSubtitle}</Text>
            </Card>
          ) : null}

          {error ? (
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text tone='danger'>{t('account.error.loadFailed')}</Text>
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
                  <Text variant='title'>{t('account.orders.title')}</Text>
                  <Touchable onPress={() => setTab('orders')}>
                    <Text variant='label' tone='primary'>{t('account.orders.viewAll')}</Text>
                  </Touchable>
                </Box>

                {orders.length === 0 ? (
                  <Text tone='muted'>{t('account.orders.empty')}</Text>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <Touchable
                      key={order.id}
                      onPress={() => onSelectOrder?.(order.id)}
                      accessibilityRole='button'
                      accessibilityLabel={t('account.orders.accessibilityLabel', { id: order.id })}
                    >
                      <Box
                        style={{
                          paddingVertical: spacing['8'],
                          borderBottomColor: c.divider,
                          borderBottomWidth: borderWidth.thin,
                          gap: spacing['4'],
                        }}
                      >
                        <Text variant='label'>{t('account.orders.orderLabel', { id: order.id })}</Text>
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
                  <Text variant='title'>{t('account.tests.title')}</Text>
                  <Touchable onPress={() => setTab('tests')}>
                    <Text variant='label' tone='primary'>{t('account.tests.openTests')}</Text>
                  </Touchable>
                </Box>
                {tests.length === 0 ? (
                  <Text tone='muted'>{t('account.tests.empty')}</Text>
                ) : (
                  tests.slice(0, 2).map((test) => (
                    <Box key={test.id} style={{ gap: spacing['4'] }}>
                      <Text variant='label'>{test.title}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(test.createdAt).toLocaleDateString()} • {t('account.tests.recommendations', { count: test.recommendedCount })}
                      </Text>
                    </Box>
                  ))
                )}
              </Card>
            </Box>
          ) : null}

          {activeTab === 'orders' ? (
            <Card variant='flat' style={{ gap: spacing['12'] }}>
              <Text variant='title'>{t('account.orders.title')}</Text>
              {orders.length === 0 ? (
                <Text tone='muted'>{t('account.orders.empty')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {orders.map((order) => (
                    <Card key={order.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Text variant='label'>{t('account.orders.orderLabel', { id: order.id })}</Text>
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
                          {t('account.orders.viewOrder')}
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
              <Text variant='title'>{t('account.tests.title')}</Text>
              {userQrCode ? (
                <Card tone='subtle' style={{ gap: spacing['8'] }}>
                  <Text variant='label'>{t('account.tests.qr.title')}</Text>
                  <Text tone='muted' variant='caption'>
                    {t('account.tests.qr.subtitle')}
                  </Text>
                  <AccountQrPreview userQrCode={userQrCode} qrImageDataUrl={qrImageDataUrl} />
                  <Text variant='caption' tone='muted'>
                    {userQrCode}
                  </Text>
                </Card>
              ) : null}
              {tests.length === 0 ? (
                <Text tone='muted'>{t('account.tests.empty')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {tests.map((test) => (
                    <Card key={test.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Text variant='label'>{test.title}</Text>
                      <Text tone='muted' variant='caption'>
                        {new Date(test.createdAt).toLocaleDateString()} • {t('account.tests.recommendations', { count: test.recommendedCount })}
                      </Text>
                      <Text tone='muted' variant='caption'>
                        {t('account.tests.purchasedFromRecommendations', { count: test.purchasedCount })}
                      </Text>
                      <Box style={isDesktop ? { width: spacing['128'] } : isCompact ? undefined : { alignSelf: 'flex-start' }}>
                        <Button
                          size='sm'
                          variant='outline'
                          onPress={() => onSelectTest?.(test.id)}
                        >
                          {t('account.tests.viewResult')}
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
                <Text variant='title'>{t('account.addresses.title')}</Text>
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
                  {showAddressForm ? t('account.addresses.form.closeForm') : t('account.addresses.add')}
                </Button>
              </Box>

              {showAddressForm ? (
                <Card tone='subtle' style={{ gap: spacing['12'] }}>
                  <Text variant='label'>{editingAddressId ? t('account.addresses.form.editTitle') : t('account.addresses.form.addTitle')}</Text>
                  <Input
                    value={addressLabel}
                    onChangeText={setAddressLabel}
                    placeholder={t('account.addresses.form.label')}
                  />
                  <Input
                    value={addressCity}
                    onChangeText={setAddressCity}
                    placeholder={t('account.addresses.form.city')}
                  />
                  <Input
                    value={addressArea}
                    onChangeText={setAddressArea}
                    placeholder={t('account.addresses.form.area')}
                  />
                  <Input
                    value={addressBuilding}
                    onChangeText={setAddressBuilding}
                    placeholder={t('account.addresses.form.building')}
                  />
                  <Input
                    value={addressFloor}
                    onChangeText={setAddressFloor}
                    placeholder={t('account.addresses.form.floor')}
                  />
                  <Input
                    value={addressApartment}
                    onChangeText={setAddressApartment}
                    placeholder={t('account.addresses.form.apartment')}
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
                      {addressFormSaving ? t('account.addresses.form.saving') : editingAddressId ? t('account.addresses.form.update') : t('account.addresses.form.save')}
                  </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onPress={resetAddressForm}
                      disabled={addressFormSaving}
                    >
                      {t('account.addresses.form.cancel')}
                    </Button>
                  </Box>
                </Card>
              ) : null}

              {addresses.length === 0 ? (
                <Text tone='muted'>{t('account.addresses.empty')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {addresses.map((address) => (
                    <Card key={address.id} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text variant='label'>{address.label}</Text>
                        {address.isDefault ? <Text variant='caption' tone='primary'>{t('account.addresses.default')}</Text> : null}
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
                          {t('account.addresses.edit')}
                        </Button>
                        {!address.isDefault ? (
                          <Button size='sm' variant='outline' onPress={() => onSetDefaultAddress?.(address.id)}>
                            {t('account.addresses.setAsDefault')}
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
                              {t('account.addresses.confirmDelete')}
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onPress={() => setConfirmDeleteAddressId(null)}
                            >
                              {t('account.addresses.cancelDelete')}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onPress={() => setConfirmDeleteAddressId(address.id)}
                          >
                            {t('account.addresses.delete')}
                          </Button>
                        )}
                      </Box>
                      {confirmDeleteAddressId === address.id ? (
                        <Text variant='caption' tone='danger'>
                          {t('account.addresses.deleteWarning')}
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
              <Text variant='title'>{t('account.loyalty.title')}</Text>
              {!loyalty ? (
                <Text tone='muted'>{t('account.loyalty.notAvailable')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  <Text variant='bodySm'>{t('account.loyalty.tier', { tier: loyalty.tier })}</Text>
                  <Text variant='bodySm'>{t('account.loyalty.pointsBalance', { points: loyalty.points })}</Text>
                  <Text variant='bodySm'>
                    {t('account.loyalty.redeemableValue', { value: formatMoney(loyalty.redeemableValue, loyalty.currency) })}
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
                            backgroundColor: c.surfaceMuted,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            style={{
                              width: `${loyaltyWallet.tierProgress.progressPercent}%`,
                              height: '100%',
                              backgroundColor: c.brandPrimary,
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
                            {t('account.loyalty.tierProgress.current', { tier: loyaltyWallet.tierProgress.currentTierName })}
                          </Text>
                          <Text variant='caption' tone='muted'>
                            {loyaltyWallet.tierProgress.nextTierName
                              ? t('account.loyalty.tierProgress.next', { tier: loyaltyWallet.tierProgress.nextTierName })
                              : t('account.loyalty.tierProgress.topTier')}
                          </Text>
                        </Box>
                        {loyaltyWallet.tierProgress.nextTierName ? (
                          <Text variant='caption' tone='muted'>
                            {t('account.loyalty.tierProgress.pointsToNext', { points: loyaltyWallet.tierProgress.pointsToNextTier, tier: loyaltyWallet.tierProgress.nextTierName })}
                          </Text>
                        ) : null}
                      </Card>
                      <Text variant='caption' tone='muted'>
                        {t('account.loyalty.expiringSoon', {
                          points: loyaltyWallet.expiringSoonPoints,
                          date: loyaltyWallet.expiringSoonAt
                            ? new Date(loyaltyWallet.expiringSoonAt).toLocaleDateString()
                            : undefined,
                        })}
                      </Text>
                      <Text variant='caption' tone='muted'>
                        {t('account.loyalty.inStoreBarcode', {
                          code: loyaltyWallet.barcode.code,
                          date: new Date(loyaltyWallet.barcode.expiresAt).toLocaleDateString(),
                        })}
                      </Text>
                      <Box style={{ gap: spacing['4'] }}>
                        <Text variant='caption' tone='muted'>{t('account.loyalty.redeemOptions.title')}</Text>
                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                          {loyaltyWallet.redeemOptions.map((option) => (
                            <Text key={option.percent} variant='caption' tone='muted'>
                              {t('account.loyalty.redeemOptions.option', { percent: option.percent, points: option.pointsCost })}
                            </Text>
                          ))}
                        </Box>
                      </Box>
                    </>
                  ) : null}
                </Box>
              )}

              <Text variant='title'>{t('account.loyalty.history.title')}</Text>
              {loyaltyHistory.length === 0 ? (
                <Text tone='muted'>{t('account.loyalty.history.empty')}</Text>
              ) : (
                loyaltyHistory.slice(0, 6).map((entry) => (
                  <Box
                    key={entry.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: spacing['8'],
                      borderBottomColor: c.divider,
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
              <Text variant='title'>{t('account.wishlist.title')}</Text>
              {wishlist.length === 0 ? (
                <Text tone='muted'>{t('account.wishlist.empty')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {wishlist.map((item) => (
                    <Touchable
                      key={item.id}
                      onPress={() => onOpenWishlistItem?.(item.id)}
                      accessibilityRole='button'
                      accessibilityLabel={t('account.wishlist.accessibilityLabel', { name: item.name })}
                    >
                      <Card tone='subtle'>
                        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['12'] }}>
                          <Box
                            style={{
                              width: spacing['48'],
                              height: spacing['48'],
                              borderRadius: radius.sm,
                              backgroundColor: c.surfaceMuted,
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
                                {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
                              />
                            ) : (
                              <Text variant='caption' tone='muted'>{t('account.wishlist.imgPlaceholder')}</Text>
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
                                {t('account.wishlist.addToCart')}
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
              <Text variant='title'>{t('account.settings.title')}</Text>
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text variant='label'>{t('account.settings.notifications.title')}</Text>
                <Text variant='caption' tone='muted'>{t('account.settings.notifications.subtitle')}</Text>
                <Button size='sm' variant='outline'>{t('account.settings.notifications.manage')}</Button>
              </Card>
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text variant='label'>{t('account.settings.password.title')}</Text>
                <Text variant='caption' tone='muted'>{t('account.settings.password.subtitle')}</Text>
                <Button size='sm' variant='outline'>{t('account.settings.password.change')}</Button>
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
})
