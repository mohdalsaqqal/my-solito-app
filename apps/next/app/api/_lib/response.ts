export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiFailure = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

type FailMeta = {
  scope?: string
  cause?: unknown
}

function isExpectedPrerenderBailout(cause: unknown) {
  if (!(cause instanceof Error)) {
    return false
  }

  const digest =
    typeof (cause as Error & { digest?: unknown }).digest === 'string'
      ? (cause as Error & { digest: string }).digest
      : null

  if (digest === 'NEXT_PRERENDER_INTERRUPTED' || digest === 'HANGING_PROMISE_REJECTION') {
    return true
  }

  return (
    cause.message.includes('needs to bail out of prerendering') ||
    cause.message.includes('During prerendering, `connection()` rejects when the prerender is complete.')
  )
}

export function ok<T>(data: T, status = 200) {
  const payload: ApiSuccess<T> = {
    success: true,
    data,
  }

  return Response.json(payload, { status })
}

export function fail(
  code: string,
  message: string,
  status = 400,
  meta?: FailMeta,
  headers?: Record<string, string>,
) {
  if (meta?.cause !== undefined && !isExpectedPrerenderBailout(meta.cause)) {
    const isProd = process.env.NODE_ENV === 'production'
    console.error('[BFF_FAIL]', {
      code,
      message,
      status,
      scope: meta.scope ?? 'unknown',
      ...(isProd ? {} : { cause: meta.cause }),
    })
  }

  const payload: ApiFailure = {
    success: false,
    error: {
      code,
      message,
    },
  }

  return Response.json(payload, { status, headers })
}
