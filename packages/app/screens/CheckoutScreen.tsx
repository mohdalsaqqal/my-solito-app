import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Platform, useWindowDimensions } from 'react-native'
import {
  AccountAddress,
  CheckoutPlaceOrderInput,
  CheckoutQuoteInput,
  CheckoutQuoteResponse,
  LoyaltyWallet,
} from '@real/app/lib/types'
import { borderWidth, breakpoints, colors, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Divider, Input, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'
import { passThroughPricingService } from '@real/app/lib/pricing'

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

export function CheckoutScreen({
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
  const { width } = useWindowDimensions()
  const isNative = Platform.OS !== 'web'
  const isDesktop = !isNative && (width >= breakpoints.desktopMin || width === 0)
  const isCompact = width > 0 && width < breakpoints.tabletMin

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
        methods.push({ id: 'pay_at_branch', label: 'Pay at branch' })
      }
      if (allowPayNow && onlineCardEnabled) {
        methods.push({ id: 'online_card', label: 'Pay now (online card)' })
      }
      return methods
    }

    const methods: Array<{ id: CheckoutPaymentMethod; label: string }> = []
    if (codEnabled) {
      methods.push({ id: 'cod', label: 'Cash on delivery' })
    }
    if (cardOnDeliveryEnabled) {
      methods.push({ id: 'card_on_delivery', label: 'Card on delivery (POS)' })
    }
    if (onlineCardEnabled) {
      methods.push({ id: 'online_card', label: 'Online card' })
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const hasValidQuote = Boolean(quote?.quoteId && quote?.expiresAt && quoteError == null)
  const canPressPlaceOrder = items.length > 0 && !submitting && !quoteLoading && hasValidQuote

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
          setQuoteError(cause instanceof Error ? cause.message : 'Unable to create pricing quote.')
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
    if (items.length === 0) return 'Your cart is empty.'
    if (!fullName.trim()) return 'Full name is required.'
    if (!phone.trim()) return 'Phone is required.'

    if (fulfillmentMode === 'delivery') {
      if (!city.trim()) return 'City is required for delivery.'
      if (!area.trim()) return 'Area is required for delivery.'
      if (!building.trim()) return 'Building is required for delivery.'
    }

    if (fulfillmentMode === 'pickup' && !selectedBranch) {
      return 'Please select a pickup branch.'
    }
    if (fulfillmentMode === 'pickup' && !selectedBranchInStock) {
      return 'Selected branch is out of stock. Choose another branch.'
    }

    if (availablePaymentMethods.length === 0) {
      return 'No payment methods are available.'
    }
    if (!availablePaymentMethods.some((method) => method.id === paymentMethod)) {
      return 'Please select a payment method.'
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
      setSubmitError(cause instanceof Error ? cause.message : 'Unable to place order right now.')
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
              <Text variant='h2'>Unable to load checkout</Text>
              <Text tone='muted'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 4 }}>
                <Button variant='outline' onPress={onRetry}>
                  Retry
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
              <Text variant='h2'>Your cart is empty</Text>
              <Text tone='muted'>Add products before checkout.</Text>
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
      <Text variant='h2'>Checkout</Text>

      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'flex-start',
          gap: spacing['24'],
        }}
      >
        <Box style={{ flex: 1, width: '100%' as const, minWidth: isDesktop ? spacing.xxl * 6 : undefined, gap: spacing['16'] }}>
          <Card
            variant='raised'
            style={{
              gap: spacing['16'],
              borderWidth: borderWidth.thin,
              borderColor: colors.primary,
              backgroundColor: colors.brandPrimarySubtle,
            }}
          >
            <Text variant='title'>Contact</Text>
            <CheckoutInput
              label='Full name'
              value={fullName}
              onChange={setFullName}
              placeholder='Your full name'
            />
            <CheckoutInput
              label='Phone'
              value={phone}
              onChange={setPhone}
              placeholder='Phone number'
            />
          </Card>

          {(deliveryEnabled || pickupEnabled) ? (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='title'>Fulfillment</Text>
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
                    <Text tone='danger'>No stocked branches are available right now.</Text>
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
                      <Text tone='danger'>Selected branch is no longer in stock.</Text>
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
              <Text variant='title'>Delivery address</Text>
              {savedAddresses.length > 0 ? (
                <Box style={{ gap: spacing['8'] }}>
                  <Text variant='caption' tone='muted'>Saved addresses</Text>
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
                  <CheckoutInput label='City' value={city} onChange={setCity} placeholder='City' />
                </Box>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput label='Area' value={area} onChange={setArea} placeholder='Area' />
                </Box>
              </Box>

              <CheckoutInput
                label='Building'
                value={building}
                onChange={setBuilding}
                placeholder='Building and street'
              />

              <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput label='Floor (optional)' value={floor} onChange={setFloor} placeholder='Floor' />
                </Box>
                <Box style={{ flex: 1, minWidth: isCompact ? undefined : spacing.xxl * 3 }}>
                  <CheckoutInput
                    label='Apartment (optional)'
                    value={apartment}
                    onChange={setApartment}
                    placeholder='Apartment'
                  />
                </Box>
              </Box>

              <CheckoutInput
                label='Delivery notes (optional)'
                value={notes}
                onChange={setNotes}
                placeholder='Any instructions for delivery'
              />

              <Box style={{ gap: spacing['8'] }}>
                <Text variant='caption' tone='muted'>Address book</Text>
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

          <Card variant='raised' style={{ gap: spacing['16'] }}>
            <Text variant='title'>Payment</Text>
            {availablePaymentMethods.length === 0 ? (
              <Text tone='danger'>No payment methods are currently available for this fulfillment mode.</Text>
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
          </Card>

          <Card variant='raised' style={{ gap: spacing['16'] }}>
            <Text variant='title'>Promotion code</Text>
            <CheckoutInput
              label='Coupon code (optional)'
              value={couponCode}
              onChange={setCouponCode}
              placeholder='Enter coupon code'
            />
            {quoteLoading ? <Text variant='caption' tone='muted'>Refreshing quote...</Text> : null}
            {quoteError ? <Text variant='caption' tone='danger'>{quoteError}</Text> : null}
          </Card>

          {loyaltyWallet ? (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='title'>Loyalty redemption</Text>
              <Text variant='caption' tone='muted'>
                {`Points: ${loyaltyWallet.points} • Redeemable: ${formatCurrency(loyaltyWallet.redeemableValue)}`}
              </Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                <Button
                  size='sm'
                  variant={!selectedRedeemOption ? 'solid' : 'outline'}
                  onPress={() => onSelectRedeemPercent?.(undefined)}
                >
                  No redemption
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

        <Box style={{ width: isDesktop ? spacing.xxl * 7 : '100%', maxWidth: '100%' as const, gap: spacing['16'] }}>
          <Card
            variant='raised'
            style={{
              gap: spacing['16'],
              borderWidth: borderWidth.thin,
              borderColor: colors.primary,
            }}
          >
            <Text variant='title'>Order summary</Text>
            <Box style={{ gap: spacing['12'] }}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing['12'], paddingEnd: spacing['16'] }}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{
                          width: spacing['48'],
                          height: spacing['48'],
                          borderRadius: radius.xs,
                          borderWidth: borderWidth.thin,
                          borderColor: colors.border,
                          backgroundColor: colors.backgroundSecondary,
                        }}
                      />
                    ) : (
                      <Box
                        style={{
                          width: spacing['48'],
                          height: spacing['48'],
                          borderRadius: radius.xs,
                          borderWidth: borderWidth.thin,
                          borderColor: colors.border,
                          backgroundColor: colors.backgroundSecondary,
                        }}
                      />
                    )}
                    <Box style={{ flex: 1 }}>
                      <Text variant='bodySm' numberOfLines={1}>{item.name}</Text>
                      <Text variant='caption' tone='muted'>Qty {item.quantity}</Text>
                    </Box>
                  </Box>
                  <Text variant='price' tone='danger'>
                    {formatCurrency(passThroughPricingService.getProductPrice(item, { quantity: item.quantity }).subtotal ?? 0)}
                  </Text>
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
            {quote?.totals.appliedPromotion ? (
              <Text variant='caption' tone='muted'>
                Applied: {quote.totals.appliedPromotion.name}
                {quote.totals.appliedPromotion.code ? ` (${quote.totals.appliedPromotion.code})` : ''}
              </Text>
            ) : null}
          </Card>

          <Card variant='flat' tone='subtle' style={{ gap: spacing['8'], borderWidth: borderWidth.thin, borderColor: colors.border }}>
            <Text variant='caption' tone='muted'>{notice}</Text>
          </Card>

          {submitError ? <Text variant='caption' tone='danger'>{submitError}</Text> : null}
          {!hasValidQuote && !quoteLoading ? (
            <Text variant='caption' tone='danger'>Checkout quote is required. Refresh quote before placing order.</Text>
          ) : null}

          {isDesktop ? (
            <Button disabled={!canPressPlaceOrder} onPress={handlePlaceOrder}>
              {submitting ? 'Placing order...' : 'Place order'}
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
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.pageX,
                  paddingVertical: spacing['8'],
                }
              : {
                  marginTop: spacing['16'],
                  borderWidth: borderWidth.thin,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing['12'],
                  paddingVertical: spacing['12'],
                }),
          }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['16'] }}>
            <Box style={{ gap: spacing.xxs }}>
              <Text variant='caption' tone='muted'>Total</Text>
              <Text variant='h2' tone='danger'>{formatCurrency(total)}</Text>
            </Box>
            <Box style={isCompact ? { flex: 1 } : { minWidth: spacing.xxl * 4 }}>
              <Button disabled={!canPressPlaceOrder} onPress={handlePlaceOrder}>
                {submitting ? 'Placing order...' : 'Place order'}
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
}

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
