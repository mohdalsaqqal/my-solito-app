'use client'

import { TextLink } from 'solito/link'
import { Box, Text } from 'app/components/uniwind-box'

/**
 * Test screen to confirm Uniwind + Solito v5 on both web and native.
 * Uses Tailwind-style className: on web via div/span + Tailwind, on native via View/Text + Uniwind.
 */
export function TestScreen() {
  return (
    <Box className="flex-1 justify-center items-center p-4 gap-6 bg-gray-100">
      <Text className="text-2xl font-bold text-gray-900">
        Uniwind + Solito Test
      </Text>
      <Text className="text-center text-base text-gray-700 max-w-md">
        This screen uses <Text className="font-semibold">className</Text> for
        styling. If you see correct layout and colors, Uniwind (native) or
        Tailwind (web) is working.
      </Text>
      <Box className="flex flex-row gap-4">
        <TextLink
          href="/"
          className="text-base font-bold text-blue-600 underline"
        >
          Back to Home
        </TextLink>
        <TextLink
          href="/users/fernando"
          className="text-base font-bold text-green-600 underline"
        >
          User detail
        </TextLink>
      </Box>
      <Box className="mt-4 px-4 py-2 rounded-lg bg-blue-500">
        <Text className="text-white font-medium">Styled box (Tailwind)</Text>
      </Box>
    </Box>
  )
}
