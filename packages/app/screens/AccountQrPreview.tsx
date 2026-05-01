import { useEffect, useState } from 'react'
import { spacing } from '@real/tokens'
import { Box, Text } from '@real/ui/primitives'

type AccountQrPreviewProps = {
  userQrCode: string
  qrImageDataUrl: string | null
}

export function AccountQrPreview({ userQrCode, qrImageDataUrl }: AccountQrPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(qrImageDataUrl)

  useEffect(() => {
    if (qrImageDataUrl) {
      setDataUrl(qrImageDataUrl)
      return
    }
    let active = true
    void import('qrcode')
      .then((mod) => mod.toDataURL(userQrCode, { margin: 1, width: 192 }))
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        if (active) setDataUrl(null)
      })
    return () => {
      active = false
    }
  }, [userQrCode, qrImageDataUrl])

  if (!dataUrl) {
    return (
      <Box style={{ gap: spacing['4'] }}>
        <Text variant='caption' tone='muted'>
          QR image is loading...
        </Text>
        <Text variant='caption' tone='muted'>
          {userQrCode}
        </Text>
      </Box>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt='Account QR code'
      width={192}
      height={192}
      style={{ display: 'block' }}
    />
  )
}
