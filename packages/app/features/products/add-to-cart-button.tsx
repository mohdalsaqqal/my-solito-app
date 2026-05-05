'use client'

import { Pressable } from 'react-native'
import { Box, Text } from 'app/components/uniwind-box'

interface AddToCartButtonProps {
  onPress: () => void
  className?: string
}

export function AddToCartButton({ onPress, className = '' }: AddToCartButtonProps) {
  return (
    <Box className={className}>
      <Pressable onPress={onPress}>
        <Box className="rounded-xl bg-gray-900 py-3 px-6 active:opacity-80">
          <Text className="text-center text-white font-semibold">Add to cart</Text>
        </Box>
      </Pressable>
    </Box>
  )
}
