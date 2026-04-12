/**
 * Shared HTTP client for external adapter integrations.
 *
 * Features:
 * - Timeout per request (default 10s)
 * - Retry with exponential backoff (default 3 attempts)
 * - Auth header injection (Bearer token or API key)
 * - Error translation to ProviderResult failures
 * - Node.js native fetch (no extra deps)
 */

export type HttpClientConfig = {
  /** Base URL for all requests (trailing slash optional) */
  baseUrl: string
  /** Auth strategy */
  auth?:
    | { type: 'bearer'; token: string }
    | { type: 'api-key'; header: string; value: string }
  /** Default request timeout in ms */
  timeoutMs?: number
  /** Max retry attempts (0 = no retry) */
  maxRetries?: number
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  timeoutMs?: number
}

export type HttpError = {
  code: string
  message: string
  statusCode?: number
  response?: unknown
}

export class HttpClient {
  private baseUrl: string
  private auth?: HttpClientConfig['auth']
  private timeoutMs: number
  private maxRetries: number

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.auth = config.auth
    this.timeoutMs = config.timeoutMs ?? 10_000
    this.maxRetries = config.maxRetries ?? 3
  }

  async request<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}`
    const method = options?.method ?? 'GET'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    }

    // Inject auth
    if (this.auth?.type === 'bearer') {
      headers['Authorization'] = `Bearer ${this.auth.token}`
    } else if (this.auth?.type === 'api-key') {
      headers[this.auth.header] = this.auth.value
    }

    const body = options?.body ? JSON.stringify(options.body) : undefined
    const timeoutMs = options?.timeoutMs ?? this.timeoutMs

    let lastError: HttpError | null = null

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorBody: unknown
          try {
            errorBody = await response.json()
          } catch {
            errorBody = await response.text().catch(() => null)
          }

          const error: HttpError = {
            code: `HTTP_${response.status}`,
            message: `External service returned ${response.status}`,
            statusCode: response.status,
            response: errorBody,
          }

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error
          }

          lastError = error

          // Retry on 5xx with exponential backoff
          if (attempt < this.maxRetries) {
            await sleep(2 ** attempt * 1000)
            continue
          }

          throw error
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return undefined as T
        }

        return (await response.json()) as T
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = {
            code: 'REQUEST_TIMEOUT',
            message: `Request timed out after ${timeoutMs}ms`,
          }
        } else if (isHttpError(err)) {
          lastError = err
        } else {
          lastError = {
            code: 'NETWORK_ERROR',
            message: err instanceof Error ? err.message : 'Unknown network error',
          }
        }

        if (attempt < this.maxRetries) {
          await sleep(2 ** attempt * 1000)
          continue
        }

        throw lastError
      }
    }

    // Should not reach here, but TypeScript needs it
    throw lastError ?? { code: 'UNKNOWN', message: 'Request failed' }
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

function isHttpError(err: unknown): err is HttpError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
