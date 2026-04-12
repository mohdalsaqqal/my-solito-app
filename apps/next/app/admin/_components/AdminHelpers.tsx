'use client'

import { ReactNode } from 'react'
import { AdminJobRecord } from '@real/app/lib/types'
import { colors, fontWeights, spacing, typography } from '@real/tokens'
import { Button, EditorShell, InfoGrid, StatusPill } from './AdminPagePrimitives'

export function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export function formatMoney(value?: number, currency = 'USD') {
  if (typeof value !== 'number') return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value?: number) {
  if (typeof value !== 'number') return '-'
  return `${(value * 100).toFixed(1)}%`
}

export function valueOrDash(value: ReactNode) {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

export function JobNoticePanel({
  job,
  onOpen,
}: {
  job: AdminJobRecord | null
  onOpen?: (id: string) => void
}) {
  if (!job) return null

  return (
    <EditorShell
      title='Latest Queued Job'
      subtitle='Heavy admin work is tracked through the operations job center.'
      actions={
        onOpen ? (
          <Button tone='secondary' onClick={() => onOpen(job.id)}>
            Open Job
          </Button>
        ) : null
      }
    >
      <InfoGrid
        rows={[
          { label: 'Summary', value: job.summary },
          {
            label: 'Status',
            value: (
              <StatusPill tone={job.status === 'failed' ? 'danger' : job.status === 'succeeded' ? 'success' : 'warning'}>
                {job.status}
              </StatusPill>
            ),
          },
          { label: 'Entity', value: job.entity },
          { label: 'Type', value: job.type },
          { label: 'Created', value: formatDateTime(job.createdAt) },
        ]}
      />
    </EditorShell>
  )
}

export function DetailEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        padding: spacing['16'],
        color: colors.textSecondary,
        fontSize: typography.sm,
        fontWeight: Number(fontWeights.medium),
      }}
    >
      <div style={{ color: colors.textPrimary, marginBottom: spacing['4'] }}>{title}</div>
      <div>{description}</div>
    </div>
  )
}
