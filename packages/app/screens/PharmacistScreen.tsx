import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { spacing } from '@real/tokens'
import { breakpoints } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import {
  PharmacistConsultationDraft,
  PharmacistConsultationInput,
  PharmacistCustomerProfile,
  PharmacistCustomerSummary,
} from '@real/app/lib/types'

type PharmacistScreenProps = {
  title?: string
  notice?: string
  operatorName?: string
  operatorEmail?: string
  signingOut?: boolean
  onSignOut?: () => void | Promise<void>
  labels?: {
    search: string
    consultation: string
    recommendations: string
  }
  onSearchCustomers: (query: string) => Promise<PharmacistCustomerSummary[]>
  onResolveQr: (qrCode: string) => Promise<PharmacistCustomerProfile>
  onLoadCustomer: (customerId: string) => Promise<PharmacistCustomerProfile>
  onSearchProducts: (query: string) => Promise<PharmacistConsultationDraft['recommendedProducts']>
  onCreateDraft: (input: PharmacistConsultationInput) => Promise<PharmacistConsultationDraft>
  onSubmitConsultation: (input: PharmacistConsultationInput) => Promise<void>
}

type SearchRecommendationItem = PharmacistConsultationDraft['recommendedProducts'][number] & {
  id?: string
}

function getRecommendationSelectionKey(
  product: SearchRecommendationItem,
  index: number
): string {
  const baseId =
    normalizeProductId(product.productId) || normalizeProductId(product.id) || 'missing-id'
  return `${baseId}::${product.name}::${index}`
}

function normalizeProductId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveRecommendationId(product: SearchRecommendationItem): string {
  const fromProductId = normalizeProductId(product.productId)
  if (fromProductId.length > 0) return fromProductId
  return normalizeProductId(product.id)
}

export const PharmacistScreen = React.memo(function PharmacistScreen({
  title = 'Pharmacist Console',
  notice = 'Only dermatologist-approved products can be marked as clinical recommendations.',
  operatorName = '',
  operatorEmail = '',
  signingOut = false,
  onSignOut,
  labels = {
    search: 'Search or Scan',
    consultation: 'Consultation Form',
    recommendations: 'Recommendations & Stock',
  },
  onSearchCustomers,
  onResolveQr,
  onLoadCustomer,
  onSearchProducts,
  onCreateDraft,
  onSubmitConsultation,
}: PharmacistScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const [query, setQuery] = useState('')
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [customers, setCustomers] = useState<PharmacistCustomerSummary[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<PharmacistCustomerProfile | null>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<SearchRecommendationItem[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [summaryValue, setSummaryValue] = useState('')
  const [notesValue, setNotesValue] = useState('')
  const [hydrationValue, setHydrationValue] = useState('')
  const [sensitivityValue, setSensitivityValue] = useState('')
  const [selectedProductKeys, setSelectedProductKeys] = useState<string[]>([])
  const [draft, setDraft] = useState<PharmacistConsultationDraft | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [scanningQr, setScanningQr] = useState(false)
  const qrScanSessionRef = useRef<{ stop: () => void } | null>(null)

  const selectedProducts = useMemo(
    () =>
      productResults.filter((item, index) =>
        selectedProductKeys.includes(getRecommendationSelectionKey(item, index))
      ),
    [productResults, selectedProductKeys]
  )

  const canDraft =
    Boolean(selectedCustomer?.customer.userId) &&
    titleValue.trim().length > 0 &&
    summaryValue.trim().length > 0 &&
    selectedProductKeys.length > 0

  const buildInput = (): PharmacistConsultationInput | null => {
    if (!selectedCustomer?.customer.userId) return null
    return {
      customerId: selectedCustomer.customer.userId,
      title: titleValue,
      summary: summaryValue,
      notes: notesValue,
      metrics: [
        { id: 'hydration', label: 'Hydration', value: hydrationValue.trim() || 'Not provided' },
        { id: 'sensitivity', label: 'Sensitivity', value: sensitivityValue.trim() || 'Not provided' },
      ],
      recommendedProductIds: Array.from(
        new Set(
          selectedProducts
            .map((product) => resolveRecommendationId(product))
            .filter((productId) => productId.length > 0)
        )
      ),
    }
  }

  useEffect(() => {
    return () => {
      qrScanSessionRef.current?.stop()
      qrScanSessionRef.current = null
    }
  }, [])

  const searchCustomersByValue = async (value: string) => {
    setError(null)
    setSuccess(null)
    setSearchingCustomers(true)
    try {
      const next = await onSearchCustomers(value)
      setCustomers(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to search customers.')
      setCustomers([])
    } finally {
      setSearchingCustomers(false)
    }
  }

  const handleCustomerSearch = async () => {
    await searchCustomersByValue(query)
  }

  const stopQrScan = () => {
    qrScanSessionRef.current?.stop()
    qrScanSessionRef.current = null
    setScanningQr(false)
  }

  const handleStartQrScan = async () => {
    setError(null)
    setSuccess(null)
    const root = globalThis as any
    const isWeb = typeof root.document !== 'undefined'
    if (!isWeb) {
      setError('QR camera scan is available on web in this build.')
      return
    }

    if (scanningQr) {
      stopQrScan()
      return
    }

    const nav = root.navigator as any
    if (!root.isSecureContext) {
      setError('Camera scan requires a secure context. Use HTTPS or open on http://localhost.')
      return
    }
    if (!nav?.mediaDevices?.getUserMedia) {
      setError('Camera scan is not supported in this browser.')
      return
    }

    try {
      setScanningQr(true)
      let stream: MediaStream | null = null
      try {
        stream = await nav.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
      } catch {
        // Fallback for desktop webcams/browsers that don't support facingMode constraints.
        stream = await nav.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      const video = root.document.createElement('video')
      video.setAttribute('playsinline', 'true')
      video.muted = true
      video.srcObject = stream
      await video.play()

      const BarcodeDetectorCtor = root.BarcodeDetector
      const detector = BarcodeDetectorCtor
        ? new BarcodeDetectorCtor({ formats: ['qr_code'] })
        : null
      let jsQrDecode: ((data: Uint8ClampedArray, width: number, height: number) => { data?: string } | null) | null = null
      let canvas: HTMLCanvasElement | null = null
      let context: CanvasRenderingContext2D | null = null

      if (!detector) {
        const jsQrModule = await import('jsqr')
        jsQrDecode = jsQrModule.default
        canvas = root.document.createElement('canvas')
        context = canvas.getContext('2d')
      }

      let rafId: number | null = null
      let active = true
      const scanFrame = async () => {
        if (!active) return
        try {
          let value = ''
          if (detector) {
            const results = await detector.detect(video)
            value = String(results?.[0]?.rawValue ?? '').trim()
          } else if (jsQrDecode && canvas && context) {
            const width = video.videoWidth
            const height = video.videoHeight
            if (width > 0 && height > 0) {
              canvas.width = width
              canvas.height = height
              context.drawImage(video, 0, 0, width, height)
              const imageData = context.getImageData(0, 0, width, height)
              const qrResult = jsQrDecode(imageData.data, width, height)
              value = String(qrResult?.data ?? '').trim()
            }
          }

          if (value) {
            setQuery(value)
            try {
              const profile = await onResolveQr(value)
              setSelectedCustomer(profile)
              setCustomers([profile.customer])
            } catch {
              await searchCustomersByValue(value)
            }
            stopQrScan()
            return
          }
        } catch {
          // Continue scanning silently to keep flow uninterrupted.
        }
        rafId = root.requestAnimationFrame(scanFrame)
      }

      qrScanSessionRef.current = {
        stop: () => {
          active = false
          if (rafId !== null) {
            root.cancelAnimationFrame(rafId)
          }
          const tracks = stream.getTracks?.() ?? []
          tracks.forEach((track: any) => track.stop?.())
          try {
            video.pause?.()
            video.srcObject = null
          } catch {
            // no-op
          }
        },
      }

      rafId = root.requestAnimationFrame(scanFrame)
    } catch (cause) {
      stopQrScan()
      setError(cause instanceof Error ? cause.message : 'Unable to start camera scan.')
    }
  }

  const handleSelectCustomer = async (customerId: string) => {
    setError(null)
    setSuccess(null)
    setLoadingCustomer(true)
    try {
      const profile = await onLoadCustomer(customerId)
      setSelectedCustomer(profile)
      setDraft(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load customer profile.')
      setSelectedCustomer(null)
    } finally {
      setLoadingCustomer(false)
    }
  }

  const handleProductSearch = async () => {
    setError(null)
    setSearchingProducts(true)
    try {
      const next = await onSearchProducts(productQuery)
      setProductResults(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to search products.')
      setProductResults([])
    } finally {
      setSearchingProducts(false)
    }
  }

  const handleCreateDraft = async () => {
    const input = buildInput()
    if (!input) {
      setError('Please select a customer first.')
      return
    }
    setError(null)
    setSuccess(null)
    setWorking(true)
    try {
      const next = await onCreateDraft(input)
      setDraft(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create draft.')
      setDraft(null)
    } finally {
      setWorking(false)
    }
  }

  const handleSubmit = async () => {
    const input = buildInput()
    if (!input) {
      setError('Please select a customer first.')
      return
    }
    setError(null)
    setSuccess(null)
    setWorking(true)
    try {
      await onSubmitConsultation(input)
      setSuccess('Consultation was submitted successfully.')
      setDraft(null)
      const refreshed = await onLoadCustomer(input.customerId)
      setSelectedCustomer(refreshed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit consultation.')
    } finally {
      setWorking(false)
    }
  }

  const toggleProduct = (productKey: string) => {
    setSelectedProductKeys((current) =>
      current.includes(productKey)
        ? current.filter((existingKey) => existingKey !== productKey)
        : [...current, productKey]
    )
  }

  return (
    <PageScaffold variant='dashboard' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='24'>
      <Card variant='raised' style={{ gap: spacing['8'] }}>
        <Box
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isCompact ? 'stretch' : 'center',
            gap: spacing['8'],
          }}
        >
          <Box style={{ gap: spacing['4'], flex: 1 }}>
            <Text variant='h1'>{title}</Text>
            <Text tone='muted'>{notice}</Text>
            {operatorName ? (
              <Text tone='muted' variant='caption'>
                Signed in as {operatorName}{operatorEmail ? ` (${operatorEmail})` : ''}
              </Text>
            ) : null}
          </Box>
          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button size='sm' variant='outline' onPress={() => void onSignOut?.()} disabled={signingOut}>
              {signingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </Box>
        </Box>
      </Card>

      {error ? (
        <Card tone='subtle'>
          <Text tone='danger'>{error}</Text>
        </Card>
      ) : null}

      {success ? (
        <Card tone='subtle'>
          <Text tone='success'>{success}</Text>
        </Card>
      ) : null}

      <Card variant='raised' style={{ gap: spacing['8'] }}>
        <Text variant='title'>{labels.search}</Text>
        <Box
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            gap: spacing['8'],
            alignItems: isCompact ? 'stretch' : 'center',
          }}
        >
          <Box style={{ flex: 1 }}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder='Search by name, email, user ID, or QR code'
              autoCapitalize='none'
            />
          </Box>
          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button onPress={() => void handleCustomerSearch()}>{searchingCustomers ? 'Searching...' : 'Search'}</Button>
          </Box>
          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button variant='outline' onPress={() => void handleStartQrScan()}>
              {scanningQr ? 'Stop scan' : 'Scan QR'}
            </Button>
          </Box>
        </Box>
        {scanningQr ? (
          <Text tone='muted' variant='caption'>Camera scanning in progress. Point to a QR code.</Text>
        ) : null}
        {customers.length === 0 ? (
          <Text tone='muted' variant='caption'>No customer results yet.</Text>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            {customers.map((customer) => (
              <Card key={customer.userId} tone='subtle' style={{ gap: spacing['4'] }}>
                <Text variant='label'>{customer.name}</Text>
                <Text variant='caption' tone='muted'>{customer.email}</Text>
                <Text variant='caption' tone='muted'>QR: {customer.qrCode}</Text>
                <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                  <Button size='sm' variant='outline' onPress={() => void handleSelectCustomer(customer.userId)}>
                    {loadingCustomer && selectedCustomer?.customer.userId === customer.userId ? 'Loading...' : 'Open'}
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Card>

      {selectedCustomer ? (
        <Card variant='raised' style={{ gap: spacing['8'] }}>
          <Text variant='title'>Customer profile</Text>
          <Text variant='label'>{selectedCustomer.customer.name}</Text>
          <Text tone='muted' variant='caption'>
            {selectedCustomer.customer.email} • {selectedCustomer.customer.phone ?? 'No phone'}
          </Text>
          <Text tone='muted' variant='caption'>
            Tests: {selectedCustomer.tests.length} • Last visit:{' '}
            {selectedCustomer.customer.lastTestAt
              ? new Date(selectedCustomer.customer.lastTestAt).toLocaleDateString()
              : 'N/A'}
          </Text>
          <Box style={{ gap: spacing['6'] }}>
            {selectedCustomer.tests.map((test) => (
              <Card key={test.id} tone='subtle' style={{ gap: spacing['4'] }}>
                <Text variant='label'>{test.title}</Text>
                <Text tone='muted' variant='caption'>
                  {new Date(test.createdAt).toLocaleDateString()} • status: {test.status ?? 'completed'}
                </Text>
                <Text tone='muted' variant='caption'>
                  Recommended: {test.recommendedCount} • Purchased: {test.purchasedCount}
                </Text>
              </Card>
            ))}
          </Box>
        </Card>
      ) : null}

      {selectedCustomer ? (
        <Card variant='raised' style={{ gap: spacing['8'] }}>
          <Text variant='title'>{labels.consultation}</Text>
          <Input value={titleValue} onChangeText={setTitleValue} placeholder='Test title' />
          <Input value={summaryValue} onChangeText={setSummaryValue} placeholder='Summary' />
          <Input value={notesValue} onChangeText={setNotesValue} placeholder='Notes (optional)' />
          <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing['8'] }}>
            <Box style={{ flex: 1 }}>
              <Input value={hydrationValue} onChangeText={setHydrationValue} placeholder='Hydration value' />
            </Box>
            <Box style={{ flex: 1 }}>
              <Input value={sensitivityValue} onChangeText={setSensitivityValue} placeholder='Sensitivity value' />
            </Box>
          </Box>

          <Text variant='title'>{labels.recommendations}</Text>
          <Box
            style={{
              flexDirection: isCompact ? 'column' : 'row',
              gap: spacing['8'],
              alignItems: isCompact ? 'stretch' : 'center',
            }}
          >
            <Box style={{ flex: 1 }}>
              <Input
                value={productQuery}
                onChangeText={setProductQuery}
                placeholder='Search products by name or brand'
              />
            </Box>
            <Box style={isCompact ? undefined : { width: spacing['128'] }}>
              <Button variant='outline' onPress={() => void handleProductSearch()}>
                {searchingProducts ? 'Searching...' : 'Find'}
              </Button>
            </Box>
          </Box>

          {productResults.length > 0 ? (
            <Box style={{ gap: spacing['8'] }}>
              {productResults.map((product, index) => {
                const productKey = getRecommendationSelectionKey(product, index)
                const selected = selectedProductKeys.includes(productKey)
                return (
                  <Card key={productKey} tone='subtle' style={{ gap: spacing['4'] }}>
                    <Text variant='label'>{product.brand ? `${product.brand} - ${product.name}` : product.name}</Text>
                    <Text tone='muted' variant='caption'>
                      {product.currency} {product.price.toFixed(2)}
                    </Text>
                    <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                      <Button
                        size='sm'
                        variant={selected ? 'solid' : 'outline'}
                        onPress={() => toggleProduct(productKey)}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </Button>
                    </Box>
                  </Card>
                )
              })}
            </Box>
          ) : (
            <Text tone='muted' variant='caption'>No products loaded yet.</Text>
          )}

          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button disabled={!canDraft || working} onPress={() => void handleCreateDraft()}>
              {working ? 'Working...' : 'Review summary'}
            </Button>
          </Box>
        </Card>
      ) : null}

      {draft ? (
        <Card variant='raised' style={{ gap: spacing['8'] }}>
          <Text variant='title'>Review before submit</Text>
          <Text variant='label'>{draft.title}</Text>
          <Text tone='muted'>{draft.summary}</Text>
          {draft.notes ? <Text tone='muted' variant='bodySm'>{draft.notes}</Text> : null}
          <Box style={{ gap: spacing['4'] }}>
            {draft.metrics.map((metric) => (
              <Text key={metric.id} variant='caption' tone='muted'>
                {metric.label}: {metric.value}
              </Text>
            ))}
          </Box>
          <Box style={{ gap: spacing['6'] }}>
            {selectedProducts.map((item) => (
              <Card key={item.productId} tone='subtle' style={{ gap: spacing['4'] }}>
                <Text variant='label'>{item.brand ? `${item.brand} - ${item.name}` : item.name}</Text>
                <Text tone='muted' variant='caption'>
                  {item.currency} {item.price.toFixed(2)}
                </Text>
              </Card>
            ))}
          </Box>
          <Box style={isCompact ? undefined : { width: spacing['128'] }}>
            <Button disabled={working} onPress={() => void handleSubmit()}>
              {working ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </Card>
      ) : null}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
