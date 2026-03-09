import { CMSHome } from '@real/providers/contracts'
import { CMSProvider } from '@real/providers/contracts'

type StrapiSingleTypeResponse<T> = {
  data?: {
    id?: number | string
    attributes?: T
  } | null
}

type UnknownRecord = Record<string, unknown>

function env(key: string) {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key]
}

function normalizeBaseUrl(input: string) {
  return input.endsWith('/') ? input.slice(0, -1) : input
}

function normalizeEndpoint(input: string) {
  return input.startsWith('/') ? input : `/${input}`
}

function asObject(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as UnknownRecord
}

function isCmsHome(value: unknown): value is CMSHome {
  const root = asObject(value)
  if (!root) return false
  const heroSlides = root.heroSlides
  return Array.isArray(heroSlides)
}

function extractCmsHome(payload: unknown): CMSHome | null {
  if (isCmsHome(payload)) {
    return payload
  }

  const wrapper = payload as StrapiSingleTypeResponse<CMSHome>
  if (wrapper?.data?.attributes && isCmsHome(wrapper.data.attributes)) {
    return wrapper.data.attributes
  }

  const root = asObject(payload)
  if (!root) return null
  const data = asObject(root.data)
  const attributes = data ? asObject(data.attributes) : null
  if (attributes && isCmsHome(attributes)) {
    return attributes
  }

  return null
}

export const strapiCMSAdapter: CMSProvider = {
  async getHome() {
    const baseUrl = env('STRAPI_URL')
    if (!baseUrl) {
      return {
        ok: false,
        error: {
          code: 'CMS_STRAPI_URL_MISSING',
          message: 'STRAPI_URL is not configured.',
        },
      }
    }

    const endpoint = normalizeEndpoint(
      env('STRAPI_HOME_ENDPOINT') ?? '/api/home?populate=deep'
    )
    const token = env('STRAPI_API_TOKEN')?.trim()
    const url = `${normalizeBaseUrl(baseUrl)}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: 'CMS_STRAPI_HTTP_ERROR',
            message: `Strapi request failed (${response.status}).`,
          },
        }
      }

      const payload = (await response.json()) as unknown
      const home = extractCmsHome(payload)
      if (!home) {
        return {
          ok: false,
          error: {
            code: 'CMS_STRAPI_INVALID_PAYLOAD',
            message: 'Strapi payload does not match CMSHome contract.',
          },
        }
      }

      return {
        ok: true,
        data: home,
      }
    } catch {
      return {
        ok: false,
        error: {
          code: 'CMS_STRAPI_UNAVAILABLE',
          message: 'Unable to reach Strapi.',
        },
      }
    }
  },
}
