'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { spacing } from '@real/tokens'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import { Button as ReusableButton } from '@real/ui/reusables/button'
import { useBreakpoint } from '@real/ui/responsive'
import { PharmacistConsultationInput } from '@real/providers/contracts'
import { apiClient } from '../../../../apiClient'
import { PharmacistRouteShell } from '../../../_components/PharmacistRouteShell'
import type { AuthSession } from '@real/providers/contracts'
import type { CMSHome } from '@real/app/lib/types'

type TestType = 'skin' | 'hair'

type RecommendationItem = {
  id?: string
  productId: string
  brand?: string
  name: string
  price: number
  currency: string
}

type PersistedDraft = {
  input: PharmacistConsultationInput
  products: RecommendationItem[]
}

const pharmacistNewTestCopy = {
  consultationFormTitle: 'Consultation Form',
  titlePlaceholder: 'Test title',
  summaryPlaceholder: 'Test result summary',
  notesPlaceholder: 'Notes (optional)',
  hydrationPlaceholder: 'Hydration value',
  sensitivityPlaceholder: 'Sensitivity value',
  recommendationsTitle: 'Recommendations & Stock',
  productSearchPlaceholder: 'Live search products by name or brand',
  noProductsLoaded: 'No products loaded yet.',
}

function getRecommendationSelectionKey(product: RecommendationItem, index: number): string {
  const baseId =
    normalizeProductId(product.productId) || normalizeProductId(product.id) || 'missing-id'
  return `${baseId}::${product.name}::${index}`
}

function normalizeProductId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveRecommendationId(product: RecommendationItem): string {
  const fromProductId = normalizeProductId(product.productId)
  if (fromProductId.length > 0) return fromProductId
  return normalizeProductId(product.id)
}

type PharmacistNewTestPageClientProps = {
  session: AuthSession | null
  cmsHome: CMSHome | null
}

export default function PharmacistNewTestPageClient({ session, cmsHome }: PharmacistNewTestPageClientProps) {
  const params = useParams<{ id: string }>()
  const customerId = String(params.id ?? '')
  const router = useRouter()
  const storageKey = `pharmacist-draft-${customerId}`
  const profile = useBreakpoint()
  const isCompact = profile.breakpoint === 'mobile'

  const [testType, setTestType] = useState<TestType>('skin')
  const [titleValue, setTitleValue] = useState('')
  const [summaryValue, setSummaryValue] = useState('')
  const [notesValue, setNotesValue] = useState('')
  const [hydrationValue, setHydrationValue] = useState('')
  const [sensitivityValue, setSensitivityValue] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<RecommendationItem[]>([])
  const [selectedProductKeys, setSelectedProductKeys] = useState<string[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as PersistedDraft
      setTitleValue(parsed.input.title ?? '')
      setSummaryValue(parsed.input.summary ?? '')
      setNotesValue(parsed.input.notes ?? '')
      const hydrationMetric = parsed.input.metrics.find((metric) => metric.id === 'hydration')
      const sensitivityMetric = parsed.input.metrics.find((metric) => metric.id === 'sensitivity')
      const typeMetric = parsed.input.metrics.find((metric) => metric.id === 'test_type')
      setHydrationValue(hydrationMetric?.value ?? '')
      setSensitivityValue(sensitivityMetric?.value ?? '')
      if (typeMetric?.value === 'hair' || typeMetric?.value === 'skin') {
        setTestType(typeMetric.value)
      }
      const restoredProducts = parsed.products ?? []
      setProductResults(restoredProducts)
      const selectedIds = new Set(parsed.input.recommendedProductIds ?? [])
      setSelectedProductKeys(
        restoredProducts
          .map((product, index) => ({
            key: getRecommendationSelectionKey(product, index),
            selected: selectedIds.has(resolveRecommendationId(product)),
          }))
          .filter((item) => item.selected)
          .map((item) => item.key)
      )
    } catch {
      // ignore bad cache
    }
  }, [storageKey])

  const selectedProducts = useMemo(
    () =>
      productResults.filter((item, index) =>
        selectedProductKeys.includes(getRecommendationSelectionKey(item, index))
      ),
    [productResults, selectedProductKeys]
  )

  const canReview =
    titleValue.trim().length > 0 &&
    summaryValue.trim().length > 0 &&
    selectedProductKeys.length > 0

  const toggleProduct = (productKey: string) => {
    setSelectedProductKeys((current) =>
      current.includes(productKey)
        ? current.filter((existingKey) => existingKey !== productKey)
        : [...current, productKey]
    )
  }

  async function handleFindProducts() {
    setError(null)
    setSearchingProducts(true)
    try {
      const next = await apiClient.pharmacist.searchProducts(productQuery)
      setProductResults(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to search products.')
      setProductResults([])
    } finally {
      setSearchingProducts(false)
    }
  }

  async function handleReview() {
    if (!canReview) {
      setError('Add title, summary, and at least one recommended product.')
      return
    }
    const input: PharmacistConsultationInput = {
      customerId,
      templateType: testType,
      title: titleValue.trim(),
      summary: summaryValue.trim(),
      notes: notesValue.trim(),
      metrics: [
        { id: 'test_type', label: 'Test Type', value: testType },
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
    setError(null)
    setWorking(true)
    try {
      if (typeof window !== 'undefined') {
        const payload: PersistedDraft = { input, products: selectedProducts }
        window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
      }
      router.push(`/pharmacist/customer/${customerId}/review`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to prepare review.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <PharmacistRouteShell
      session={session}
      cmsHome={cmsHome}
      title='Step 3: Create New Test'
      subtitle='Choose test type, enter results, and add recommended products.'
    >
      <Card variant='flat' style={{ gap: spacing['12'] }}>
        <Box
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isCompact ? 'stretch' : 'center',
            gap: spacing['8'],
            flexWrap: 'wrap',
          }}
        >
          <Text variant='title'>{pharmacistNewTestCopy.consultationFormTitle}</Text>
          <Box style={isCompact ? undefined : { width: '100%', maxWidth: spacing['128'] }}>
            <Button size='sm' variant='outline' onPress={() => router.push(`/pharmacist/customer/${customerId}`)}>
              Back
            </Button>
          </Box>
        </Box>

        <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Button
            size='sm'
            variant={testType === 'skin' ? 'solid' : 'outline'}
            onPress={() => setTestType('skin')}
          >
            Skin test
          </Button>
          <Button
            size='sm'
            variant={testType === 'hair' ? 'solid' : 'outline'}
            onPress={() => setTestType('hair')}
          >
            Hair test
          </Button>
        </Box>

        <Input value={titleValue} onChangeText={setTitleValue} placeholder={pharmacistNewTestCopy.titlePlaceholder} />
        <Input value={summaryValue} onChangeText={setSummaryValue} placeholder={pharmacistNewTestCopy.summaryPlaceholder} />
        <Input value={notesValue} onChangeText={setNotesValue} placeholder={pharmacistNewTestCopy.notesPlaceholder} />
        <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Box style={{ flex: 1 }}>
            <Input value={hydrationValue} onChangeText={setHydrationValue} placeholder={pharmacistNewTestCopy.hydrationPlaceholder} />
          </Box>
          <Box style={{ flex: 1 }}>
            <Input value={sensitivityValue} onChangeText={setSensitivityValue} placeholder={pharmacistNewTestCopy.sensitivityPlaceholder} />
          </Box>
        </Box>

        <Text variant='title'>{pharmacistNewTestCopy.recommendationsTitle}</Text>
        <Box
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            gap: spacing['8'],
            alignItems: isCompact ? 'stretch' : 'center',
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ flex: 1, minWidth: spacing['128'] }}>
            <Input
              value={productQuery}
              onChangeText={setProductQuery}
              placeholder={pharmacistNewTestCopy.productSearchPlaceholder}
            />
          </Box>
          <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
            <Button variant='outline' onPress={() => void handleFindProducts()}>
              {searchingProducts ? 'Searching...' : 'Find'}
            </Button>
          </Box>
        </Box>

        {productResults.length === 0 ? (
          <Text tone='muted' variant='caption'>{pharmacistNewTestCopy.noProductsLoaded}</Text>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            {productResults.map((product, index) => {
              const productKey = getRecommendationSelectionKey(product, index)
              const selected = selectedProductKeys.includes(productKey)
              return (
                <ReusableButton key={productKey} onPress={() => toggleProduct(productKey)} variant='ghost' size='default'>
                  <Card tone='subtle' style={{ gap: spacing['4'] }}>
                    <Text variant='label'>{product.brand ? `${product.brand} - ${product.name}` : product.name}</Text>
                    <Text variant='caption' tone='muted'>{product.currency} {product.price.toFixed(2)}</Text>
                    <Text variant='caption' tone={selected ? 'primary' : 'muted'}>
                      {selected ? 'Selected' : 'Tap to select'}
                    </Text>
                  </Card>
                </ReusableButton>
              )
            })}
          </Box>
        )}

        {error ? <Text tone='danger'>{error}</Text> : null}

        <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
          <Button onPress={() => void handleReview()} disabled={!canReview || working}>
            {working ? 'Working...' : 'Review summary'}
          </Button>
        </Box>
      </Card>
    </PharmacistRouteShell>
  )
}
