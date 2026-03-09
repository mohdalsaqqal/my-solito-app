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
  meta?: FailMeta
) {
  if (meta?.cause !== undefined) {
    console.error('[BFF_FAIL]', {
      code,
      message,
      status,
      scope: meta.scope ?? 'unknown',
      cause: meta.cause,
    })
  }

  const payload: ApiFailure = {
    success: false,
    error: {
      code,
      message,
    },
  }

  return Response.json(payload, { status })
}
