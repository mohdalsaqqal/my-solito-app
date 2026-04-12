'use client'

import { useEffect } from 'react'

const RECOVERY_KEY = '__rc_chunk_recovery_done__'

function isChunkError(error: unknown) {
  const message =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : ''

  return /chunkloaderror|loading chunk|failed to fetch dynamically imported module|failed to load chunk/i.test(
    message
  )
}

function recoverOnce() {
  if (typeof window === 'undefined') return
  if (window.sessionStorage.getItem(RECOVERY_KEY) === '1') return
  window.sessionStorage.setItem(RECOVERY_KEY, '1')
  window.location.reload()
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkError(event.error ?? event.message)) {
        recoverOnce()
      }
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {
        recoverOnce()
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.sessionStorage.removeItem(RECOVERY_KEY)
    }
  }, [])

  return null
}
