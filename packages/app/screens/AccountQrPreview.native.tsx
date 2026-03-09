import { useEffect, useState } from 'react'
import { SvgXml } from 'react-native-svg'
import { spacing } from '@real/tokens'
import { Box, Text } from '@real/ui/primitives'

type AccountQrPreviewProps = {
  userQrCode: string
  qrImageDataUrl: string | null
}

export function AccountQrPreview({ userQrCode }: AccountQrPreviewProps) {
  const [qrSvgXml, setQrSvgXml] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void import('qrcode')
      .then((mod) => mod.toString(userQrCode, { type: 'svg', margin: 1, width: 192 }))
      .then((svgXml) => {
        if (active) {
          setQrSvgXml(svgXml)
        }
      })
      .catch(() => {
        if (active) {
          setQrSvgXml(null)
        }
      })
    return () => {
      active = false
    }
  }, [userQrCode])

  return (
    <Box
      style={{
        width: spacing['96'] * 2,
        height: spacing['96'] * 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {qrSvgXml ? (
        <SvgXml
          xml={qrSvgXml}
          width={spacing['96'] * 2}
          height={spacing['96'] * 2}
        />
      ) : (
        <Text variant='caption' tone='muted'>QR image is loading...</Text>
      )}
    </Box>
  )
}
