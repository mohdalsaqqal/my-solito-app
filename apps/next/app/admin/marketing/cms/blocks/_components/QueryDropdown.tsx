'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { ProductQuery } from '@real/app/lib/types'
import { colors, radius, spacing, typography, fontWeights } from '@real/tokens'
import { FieldLabel, ErrorHint } from './BlockEditorChrome'
import { InlineLoading } from '../../../../_components/AdminPagePrimitives'

const UI = {
  queryLabel: 'Query',
  querySearchPlaceholder: 'Search queries by title or slug',
  queryOpenLink: 'Open Queries',
  queryClearButton: 'Clear',
  querySelectedLabel: 'Selected query',
  queryLoading: 'Loading queries…',
  queryNoQueries: 'No queries available yet.',
  queryNoMatches: 'No queries match the current search.',
  queryInactiveLabel: 'Inactive',
  querySelectRequiredPlaceholder: 'Select a query',
  querySelectOptionalPlaceholder: 'Optional query',
} as const

export function QueryDropdown({
  value,
  onChange,
  queries,
  required,
  errorMsg,
  loading,
  loadError,
}: {
  value: string
  onChange: (v: string) => void
  queries: ProductQuery[]
  required?: boolean
  errorMsg?: string | null
  loading?: boolean
  loadError?: string | null
}) {
  const [search, setSearch] = useState('')
  const selected = queries.find((query) => query.slug === value) ?? null
  const filteredQueries = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return queries
    return queries.filter((query) => {
      const titleEn = query.title?.en ?? ''
      const titleAr = query.title?.ar ?? ''
      return `${query.slug} ${titleEn} ${titleAr}`.toLowerCase().includes(needle)
    })
  }, [queries, search])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 36,
    borderRadius: 'var(--radius-lg, 12px)',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.sm,
    paddingInline: spacing['12'],
    paddingBlock: spacing['8'],
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <label style={{ display: 'grid', gap: spacing['4'] }}>
      <FieldLabel required={required}>{UI.queryLabel}</FieldLabel>
      <div
        style={{
          display: 'grid',
          gap: spacing['8'],
          border: `1px solid ${errorMsg ? colors.danger : colors.border}`,
          borderRadius: radius.xl,
          padding: spacing['12'],
          backgroundColor: colors.surface,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'], flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 2 }}>
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
              {UI.querySelectedLabel}
            </span>
            <span style={{ fontSize: typography.sm, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
              {selected?.title?.en || selected?.slug || (required ? UI.querySelectRequiredPlaceholder : UI.querySelectOptionalPlaceholder)}
            </span>
            {selected ? (
              <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                {selected.slug}
              </span>
            ) : null}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['6'], flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {selected && !selected.active ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceMuted,
                  color: colors.textSecondary,
                  padding: `2px ${spacing['8']}px`,
                  fontSize: typography.xs,
                }}
              >
                {UI.queryInactiveLabel}
              </span>
            ) : null}
            {!required && value ? (
              <button
                type='button'
                onClick={() => onChange('')}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.full,
                  backgroundColor: colors.surface,
                  color: colors.textSecondary,
                  padding: `4px ${spacing['10']}px`,
                  fontSize: typography.xs,
                  cursor: 'pointer',
                }}
              >
                {UI.queryClearButton}
              </button>
            ) : null}
            <a
              href='/admin/marketing/cms/queries'
              target='_blank'
              rel='noopener noreferrer'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing['4'],
                color: colors.textSecondary,
                fontSize: typography.xs,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={12} />
              {UI.queryOpenLink}
            </a>
          </div>
        </div>

        <input
          className='admin-focus-ring'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={UI.querySearchPlaceholder}
          style={inputStyle}
        />

        <div
          style={{
            display: 'grid',
            gap: spacing['8'],
            maxHeight: 220,
            overflowY: 'auto',
            paddingInlineEnd: spacing['4'],
          }}
        >
          {loading ? (
            <InlineLoading label={UI.queryLoading} />
          ) : loadError ? (
            <span style={{ fontSize: typography.xs, color: colors.danger }}>{loadError}</span>
          ) : queries.length === 0 ? (
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>{UI.queryNoQueries}</span>
          ) : filteredQueries.length === 0 ? (
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>{UI.queryNoMatches}</span>
          ) : (
            filteredQueries.map((query) => {
              const active = query.slug === value
              return (
                <button
                  key={query.slug}
                  type='button'
                  onClick={() => onChange(query.slug)}
                  style={{
                    border: `1px solid ${active ? colors.brandPrimary : colors.border}`,
                    borderRadius: radius.lg,
                    backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
                    color: colors.textPrimary,
                    padding: spacing['12'],
                    display: 'grid',
                    gap: spacing['6'],
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing['10'] }}>
                    <div style={{ display: 'grid', gap: spacing['2'], minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), lineHeight: 1.35 }}>
                        {query.title?.en || query.slug}
                      </span>
                      <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontFamily: 'monospace', lineHeight: 1.4 }}>
                        {query.slug}
                      </span>
                    </div>
                    {!query.active ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: radius.full,
                          backgroundColor: colors.surfaceMuted,
                          color: colors.textSecondary,
                          padding: `2px ${spacing['8']}px`,
                          fontSize: typography.xs,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {UI.queryInactiveLabel}
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
      <ErrorHint message={errorMsg ?? null} />
    </label>
  )
}
