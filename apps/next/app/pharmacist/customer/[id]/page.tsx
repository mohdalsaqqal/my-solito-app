'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { spacing } from '@real/tokens'
import { Button, Card } from '@real/ui/components'
import { Box, Text } from '@real/ui/primitives'
import { PharmacistCustomerProfile } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { PharmacistRouteShell } from '../../_components/PharmacistRouteShell'

export default function PharmacistCustomerPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = String(params.id ?? '')
  const [profile, setProfile] = useState<PharmacistCustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const submitted = searchParams.get('submitted') === '1'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem(`pharmacist-customer-profile-${customerId}`)
    if (!raw) return
    try {
      setProfile(JSON.parse(raw) as PharmacistCustomerProfile)
    } catch {
      // ignore malformed cache
    }
  }, [customerId])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.pharmacist.getCustomer(customerId)
        if (active) {
          setProfile(data)
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(`pharmacist-customer-profile-${customerId}`, JSON.stringify(data))
            window.sessionStorage.setItem('pharmacist-last-customer-id', customerId)
          }
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Unable to load customer profile.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [customerId])

  return (
    <PharmacistRouteShell
      title='Step 2: Review Customer History'
      subtitle='Review prior tests and outcomes before creating a new test.'
    >
      <Card variant='flat' style={{ gap: spacing['8'] }}>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Text variant='title'>Customer Profile</Text>
          <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
            <Button size='sm' variant='outline' onPress={() => router.push('/pharmacist/scan')}>
              Scan new customer
            </Button>
            <Button size='sm' onPress={() => router.push(`/pharmacist/customer/${customerId}/new-test`)}>
              Create new test
            </Button>
          </Box>
        </Box>
        {submitted ? <Text tone='success'>Consultation submitted successfully.</Text> : null}
        {loading ? <Text tone='muted'>Loading customer profile...</Text> : null}
        {error ? <Text tone='danger'>{error}</Text> : null}
        {profile ? (
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='label'>{profile.customer.name}</Text>
            <Text variant='caption' tone='muted'>
              {profile.customer.email} • {profile.customer.phone ?? 'No phone'}
            </Text>
            <Text variant='caption' tone='muted'>
              Tests: {profile.tests.length} • Last visit:{' '}
              {profile.customer.lastTestAt
                ? new Date(profile.customer.lastTestAt).toLocaleDateString()
                : 'N/A'}
            </Text>
            <Box style={{ gap: spacing['8'] }}>
              {profile.tests.length === 0 ? (
                <Text tone='muted'>No tests recorded yet.</Text>
              ) : (
                profile.tests.map((test) => (
                  <Card key={test.id} tone='subtle' style={{ gap: spacing['4'] }}>
                    <Text variant='label'>{test.title}</Text>
                    <Text tone='muted' variant='caption'>
                      {new Date(test.createdAt).toLocaleDateString()} • status: {test.status ?? 'completed'}
                    </Text>
                    <Text tone='muted' variant='caption'>
                      Recommended: {test.recommendedCount} • Purchased: {test.purchasedCount}
                    </Text>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        ) : null}
      </Card>
    </PharmacistRouteShell>
  )
}
