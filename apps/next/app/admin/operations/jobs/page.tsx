'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminJobRecord } from '@real/app/lib/types'
import { colors, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import { formatDateTime, valueOrDash } from '../../_components/AdminHelpers'
import {
  Button,
  EditorShell,
  EmptyState,
  InfoGrid,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  StatusPill,
  TableShell,
} from '../../_components/AdminPagePrimitives'

export default function AdminOperationsJobsPage() {
  const searchParams = useSearchParams()
  const highlightedJobId = searchParams.get('job')
  const [jobs, setJobs] = useState<AdminJobRecord[]>([])
  const [activeJobId, setActiveJobId] = useState<string | null>(highlightedJobId)
  const [detail, setDetail] = useState<AdminJobRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.admin.listJobs()
      setJobs(response)
      if (!activeJobId && response[0]) {
        setActiveJobId(response[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadJobs()
  }, [])

  useEffect(() => {
    if (highlightedJobId) {
      setActiveJobId(highlightedJobId)
    }
  }, [highlightedJobId])

  useEffect(() => {
    if (!activeJobId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setLoadingDetail(true)
    void apiClient.admin
      .getJob(activeJobId)
      .then((response) => {
        if (!cancelled) setDetail(response)
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load job detail.')
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeJobId])

  const summary = useMemo(
    () => ({
      queued: jobs.filter((job) => job.status === 'queued' || job.status === 'running').length,
      succeeded: jobs.filter((job) => job.status === 'succeeded').length,
      failed: jobs.filter((job) => job.status === 'failed').length,
    }),
    [jobs]
  )

  return (
    <PageContainer>
      <PageHeader
        title='Jobs'
        subtitle='Track exports, bulk updates, stock transfers, and approval batches from one operational queue.'
        actions={
          <Button tone='secondary' onClick={() => void loadJobs()} disabled={loading}>
            Refresh
          </Button>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <Section>
        <InfoGrid
          rows={[
            { label: 'Running / Queued', value: summary.queued },
            { label: 'Succeeded', value: summary.succeeded },
            { label: 'Failed', value: summary.failed },
            { label: 'Latest Refresh', value: formatDateTime(new Date().toISOString()) },
          ]}
        />
      </Section>

      <Section>
        <Panel density='dense'>
          {loading ? (
            <EmptyState title='Loading jobs...' description='Fetching the latest operation queue from the server.' />
          ) : jobs.length === 0 ? (
            <EmptyState title='No jobs yet' description='Bulk operations and exports will appear here when they are submitted.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Summary', 'Entity', 'Type', 'Status', 'Created', 'Requested By', 'Actions'].map((head) => (
                      <th
                        key={head}
                        style={{
                          padding: spacing['12'],
                          textAlign: 'start',
                          color: colors.textSecondary,
                          fontSize: typography.xs,
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td style={cellStyle}>{job.summary}</td>
                      <td style={cellStyle}>{job.entity}</td>
                      <td style={cellStyle}>{job.type}</td>
                      <td style={cellStyle}>
                        <StatusPill tone={job.status === 'failed' ? 'danger' : job.status === 'succeeded' ? 'success' : 'warning'}>
                          {job.status}
                        </StatusPill>
                      </td>
                      <td style={cellStyle}>{formatDateTime(job.createdAt)}</td>
                      <td style={cellStyle}>{job.requestedBy.email}</td>
                      <td style={cellStyle}>
                        <Button tone='ghost' onClick={() => setActiveJobId(job.id)}>
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </Section>

      <Section>
        <EditorShell title={detail?.summary ?? 'Job Detail'} subtitle='Queued operations retain their canonical input and result metadata here.'>
          {loadingDetail ? (
            <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading job detail...</div>
          ) : !detail ? (
            <EmptyState title='No job selected' description='Choose a job row to inspect its payload and normalized result.' />
          ) : (
            <>
              <InfoGrid
                rows={[
                  { label: 'Job ID', value: detail.id },
                  { label: 'Status', value: <StatusPill tone={detail.status === 'failed' ? 'danger' : detail.status === 'succeeded' ? 'success' : 'warning'}>{detail.status}</StatusPill> },
                  { label: 'Entity', value: detail.entity },
                  { label: 'Type', value: detail.type },
                  { label: 'Created', value: formatDateTime(detail.createdAt) },
                  { label: 'Updated', value: formatDateTime(detail.updatedAt) },
                ]}
              />
              <Panel density='dense'>
                <div style={{ marginBottom: spacing['12'], color: colors.textPrimary, fontSize: typography.sm }}>Input</div>
                <pre style={preStyle}>{JSON.stringify(detail.input ?? {}, null, 2)}</pre>
              </Panel>
              <Panel density='dense'>
                <div style={{ marginBottom: spacing['12'], color: colors.textPrimary, fontSize: typography.sm }}>Result</div>
                <pre style={preStyle}>{JSON.stringify(detail.result ?? {}, null, 2)}</pre>
              </Panel>
              <InfoGrid
                rows={[
                  { label: 'Requested By', value: detail.requestedBy.email },
                  { label: 'Targets', value: detail.targetIds.length ? detail.targetIds.join(', ') : valueOrDash('-') },
                ]}
              />
            </>
          )}
        </EditorShell>
      </Section>
    </PageContainer>
  )
}

const cellStyle = {
  padding: spacing['12'],
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  fontSize: typography.sm,
} as const

const preStyle = {
  margin: 0,
  padding: spacing['12'],
  backgroundColor: colors.surfaceMuted,
  overflowX: 'auto',
  color: colors.textPrimary,
  fontSize: typography.xs,
} as const

