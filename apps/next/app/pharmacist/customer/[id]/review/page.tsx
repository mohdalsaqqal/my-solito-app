'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWindowDimensions } from 'react-native'
import { spacing } from '@real/tokens'
import { breakpoints } from '@real/tokens'
import { Button, Card } from '@real/ui/components'
import { Box, Text } from '@real/ui/primitives'
import { PharmacistConsultationInput } from '@real/providers/contracts'
import { apiClient } from '../../../../apiClient'
import { PharmacistRouteShell } from '../../../_components/PharmacistRouteShell'

type RecommendationItem = {
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

export default function PharmacistReviewPage() {
  const params = useParams<{ id: string }>()
  const customerId = String(params.id ?? '')
  const router = useRouter()
  const storageKey = `pharmacist-draft-${customerId}`
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const [draft, setDraft] = useState<PersistedDraft | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) {
      setDraft(null)
      return
    }
    try {
      setDraft(JSON.parse(raw) as PersistedDraft)
    } catch {
      setDraft(null)
    }
  }, [storageKey])

  const testType = useMemo(
    () => draft?.input.metrics.find((metric) => metric.id === 'test_type')?.value ?? 'N/A',
    [draft]
  )
  const canSubmit = Boolean(draft && draft.products.length > 0)

  function persistDraft(nextDraft: PersistedDraft | null) {
    if (typeof window === 'undefined') return
    if (!nextDraft) {
      window.sessionStorage.removeItem(storageKey)
      return
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextDraft))
  }

  function handleRemoveProductAt(indexToRemove: number) {
    setDraft((current) => {
      if (!current) return current
      const remainingProducts = current.products.filter((_, index) => index !== indexToRemove)
      const remainingProductIds = Array.from(
        new Set(
          remainingProducts
            .map((item) => (typeof item.productId === 'string' ? item.productId.trim() : ''))
            .filter((item) => item.length > 0)
        )
      )
      const nextDraft: PersistedDraft = {
        ...current,
        input: {
          ...current.input,
          recommendedProductIds: remainingProductIds,
        },
        products: remainingProducts,
      }
      persistDraft(nextDraft)
      return nextDraft
    })
  }

  async function handleSubmit() {
    if (!draft) {
      setError('No draft found. Go back and create the test form first.')
      return
    }
    if (draft.products.length === 0) {
      setError('Add at least one recommended product before submitting.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await apiClient.pharmacist.submit(draft.input)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(storageKey)
      }
      router.push(`/pharmacist/customer/${customerId}?submitted=1`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit consultation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PharmacistRouteShell
      title='Step 4: Review and Submit'
      subtitle='Confirm details before final submission.'
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
          <Text variant='title'>Review Summary</Text>
          <Box style={isCompact ? undefined : { width: '100%', maxWidth: spacing['128'] }}>
            <Button size='sm' variant='outline' onPress={() => router.push(`/pharmacist/customer/${customerId}/new-test`)}>
              Back to edit
            </Button>
          </Box>
        </Box>

        {!draft ? (
          <Text tone='muted'>No draft available. Create a new test first.</Text>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='label'>{draft.input.title}</Text>
            <Text tone='muted'>Type: {testType}</Text>
            <Text tone='muted'>{draft.input.summary}</Text>
            {draft.input.notes ? <Text tone='muted' variant='bodySm'>{draft.input.notes}</Text> : null}
            <Box style={{ gap: spacing['4'] }}>
              {draft.input.metrics
                .filter((metric) => metric.id !== 'test_type')
                .map((metric) => (
                  <Text key={metric.id} variant='caption' tone='muted'>
                    {metric.label}: {metric.value}
                  </Text>
                ))}
            </Box>

            <Text variant='title'>Recommended products</Text>
            <Box style={{ gap: spacing['8'] }}>
              {draft.products.length === 0 ? (
                <Text tone='muted' variant='caption'>No recommended products left. Go back and add products.</Text>
              ) : (
                draft.products.map((item, index) => (
                  <Card key={`${item.productId || 'missing-id'}::${item.name}::${index}`} tone='subtle' style={{ gap: spacing['4'] }}>
                    <Text variant='label'>{item.brand ? `${item.brand} - ${item.name}` : item.name}</Text>
                    <Text variant='caption' tone='muted'>{item.currency} {item.price.toFixed(2)}</Text>
                    <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
                      <Button size='sm' variant='outline' onPress={() => handleRemoveProductAt(index)}>
                        Remove
                      </Button>
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        )}

        {error ? <Text tone='danger'>{error}</Text> : null}

        <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
          <Button onPress={() => void handleSubmit()} disabled={!canSubmit || submitting}>
            {submitting ? 'Submitting...' : 'Submit consultation'}
          </Button>
        </Box>
      </Card>
    </PharmacistRouteShell>
  )
}
