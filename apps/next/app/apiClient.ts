import { createApiClient } from '@real/app/lib/api-client'

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

export const apiClient = createApiClient({ baseUrl })
