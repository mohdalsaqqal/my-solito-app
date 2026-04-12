'use client'

import { colors, radius, spacing } from '@real/tokens'

/**
 * Shared admin loading skeleton.
 * Replaces plain "Loading..." text across all CMS admin pages.
 */
export function AdminLoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gap: spacing['16'], padding: spacing['24'], animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['16'] }}>
        <div style={{ width: 32, height: 32, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }} />
        <div style={{ height: 20, width: 160, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }} />
      </div>
      {/* Content skeleton */}
      <div style={{ display: 'grid', gap: spacing['12'] }}>
        <div style={{ height: 16, width: '80%', borderRadius: radius.md, backgroundColor: colors.surfaceMuted }} />
        <div style={{ height: 16, width: '60%', borderRadius: radius.md, backgroundColor: colors.surfaceMuted }} />
        <div style={{ height: 16, width: '70%', borderRadius: radius.md, backgroundColor: colors.surfaceMuted }} />
      </div>
      {/* Card skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing['16'] }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 120, borderRadius: radius.xl, backgroundColor: colors.surfaceMuted, border: `1px solid ${colors.border}` }} />
        ))}
      </div>
    </div>
  )
}

/**
 * Shared admin error state with retry button.
 * Replaces plain error text across all CMS admin pages.
 */
export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div role='alert' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing['16'], padding: `${spacing['48']}px ${spacing['24']}`, textAlign: 'center' }}>
      <div aria-hidden='true' role='img' style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 600 }}>Something went wrong</div>
      <div style={{ color: colors.textSecondary, fontSize: 14, maxWidth: 400 }}>{message}</div>
      <button
        type='button'
        onClick={onRetry}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing['8'],
          padding: `${spacing['10']}px ${spacing['20']}px`,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        🔄 Retry
      </button>
    </div>
  )
}
