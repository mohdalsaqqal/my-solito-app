'use client'
import { Text, View } from 'react-native'
import { useParams, useRouter } from 'next/navigation'

export default function Home() {
  const params = useParams<{ userId: string }>()
  const userId = params?.userId ?? 'guest'
  const router = useRouter()

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text onPress={() => router.back()}>
        Hi {userId}, click me to go back
      </Text>
    </View>
  )
}
