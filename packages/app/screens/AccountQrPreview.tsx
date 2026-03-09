import { Image } from 'react-native'
import { spacing } from '@real/tokens'
import { Box, Text } from '@real/ui/primitives'

type AccountQrPreviewProps = {
  userQrCode: string
  qrImageDataUrl: string | null
}

export function AccountQrPreview({ userQrCode, qrImageDataUrl }: AccountQrPreviewProps) {
  if (!qrImageDataUrl) {
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
    <Image
      source={{ uri: qrImageDataUrl }}
      style={{
        width: spacing['96'] * 2,
        height: spacing['96'] * 2,
      }}
      resizeMode='contain'
    />
  )
}
