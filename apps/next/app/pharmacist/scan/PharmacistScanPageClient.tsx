'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { spacing } from '@real/tokens'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import { PharmacistCustomerSummary } from '@real/app/lib/types'
import { apiClient } from '../../apiClient'
import { PharmacistRouteShell } from '../_components/PharmacistRouteShell'
import type { AuthSession } from '@real/providers/contracts'
import type { CMSHome } from '@real/app/lib/types'

type PharmacistScanPageClientProps = {
  session: AuthSession | null
  cmsHome: CMSHome | null
}

export default function PharmacistScanPageClient({ session, cmsHome }: PharmacistScanPageClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<PharmacistCustomerSummary[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanningQr, setScanningQr] = useState(false)
  const [stopScan, setStopScan] = useState<(() => void) | null>(null)
  const lastCustomerId =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('pharmacist-last-customer-id')
      : null

  async function handleSearch() {
    setError(null)
    setSearching(true)
    try {
      const result = await apiClient.pharmacist.searchCustomers(query)
      setCustomers(result)
    } catch (cause) {
      setCustomers([])
      setError(cause instanceof Error ? cause.message : 'Unable to search customers.')
    } finally {
      setSearching(false)
    }
  }

  async function handleScanQr() {
    const root = globalThis as any
    const nav = root.navigator as any
    if (scanningQr) {
      stopScan?.()
      setScanningQr(false)
      setStopScan(null)
      return
    }
    if (!root.isSecureContext) {
      setError('Camera scan requires a secure context. Use HTTPS or open on http://localhost.')
      return
    }
    if (!nav?.mediaDevices?.getUserMedia) {
      setError('Camera scan is not supported in this browser.')
      return
    }

    setError(null)
    try {
      let stream: MediaStream | null = null
      try {
        stream = await nav.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      } catch {
        stream = await nav.mediaDevices.getUserMedia({ video: true, audio: false })
      }

      const video = root.document.createElement('video')
      video.setAttribute('playsinline', 'true')
      video.muted = true
      video.srcObject = stream
      await video.play()

      const BarcodeDetectorCtor = root.BarcodeDetector
      const detector = BarcodeDetectorCtor ? new BarcodeDetectorCtor({ formats: ['qr_code'] }) : null
      let jsQrDecode: ((data: Uint8ClampedArray, width: number, height: number) => { data?: string } | null) | null = null
      let canvas: HTMLCanvasElement | null = null
      let context: CanvasRenderingContext2D | null = null
      if (!detector) {
        const jsQrModule = await import('jsqr')
        jsQrDecode = jsQrModule.default
        const createdCanvas = root.document.createElement('canvas')
        const createdContext = createdCanvas.getContext('2d')
        if (!createdContext) {
          throw new Error('Unable to access canvas context for QR scanning.')
        }
        canvas = createdCanvas
        context = createdContext
      }

      let active = true
      let rafId: number | null = null
      const cleanup = () => {
        active = false
        if (rafId !== null) root.cancelAnimationFrame(rafId)
        const tracks = stream?.getTracks?.() ?? []
        tracks.forEach((track: any) => track.stop?.())
        video.pause?.()
        video.srcObject = null
      }
      setStopScan(() => cleanup)
      setScanningQr(true)

      const tick = async () => {
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
            try {
              const profile = await apiClient.pharmacist.resolveQr(value)
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('pharmacist-last-customer-id', profile.customer.userId)
              }
              cleanup()
              setScanningQr(false)
              setStopScan(null)
              router.push(`/pharmacist/customer/${profile.customer.userId}`)
              return
            } catch {
              setQuery(value)
              await handleSearch()
              cleanup()
              setScanningQr(false)
              setStopScan(null)
              return
            }
          }
        } catch {
          // keep scanning
        }
        rafId = root.requestAnimationFrame(tick)
      }

      rafId = root.requestAnimationFrame(tick)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start camera scan.')
      setScanningQr(false)
      setStopScan(null)
    }
  }

  return (
    <PharmacistRouteShell
      session={session}
      cmsHome={cmsHome}
      title='Step 1: Scan or Search Customer'
      subtitle='Scan customer QR or search by name/email/user ID.'
    >
      <Card variant='raised' style={{ gap: spacing['8'] }}>
        {lastCustomerId ? (
          <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
            <Button size='sm' variant='outline' onPress={() => router.push(`/pharmacist/customer/${lastCustomerId}`)}>
              Resume last customer
            </Button>
          </Box>
        ) : null}
        <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center', flexWrap: 'wrap' }}>
          <Box style={{ flex: 1, minWidth: spacing['128'] }}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder='Search by name, email, user ID, or QR code'
              autoCapitalize='none'
            />
          </Box>
          <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
            <Button onPress={() => void handleSearch()}>{searching ? 'Searching...' : 'Search'}</Button>
          </Box>
          <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
            <Button variant='outline' onPress={() => void handleScanQr()}>
              {scanningQr ? 'Stop scan' : 'Scan QR'}
            </Button>
          </Box>
        </Box>
        {error ? <Text tone='danger'>{error}</Text> : null}
        {scanningQr ? (
          <Text variant='caption' tone='muted'>Camera scanning in progress. Point camera to QR code.</Text>
        ) : null}
      </Card>

      <Card variant='flat' style={{ gap: spacing['8'] }}>
        <Text variant='title'>Customers</Text>
        {customers.length === 0 ? (
          <Text tone='muted'>No customer results yet.</Text>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            {customers.map((customer) => (
              <Card key={customer.userId} tone='subtle' style={{ gap: spacing['4'] }}>
                <Text variant='label'>{customer.name}</Text>
                <Text variant='caption' tone='muted'>{customer.email}</Text>
                <Text variant='caption' tone='muted'>QR: {customer.qrCode}</Text>
                <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
                  <Button
                    size='sm'
                    variant='outline'
                    onPress={() => {
                      if (typeof window !== 'undefined') {
                        window.sessionStorage.setItem('pharmacist-last-customer-id', customer.userId)
                      }
                      router.push(`/pharmacist/customer/${customer.userId}`)
                    }}
                  >
                    Open
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Card>
    </PharmacistRouteShell>
  )
}
