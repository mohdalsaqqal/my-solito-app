import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Platform } from 'react-native'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
import {
  AccountAddress,
  CheckoutPlaceOrderInput,
  CheckoutQuoteInput,
  CheckoutQuoteResponse,
  LoyaltyWallet,
} from '@real/app/lib/types'
import { borderWidth, componentTokens, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Divider, Input, Text } from '@real/ui/primitives'
import { Button, Card, PaymentBadges, CheckoutStepper } from '@real/ui/components'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'

type CheckoutItem = {
  id: string
  name: string
  quantity: number
  price: number
  currency: string
  imageUrl?: string
}

type CheckoutBranch = {
  id: string
  name: string
  city?: string
  area?: string
  building?: string
  stockCount: number
  distanceKm?: number
  payAtBranchEnabled?: boolean
  payNowEnabled?: boolean
}

type CheckoutConfig = {
  paymentMethods?: {
    codEnabled?: boolean
    cardOnDeliveryEnabled?: boolean
    onlineCardEnabled?: boolean
  }
  fulfillment?: {
    deliveryEnabled?: boolean
    branchPickupEnabled?: boolean
  }
  branches?: CheckoutBranch[]
}

type CheckoutAddressDraft = {
  label?: string
  city: string
  area: string
  building: string
  floor?: string
  apartment?: string
  notes?: string
}

type CheckoutScreenProps = {
  items: CheckoutItem[]
  loading?: boolean
  error?: string | null
  notice?: string
  checkoutConfig?: CheckoutConfig
  savedAddresses?: AccountAddress[]
  initialAddress?: CheckoutAddressDraft | null
  loyaltyWallet?: LoyaltyWallet | null
  selectedRedeemPercent?: number
  onSelectRedeemPercent?: (percent?: number) => void
  onRequestQuote?: (input: CheckoutQuoteInput) => Promise<CheckoutQuoteResponse>
  onPlaceOrder?: (input: CheckoutPlaceOrderInput) => void | Promise<void>
  onRetry?: () => void
}

type FulfillmentMode = 'delivery' | 'pickup'
type CheckoutPaymentMethod = 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'
type AddressLabel = 'Home' | 'Work' | 'Other'

const DEFAULT_NOTICE = 'Shipping timelines are estimated and confirmed after payment.'
const COUPON_STORAGE_KEY = 'rc_checkout_coupon_code'

export const CheckoutScreen = React.memo(function CheckoutScreen({
  items,
  loading = false,
  error = null,
  notice = DEFAULT_NOTICE,
  checkoutConfig,
  savedAddresses = [],
  initialAddress = null,
  loyaltyWallet = null,
  selectedRedeemPercent,
  onSelectRedeemPercent,
  onRequestQuote,
  onPlaceOrder,
  onRetry,
}: CheckoutScreenProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const { t } = useTranslation('checkout')
  const isNative = Platform.OS !== 'web'
  const isDesktop = !isNative && profile.breakpoint === 'desktop'
  const isCompact = profile.breakpoint === 'mobile'
  const checkoutTokens = componentTokens.storefrontCommerce.checkout
  const loadErrorTitle = t('error.loadFailed')
  const emptyTitle = t('empty.title')
  const emptyMessage = t('empty.subtitle')
  const checkoutTitle = t('title')
  const contactTitle = t('contact.title')
  const fullNameLabel = t('contact.fullName')
  const fullNamePlaceholder = t('contact.fullNamePlaceholder')
  const phoneLabel = t('contact.phone')
  const phonePlaceholder = t('contact.phonePlaceholder')
  const fulfillmentTitle = t('fulfillment.title')
  const noStockedBranchesLabel = t('fulfillment.noStockedBranches')
  const selectedBranchOutLabel = t('fulfillment.selectedBranchOut')
  const deliveryAddressTitle = t('fulfillment.deliveryAddress')
  const savedAddressesLabel = t('fulfillment.savedAddresses')
  const cityLabel = t('address.city')
  const areaLabel = t('address.area')
  const cityPlaceholder = t('address.cityPlaceholder')
  const areaPlaceholder = t('address.areaPlaceholder')
  const buildingLabel = t('address.building')
  const buildingPlaceholder = t('address.buildingPlaceholder')
  const floorLabel = t('address.floor')
  const floorPlaceholder = t('address.floorPlaceholder')
  const apartmentLabel = t('address.apartment')
  const apartmentPlaceholder = t('address.apartmentPlaceholder')
  const deliveryNotesLabel = t('address.deliveryNotes')
  const deliveryNotesPlaceholder = t('address.deliveryNotesPlaceholder')
  const addressBookLabel = t('address.addressBook')
  const paymentTitle = t('payment.title')
  const noPaymentMethodsLabel = t('payment.noMethods')
  const promotionTitle = t('promotion.title')
  const couponLabel = t('promotion.coupon')
  const couponPlaceholder = t('promotion.couponPlaceholder')
  const refreshingQuoteLabel = t('promotion.refreshingQuote')
  const loyaltyTitle = t('loyalty.title')
  const orderSummaryTitle = t('summary.title')
  const quoteRequiredLabel = t('summary.quoteRequired')
  const totalLabel = t('summary.total')
  const removeCouponLabel = t('promotion.removeCoupon')
  const noRedemptionLabel = t('loyalty.noRedemption')
  const estimatedDiscountLabel = t('loyalty.estimatedDiscount')
  const placingOrderLabel = t('actions.placingOrder')
  const placeOrderLabel = t('actions.placeOrder')
  const retryLabel = t('actions.retry')
  const appliedPromotionLabel = t('summary.appliedPromotion')
  const subtotalLabel = t('summary.subtotal')
  const promotionDiscountLabel = t('summary.promotionDiscount')
  const shippingLabel = t('summary.shipping')
  const loyaltyDiscountLabel = t('summary.loyaltyDiscount')
  const pointsRedeemableLabel = t('loyalty.pointsRedeemable')
  const saveAsNewLabel = t('address.saveAsNew')
  const reuseMatchedLabel = t('address.reuseMatched')
  const switchToLabel = t('fulfillment.switchTo')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [apartment, setApartment] = useState('')
  const [notes, setNotes] = useState('')
  const [saveAsNewAddress, setSaveAsNewAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState<AddressLabel>('Home')
  const hasPrefilledAddress = useRef(false)

  const deliveryEnabled = checkoutConfig?.fulfillment?.deliveryEnabled !== false
  const pickupEnabled = checkoutConfig?.fulfillment?.branchPickupEnabled !== false
  const fallbackMode: FulfillmentMode = deliveryEnabled ? 'delivery' : 'pickup'

  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>(fallbackMode)
  const allBranches = checkoutConfig?.branches ?? []
  const stockedBranches = allBranches
    .filter((branch) => branch.stockCount > 0)
    .sort((a, b) => {
      const aDistance = typeof a.distanceKm === 'number' ? a.distanceKm : Number.MAX_SAFE_INTEGER
      const bDistance = typeof b.distanceKm === 'number' ? b.distanceKm : Number.MAX_SAFE_INTEGER
      return aDistance - bDistance
    })

  const [selectedBranchId, setSelectedBranchId] = useState<string>(stockedBranches[0]?.id ?? '')
  const selectedBranch = allBranches.find((branch) => branch.id === selectedBranchId) ?? null
  const selectedBranchInStock = Boolean(selectedBranch && selectedBranch.stockCount > 0)
  const suggestedBranch = stockedBranches[0] ?? null

  const codEnabled = checkoutConfig?.paymentMethods?.codEnabled !== false
  const cardOnDeliveryEnabled = checkoutConfig?.paymentMethods?.cardOnDeliveryEnabled !== false
  const onlineCardEnabled = checkoutConfig?.paymentMethods?.onlineCardEnabled !== false

  const availablePaymentMethods = useMemo(() => {
    if (fulfillmentMode === 'pickup') {
      const methods: Array<{ id: CheckoutPaymentMethod; label: string }> = []
      const allowPayAtBranch = selectedBranch?.payAtBranchEnabled !== false
      const allowPayNow = selectedBranch?.payNowEnabled !== false

      if (allowPayAtBranch) {
        methods.push({ id: 'pay_at_branch', label: t('payment.payAtBranch') })
      }
      if (allowPayNow && onlineCardEnabled) {
        methods.push({ id: 'online_card', label: t('payment.payNow') })
      }
      return methods
    }

    const methods: Array<{ id: CheckoutPaymentMethod; label: string }> = []
    if (codEnabled) {
      methods.push({ id: 'cod', label: t('payment.cashOnDelivery') })
    }
    if (cardOnDeliveryEnabled) {
      methods.push({ id: 'card_on_delivery', label: t('payment.cardOnDelivery') })
    }
    if (onlineCardEnabled) {
      methods.push({ id: 'online_card', label: t('payment.onlineCard') })
    }
    return methods
  }, [
    cardOnDeliveryEnabled,
    codEnabled,
    fulfillmentMode,
    onlineCardEnabled,
    selectedBranch?.payAtBranchEnabled,
    selectedBranch?.payNowEnabled,
  ])

  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    availablePaymentMethods[0]?.id ?? 'cod'
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [quote, setQuote] = useState<CheckoutQuoteResponse | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const cartTotals = useMemo(
    () => passThroughPricingService.getCartTotals(items, { shipping: fulfillmentMode === 'delivery' && items.length > 0 ? 5 : 0 }),
    [fulfillmentMode, items]
  )
  const currency = cartTotals.currency
  const subtotal = cartTotals.subtotal

  const selectedRedeemOption = useMemo(
    () =>
      selectedRedeemPercent && loyaltyWallet
        ? loyaltyWallet.redeemOptions.find((option) => option.percent === selectedRedeemPercent) ?? null
        : null,
    [loyaltyWallet, selectedRedeemPercent]
  )

  const estimatedLoyaltyDiscount = useMemo(() => {
    if (!selectedRedeemOption) return 0
    const byPercent = (subtotal * selectedRedeemOption.percent) / 100
    const byPoints = selectedRedeemOption.pointsCost * 0.03
    return Math.round(Math.min(byPercent, byPoints, subtotal) * 100) / 100
  }, [selectedRedeemOption, subtotal])

  const shipping = quote?.totals.shipping ?? (items.length > 0 && fulfillmentMode === 'delivery' ? 5 : 0)
  const promotionDiscount = quote?.totals.discountTotal ?? 0
  const totalBeforeLoyalty = quote?.totals.finalTotal ?? Math.max(0, subtotal + shipping - promotionDiscount)
  const total = Math.max(0, totalBeforeLoyalty - estimatedLoyaltyDiscount)
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency],
  )

  const formatCurrency = (value: number) => currencyFormatter.format(value)

  const hasValidQuote = Boolean(quote?.quoteId && quote?.expiresAt && quoteError == null)
  const canPressPlaceOrder = items.length > 0 && !submitting && !quoteLoading && hasValidQuote

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const saved = window.localStorage.getItem(COUPON_STORAGE_KEY)
    if (saved && saved.trim().length > 0) {
      setCouponCode(saved)
    }
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const value = couponCode.trim()
    if (value.length > 0) {
      window.localStorage.setItem(COUPON_STORAGE_KEY, value)
      return
    }
    window.localStorage.removeItem(COUPON_STORAGE_KEY)
  }, [couponCode])

  useEffect(() => {
    if (!onRequestQuote || items.length === 0) {
      setQuote(null)
      return
    }
    const timeout = setTimeout(() => {
      setQuoteLoading(true)
      setQuoteError(null)
      onRequestQuote({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        fulfillment: {
          mode: fulfillmentMode,
          branchId: fulfillmentMode === 'pickup' ? selectedBranch?.id : undefined,
        },
        couponCode: couponCode.trim() || undefined,
      })
        .then((result) => setQuote(result))
        .catch((cause) => {
          setQuote(null)
          setQuoteError(cause instanceof Error ? cause.message : t('validation.quoteError'))
        })
        .finally(() => setQuoteLoading(false))
    }, 350)

    return () => clearTimeout(timeout)
  }, [couponCode, fulfillmentMode, items, onRequestQuote, selectedBranch?.id])

  useEffect(() => {
    if (hasPrefilledAddress.current) return
    if (!initialAddress) return
    if (city || area || building || floor || apartment || notes) return

    setCity(initialAddress.city ?? '')
    setArea(initialAddress.area ?? '')
    setBuilding(initialAddress.building ?? '')
    setFloor(initialAddress.floor ?? '')
    setApartment(initialAddress.apartment ?? '')
    setNotes(initialAddress.notes ?? '')
    if (initialAddress.label === 'Home' || initialAddress.label === 'Work' || initialAddress.label === 'Other') {
      setAddressLabel(initialAddress.label)
    }
    setSaveAsNewAddress(false)
    hasPrefilledAddress.current = true
  }, [apartment, area, building, city, floor, initialAddress, notes])

  useEffect(() => {
    if (availablePaymentMethods.length === 0) return
    if (availablePaymentMethods.some((method) => method.id === paymentMethod)) return
    const fallbackMethod = availablePaymentMethods[0]
    if (!fallbackMethod) return
    setPaymentMethod(fallbackMethod.id)
  }, [availablePaymentMethods, paymentMethod])

  function getValidationError(): string | null {
    if (items.length === 0) return t('validation.emptyCart')
    if (!fullName.trim()) return t('validation.fullNameRequired')
    if (!phone.trim()) return t('validation.phoneRequired')

    if (fulfillmentMode === 'delivery') {
      if (!city.trim()) return t('validation.cityRequired')
      if (!area.trim()) return t('validation.areaRequired')
      if (!building.trim()) return t('validation.buildingRequired')
    }

    if (fulfillmentMode === 'pickup' && !selectedBranch) {
      return t('fulfillment.selectBranch')
    }
    if (fulfillmentMode === 'pickup' && !selectedBranchInStock) {
      return t('fulfillment.selectedBranchOutOfStock')
    }

    if (availablePaymentMethods.length === 0) {
      return t('validation.noPaymentMethods')
    }
    if (!availablePaymentMethods.some((method) => method.id === paymentMethod)) {
      return t('fulfillment.selectPayment')
    }

    return null
  }

  async function handlePlaceOrder() {
    const validationError = getValidationError()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    const payload: CheckoutPlaceOrderInput = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      contact: {
        fullName: fullName.trim(),
        phone: phone.trim(),
      },
      fulfillment: {
        mode: fulfillmentMode,
        branchId: fulfillmentMode === 'pickup' ? selectedBranch?.id : undefined,
      },
      payment: {
        method: paymentMethod,
      },
      pricingQuoteId: quote?.quoteId ?? '',
      couponCode: couponCode.trim() || undefined,
      address:
        fulfillmentMode === 'delivery'
          ? {
              city: city.trim(),
              area: area.trim(),
              building: building.trim(),
              floor: floor.trim() || undefined,
              apartment: apartment.trim() || undefined,
              notes: notes.trim() || undefined,
            }
          : undefined,
      addressBook:
        fulfillmentMode === 'delivery'
          ? {
              saveAsNew: saveAsNewAddress,
              label: addressLabel,
            }
          : undefined,
      loyalty:
        selectedRedeemOption
          ? {
              redeemPercent: selectedRedeemOption.percent,
            }
          : undefined,
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onPlaceOrder?.(payload)
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : t('validation.placeOrderError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageScaffold variant='checkout' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='lg'>
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 4 }} />
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 3 }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='checkout' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h1'>{loadErrorTitle}</Text>
              <Text tone='muted'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 4 }}>
                <Button variant='outline' onPress={onRetry}>
                  {retryLabel}
                </Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (items.length === 0) {
    return (
      <PageScaffold variant='checkout' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h1'>{emptyTitle}</Text>
              <Text tone='muted'>{emptyMessage}</Text>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  const useFloatingMobileAction = !isDesktop && !isNative

  const content = (
    <PageScaffold variant='checkout' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section y='tight'>
      <Box
        gap='lg'
        style={{
        paddingBottom: !isDesktop ? spacing['96'] : 0,
      }}
    >
      <Text variant='h1'>{checkoutTitle}</Text>
      
      {/* Visual stepper instead of generic pill badges */}
      <CheckoutStepper
        steps={[
          { id: 'step-contact', label: 'Contact' },
          { id: 'step-fulfillment', label: fulfillmentMode === 'pickup' ? 'Pickup' : 'Delivery' },
          { id: 'step-payment', label: 'Payment' },
          { id: 'step-review', label: 'Review' },
        ]}
        currentStep={3} // Review step (0-indexed)
      />

      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'flex-start',
          gap: checkoutTokens.contentGap,
        }}
      >
        <Box style={{ flex: 1, width: '100%' as const, minWidth: isDesktop ? spacing.xxl * 6 : undefined, gap: checkoutTokens.blockGap }}>
          <Card
            variant='raised'
            style={{
              gap: spacing['16'],
              borderWidth: borderWidth.thin,
              borderColor: c.primary,
              backgroundColor: c.brandPrimarySubtle,
            }}
          >
            <Text variant='title'>{contactTitle}</Text>
            <CheckoutInput
              label={fullNameLabel}
              value={fullName}
              onChange={setFullName}
              placeholder={fullNamePlaceholder}
            />
            <CheckoutInput
              label={phoneLabel}
              value={phone}
              onChange={setPhone}
              placeholder={phonePlaceholder}
            />
          </Card>

          {(deliveryEnabled || pickupEnabled) ? (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='title'>{fulfillmentTitle}</Text>
              <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
                {deliveryEnabled ? (
                  <PaymentChip
                    active={fulfillmentMode === 'delivery'}
                    label='Delivery'
                    onPress={() => setFulfillmentMode('delivery')}
                  />
                ) : null}
                {pickupEnabled ? (
                  <PaymentChip
                    active={fulfillmentMode === 'pickup'}
                    label='Branch pickup'
                    onPress={() => setFulfillmentMode('pickup')}
                  />
                ) : null}
              </Box>

              {fulfillmentMode === 'pickup' ? (
                <Box style={{ gap: spacing['12'] }}>
                  {stockedBranches.length === 0 ? (
                    <Text tone='danger'>{noStockedBranchesLabel}</Text>
                  ) : (
                    stockedBranches.map((branch) => (
                      <Button
                        key={branch.id}
                        variant={selectedBranchId === branch.id ? 'solid' : 'outline'}
                        onPress={() => setSelectedBranchId(branch.id)}
                      >
                        {`${branch.name}${typeof branch.distanceKm === 'number' ? ` • ${branch.distanceKm.toFixed(1)} km` : ''}`}
                      </Button>
                    ))
                  )}

                  {!selectedBranchInStock && suggestedBranch ? (
                    <Card tone='subtle' variant='flat' style={{ gap: spacing['8'] }}>
                      <Text tone='danger'>{selectedBranchOutLabel}</Text>
                      <Button variant='outline' onPress={() => setSelectedBranchId(suggestedBranch.id)}>
                        {`Switch to ${suggestedBranch.name}`}
                      </Button>
                    </Card>
                  ) : null}

                  {selectedBranch ? (
                    <Text variant='caption' tone='muted'>
                      {`${selectedBranch.city ?? ''} ${selectedBranch.area ?? ''} ${selectedBranch.building ?? ''}`.trim()}
                    </Text>
                  ) : null}
                </Box>
              ) : null}
            </Card>
          ) : null}

          {fulfillmentMode === 'delivery' ? (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='title'>{deliveryAddressTitle}</Text>
              {savedAddresses.length > 0 ? (
                <Box style={{ gap: spacing['8'] }}>
                  <Text variant='caption' tone='muted'>{savedAddressesLabel}</Text>
                  <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                    {savedAddresses.map((address) => (
                      <Button
                        key={address.id}
                        size='sm'
                        variant='outline'
                        onPress={() => {
                          setCity(address.city)
                          setArea(address.area)
                          setBuilding(address.building)
                          setFloor(address.floor ?? '')
                          setApartment(address.apartment ?? '')
                          if (address.label === 'Home' || address.label === 'Work' || address.label === 'Other') {
                            setAddressLabel(address.label)
                          } else {
                            setAddressLabel('Other')
                          }
                          setSaveAsNewAddress(false)
                        }}
                      >
                        {address.isDefault ? `${address.label} (Default)` : address.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ) : null}

              <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput label={cityLabel} value={city} onChange={setCity} placeholder={cityPlaceholder} />
                </Box>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput label={areaLabel} value={area} onChange={setArea} placeholder={areaPlaceholder} />
                </Box>
              </Box>

              <CheckoutInput
                label={buildingLabel}
                value={building}
                onChange={setBuilding}
                placeholder={buildingPlaceholder}
              />

              <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput label={floorLabel} value={floor} onChange={setFloor} placeholder={floorPlaceholder} />
                </Box>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput
                    label={apartmentLabel}
                    value={apartment}
                    onChange={setApartment}
                    placeholder={apartmentPlaceholder}
                  />
                </Box>
              </Box>

              <CheckoutInput
                label={deliveryNotesLabel}
                value={notes}
                onChange={setNotes}
                placeholder={deliveryNotesPlaceholder}
              />

              <Box style={{ gap: spacing['8'] }}>
                <Text variant='caption' tone='muted'>{addressBookLabel}</Text>
                <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                  {(['Home', 'Work', 'Other'] as AddressLabel[]).map((label) => (
                    <Button
                      key={label}
                      size='sm'
                      variant={addressLabel === label ? 'solid' : 'outline'}
                      onPress={() => setAddressLabel(label)}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
                <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                  <Button
                    size='sm'
                    variant={saveAsNewAddress ? 'solid' : 'outline'}
                    onPress={() => setSaveAsNewAddress(true)}
                  >
                    Save as new
                  </Button>
                  <Button
                    size='sm'
                    variant={saveAsNewAddress ? 'outline' : 'solid'}
                    onPress={() => setSaveAsNewAddress(false)}
                  >
                    Reuse matched/default
                  </Button>
                </Box>
              </Box>
            </Card>
          ) : null}

          <Card variant='raised' style={{ gap: checkoutTokens.blockGap }}>
            <Text variant='title'>{paymentTitle}</Text>
            {availablePaymentMethods.length === 0 ? (
              <Text tone='danger'>{noPaymentMethodsLabel}</Text>
            ) : (
              <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
                {availablePaymentMethods.map((method) => (
                  <PaymentChip
                    key={method.id}
                    active={paymentMethod === method.id}
                    label={method.label}
                    onPress={() => setPaymentMethod(method.id)}
                  />
                ))}
              </Box>
            )}
            <PaymentBadges />
          </Card>

          <Card variant='raised' style={{ gap: checkoutTokens.blockGap }}>
            <Text variant='title'>{promotionTitle}</Text>
            <CheckoutInput
              label={couponLabel}
              value={couponCode}
              onChange={setCouponCode}
              placeholder={couponPlaceholder}
            />
            {couponCode.trim().length > 0 ? (
              <Box style={{ alignItems: 'flex-start' }}>
                <Button size='sm' variant='outline' onPress={() => setCouponCode('')}>
                  {removeCouponLabel}
                </Button>
              </Box>
            ) : null}
            {quoteLoading ? <Text variant='caption' tone='muted'>{refreshingQuoteLabel}</Text> : null}
            {quoteError ? <Text variant='caption' tone='danger'>{quoteError}</Text> : null}
          </Card>

          {loyaltyWallet ? (
            <Card variant='raised' style={{ gap: checkoutTokens.blockGap }}>
              <Text variant='title'>{loyaltyTitle}</Text>
              <Text variant='caption' tone='muted'>
                {`Points: ${loyaltyWallet.points} • Redeemable: ${formatCurrency(loyaltyWallet.redeemableValue)}`}
              </Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                <Button
                  size='sm'
                  variant={!selectedRedeemOption ? 'solid' : 'outline'}
                  onPress={() => onSelectRedeemPercent?.(undefined)}
                >
                  {noRedemptionLabel}
                </Button>
                {loyaltyWallet.redeemOptions.map((option) => (
                  <Button
                    key={option.percent}
                    size='sm'
                    variant={selectedRedeemPercent === option.percent ? 'solid' : 'outline'}
                    onPress={() => onSelectRedeemPercent?.(option.percent)}
                  >
                    {`${option.percent}% (${option.pointsCost} pts)`}
                  </Button>
                ))}
              </Box>
              {selectedRedeemOption ? (
                <Text variant='caption' tone='muted'>
                  {`Estimated discount: ${formatCurrency(estimatedLoyaltyDiscount)}`}
                </Text>
              ) : null}
            </Card>
          ) : null}
        </Box>

        <Box
          style={
            isDesktop
              ? ({
                  width: spacing.xxl * 7,
                  maxWidth: '100%',
                  gap: checkoutTokens.blockGap,
                  position: Platform.OS === 'web' ? ('sticky' as const) : undefined,
                  top: Platform.OS === 'web' ? checkoutTokens.stickyPanelTop : undefined,
                } as any)
              : { width: '100%' as const, maxWidth: '100%' as const, gap: checkoutTokens.blockGap }
          }
        >
          <Card
            variant='raised'
            style={{
              gap: checkoutTokens.summaryGap,
              borderWidth: borderWidth.thin,
              borderColor: c.stroke,
              padding: checkoutTokens.summaryPanelPadding,
            }}
          >
            <Text variant='title'>{orderSummaryTitle}</Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  style={{ position: 'relative', width: spacing['64'], height: spacing['64'] }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: radius.sm,
                        borderWidth: borderWidth.thin,
                        borderColor: c.border,
                        backgroundColor: c.backgroundSecondary,
                      }}
                      {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
                    />
                  ) : (
                    <Box
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: radius.sm,
                        borderWidth: borderWidth.thin,
                        borderColor: c.border,
                        backgroundColor: c.backgroundSecondary,
                      }}
                    />
                  )}
                  {item.quantity > 1 ? (
                    <Box
                      style={{
                        position: 'absolute',
                        top: -spacing['4'],
                        right: -spacing['4'],
                        backgroundColor: c.brandCrimson,
                        borderRadius: radius.full,
                        minWidth: 18,
                        height: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4,
                        borderWidth: 1,
                        borderColor: c.surface,
                      }}
                    >
                      <Text variant='meta' size={9} tone='inverse' weight='700'>
                        {item.quantity}
                      </Text>
                    </Box>
                  ) : null}
                </Box>
              ))}
            </Box>
            <Divider />
            <Box style={{ gap: spacing['8'] }}>
              <SummaryRow label='Subtotal' value={formatCurrency(subtotal)} />
              {promotionDiscount > 0 ? (
                <SummaryRow label='Promotion discount' value={`-${formatCurrency(promotionDiscount)}`} />
              ) : null}
              <SummaryRow label='Shipping' value={formatCurrency(shipping)} />
              {estimatedLoyaltyDiscount > 0 ? (
                <SummaryRow label='Loyalty discount' value={`-${formatCurrency(estimatedLoyaltyDiscount)}`} />
              ) : null}
              <SummaryRow label='Total' value={formatCurrency(total)} emphasis />
            </Box>
            <PaymentBadges />
            {quote?.totals.appliedPromotion ? (
              <Text variant='caption' tone='muted'>
                Applied: {quote.totals.appliedPromotion.name}
                {quote.totals.appliedPromotion.code ? ` (${quote.totals.appliedPromotion.code})` : ''}
              </Text>
            ) : null}
          </Card>

          <Card variant='flat' tone='subtle' style={{ gap: spacing['8'], borderWidth: borderWidth.thin, borderColor: c.border }}>
            <Text variant='caption' tone='muted'>{notice}</Text>
          </Card>

          {submitError ? <Text variant='caption' tone='danger'>{submitError}</Text> : null}
          {!hasValidQuote && !quoteLoading ? (
            <Text variant='caption' tone='danger'>{quoteRequiredLabel}</Text>
          ) : null}

          {isDesktop ? (
            <Button disabled={!canPressPlaceOrder} onPress={handlePlaceOrder}>
              {submitting ? placingOrderLabel : placeOrderLabel}
            </Button>
          ) : null}
        </Box>
      </Box>

      {!isDesktop ? (
        <Box
          style={{
            ...(useFloatingMobileAction
              ? {
                  position: 'absolute',
                  start: 0,
                  end: 0,
                  bottom: 0,
                  borderTopWidth: borderWidth.thin,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  paddingHorizontal: spacing.pageX,
                  paddingVertical: checkoutTokens.mobileActionPaddingY,
                }
              : {
                  marginTop: spacing['16'],
                  borderWidth: borderWidth.thin,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing['12'],
                  paddingVertical: checkoutTokens.mobileActionPaddingY,
                }),
          }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['16'] }}>
            <Box style={{ gap: spacing.xxs }}>
              <Text variant='caption' tone='muted'>{totalLabel}</Text>
              <Text variant='h2' tone='danger'>{formatCurrency(total)}</Text>
            </Box>
            <Box style={isCompact ? { flex: 1 } : { minWidth: spacing.xxl * 4 }}>
              <Button disabled={!canPressPlaceOrder} onPress={handlePlaceOrder}>
                {submitting ? placingOrderLabel : placeOrderLabel}
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )

  return content
})

function CheckoutInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
}) {
  return (
    <Box style={{ gap: spacing['8'] }}>
      <Text variant='label'>{label}</Text>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        invalid={Boolean(error)}
        style={{ width: '100%' as any }}
      />
      {error ? <Text variant='caption' tone='danger'>{error}</Text> : null}
    </Box>
  )
}

function PaymentChip({
  active,
  label,
  onPress,
}: {
  active: boolean
  label: string
  onPress: () => void
}) {
  return (
    <Button variant={active ? 'solid' : 'outline'} size='sm' onPress={onPress}>
      {label}
    </Button>
  )
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant={emphasis ? 'title' : 'bodySm'} tone={emphasis ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={emphasis ? 'title' : 'label'}>{value}</Text>
    </Box>
  )
}
