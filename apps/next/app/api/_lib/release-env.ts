import { ReleaseEnvironment } from '@real/providers/contracts'

export const DEFAULT_STORE_ID = 'default'

export function resolveReleaseEnvironment(request: Request): ReleaseEnvironment {
  const url = new URL(request.url)
  const envParam = url.searchParams.get('env')
  if (envParam === 'staging' || envParam === 'production') {
    return envParam
  }

  const header = request.headers.get('x-release-env')
  if (header === 'staging' || header === 'production') {
    return header
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'staging'
}

export function resolveStoreId(request: Request): string {
  const url = new URL(request.url)
  const storeParam = url.searchParams.get('storeId')
  if (storeParam && storeParam.trim().length > 0) {
    return storeParam.trim()
  }

  const header = request.headers.get('x-store-id')
  if (header && header.trim().length > 0) {
    return header.trim()
  }

  return DEFAULT_STORE_ID
}
