import { headers } from 'next/headers'
import { resolveStoreId } from '../../../app/api/_lib/release-env'
import type { SupportedLocale } from '../../../app/api/_lib/request-locale'
import { resolveRequestLocale } from '../../../app/api/_lib/request-locale'
import { resolveTenantContext } from '../tenant/context'

export type StorefrontServiceContext = {
  requestUrl: string
  requestHeaders?: HeadersInit
  locale: SupportedLocale
  storeId: string
  tenantId: string
  previewToken?: string
}

type StorefrontServiceContextInit = {
  pathname: string
  headers?: HeadersInit
  previewToken?: string
  searchParams?: Record<string, string | undefined>
}

function buildRequestUrl(pathname: string, searchParams?: Record<string, string | undefined>) {
  const url = new URL(`http://internal.local${pathname}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue
      url.searchParams.set(key, value)
    }
  }

  return url
}

export function createStorefrontServiceContextFromRequest(request: Request): StorefrontServiceContext {
  const tenantContext = resolveTenantContext()

  return {
    requestUrl: request.url,
    requestHeaders: new Headers(request.headers),
    locale: resolveRequestLocale(request),
    storeId: resolveStoreId(request),
    tenantId: tenantContext.tenantId,
    previewToken: new URL(request.url).searchParams.get('previewToken') ?? undefined,
  }
}

export function createStorefrontServiceRequest(context: Pick<StorefrontServiceContext, 'requestUrl' | 'requestHeaders'>) {
  return new Request(context.requestUrl, {
    headers: context.requestHeaders,
  })
}

export async function createStorefrontServiceContext(
  init: StorefrontServiceContextInit,
): Promise<StorefrontServiceContext> {
  const requestHeaders = init.headers ? new Headers(init.headers) : new Headers(await headers())
  const searchParams = {
    ...init.searchParams,
    ...(init.previewToken ? { previewToken: init.previewToken } : {}),
  }
  const request = new Request(buildRequestUrl(init.pathname, searchParams), {
    headers: requestHeaders,
  })

  return createStorefrontServiceContextFromRequest(request)
}
