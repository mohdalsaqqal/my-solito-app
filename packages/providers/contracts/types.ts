export type ProviderFailure = {
  ok: false
  error: {
    code: string
    message: string
  }
}

export type ProviderSuccess<T> = {
  ok: true
  data: T
}

export type ProviderResult<T> = ProviderSuccess<T> | ProviderFailure

export function matchProviderResult<T, R>(
  result: ProviderResult<T>,
  handlers: {
    ok: (data: T) => R
    fail: (error: ProviderFailure['error']) => R
  }
): R {
  if (result.ok) {
    return handlers.ok(result.data)
  }

  return handlers.fail(result.error)
}
