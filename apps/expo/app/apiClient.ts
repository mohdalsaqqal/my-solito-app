import Constants from 'expo-constants'
import { createApiClient } from '@real/app/lib/api-client'

function extractHost(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    if (trimmed.includes('://')) {
      const parsed = new URL(trimmed)
      return parsed.hostname || null
    }
  } catch {
    // Fall through to manual parsing.
  }

  const withoutPath = trimmed.split('/')[0] || ''
  const host = withoutPath.split(':')[0] || ''
  return host || null
}

function resolveDevBaseUrl() {
  const rawCandidates = [
    Constants.expoConfig?.hostUri ||
      '',
    // Expo Go / runtime fallback keys can vary by SDK/runtime mode.
    (Constants as any)?.expoGoConfig?.debuggerHost || '',
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost || '',
    (Constants as any)?.manifest?.debuggerHost || '',
  ]

  for (const candidate of rawCandidates) {
    const host = extractHost(String(candidate))
    if (!host) continue
    if (host === 'localhost' || host === '127.0.0.1') continue
    return `http://${host}:3000`
  }

  return null
}

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
// Development-only fallback:
// If EXPO_PUBLIC_API_BASE_URL is not set, use the Expo host IP so Expo Go on device can reach Next BFF.
const baseUrl =
  envBaseUrl ||
  (__DEV__ ? resolveDevBaseUrl() : null) ||
  'http://localhost:3000'

if (__DEV__) {
  // Keep this visible during local debugging so host issues are obvious.
  console.log(`[expo-api] baseUrl=${baseUrl}`)
}

export const apiClient = createApiClient({ baseUrl })
