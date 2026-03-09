'use client'

import { useEffect, useMemo, useState } from 'react'
import { Languages, RefreshCw } from 'lucide-react'
import { TranslationLocaleStatus, TranslationPrefillResult, TranslationStatus } from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  StatusPill,
  TableShell,
} from '../../_components/AdminPagePrimitives'

export default function AdminOperationsTranslationsPage() {
  const [status, setStatus] = useState<TranslationStatus | null>(null)
  const [lastRun, setLastRun] = useState<TranslationPrefillResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.admin.i18nStatus()
      setStatus(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load translation status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const rows = useMemo(() => {
    if (!status) return []
    return status.locales.flatMap((localeRow) =>
      localeRow.namespaces.map((namespaceRow) => ({
        locale: localeRow.locale,
        namespace: namespaceRow.namespace,
        totalKeys: namespaceRow.totalKeys,
        missingKeys: namespaceRow.missingKeys,
      }))
    )
  }, [status])

  const runPrefill = async (dryRun: boolean) => {
    setRunning(true)
    setError(null)
    try {
      const result = await apiClient.admin.i18nPrefill({ dryRun })
      setLastRun(result)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to run translation prefill.')
    } finally {
      setRunning(false)
    }
  }

  const exportStatus = () => {
    if (!status) return
    const payload = {
      status,
      lastRun,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `translation-status-${new Date().toISOString().slice(0, 19)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const localeSummary = (locale: TranslationLocaleStatus | undefined) => {
    if (!locale) return '0 / 0'
    return `${locale.missingKeys} / ${locale.totalKeys}`
  }

  return (
    <PageContainer>
      <PageHeader
        title='Translations'
        subtitle='Monitor missing keys and run machine prefill workflows.'
        actions={
          <>
            <Button tone='secondary' onClick={() => void load()} disabled={loading || running}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <RefreshCw size={14} color={colors.textSecondary} />
                Refresh
              </span>
            </Button>
            <Button tone='secondary' onClick={exportStatus} disabled={!status}>
              Export JSON
            </Button>
            <Button tone='secondary' onClick={() => void runPrefill(true)} disabled={running}>
              Dry Run Prefill
            </Button>
            <Button tone='primary' onClick={() => void runPrefill(false)} disabled={running}>
              {running ? 'Running...' : 'Run Prefill'}
            </Button>
          </>
        }
      />

      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <Section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: spacing['24'],
          }}
        >
          <Panel density='dense'>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
              <Languages size={16} color={colors.textSecondary} />
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
                Provider
              </h3>
            </div>
            <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm }}>
              {status?.provider ?? 'crowdin'}
            </p>
            <div style={{ marginTop: spacing['8'] }}>
              <StatusPill tone={status?.connected ? 'success' : 'warning'}>
                {status?.connected ? 'Connected' : 'Offline'}
              </StatusPill>
            </div>
          </Panel>

          <Panel density='dense'>
            <h3 style={{ margin: `0 0 ${spacing['8']}px`, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
              Locale Gaps
            </h3>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>EN missing / total</p>
            <p style={{ margin: `${spacing['4']}px 0 ${spacing['8']}px`, color: colors.textPrimary, fontSize: typography.xl, fontWeight: Number(fontWeights.semibold) }}>
              {localeSummary(status?.locales.find((entry) => entry.locale === 'en'))}
            </p>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>AR missing / total</p>
            <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textPrimary, fontSize: typography.xl, fontWeight: Number(fontWeights.semibold) }}>
              {localeSummary(status?.locales.find((entry) => entry.locale === 'ar'))}
            </p>
          </Panel>

          <Panel density='dense'>
            <h3 style={{ margin: `0 0 ${spacing['8']}px`, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
              Last Prefill
            </h3>
            {lastRun ? (
              <div style={{ display: 'grid', gap: spacing['4'], color: colors.textSecondary, fontSize: typography.sm }}>
                <span>Run at: {new Date(lastRun.runAt).toLocaleString()}</span>
                <span>Filled keys: {lastRun.filledKeys}</span>
                <span>Before: {lastRun.missingBefore}</span>
                <span>After: {lastRun.missingAfter}</span>
              </div>
            ) : (
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>
                No prefill run yet.
              </p>
            )}
          </Panel>
        </div>
      </Section>

      <Section>
        <Panel density='dense'>
          <h3 style={{ margin: `0 0 ${spacing['12']}px`, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
            Missing Keys by Namespace
          </h3>

          {loading ? (
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>Loading translation status...</p>
          ) : rows.length === 0 ? (
            <EmptyState title='No translation rows' description='No namespace status is available yet.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Locale', 'Namespace', 'Missing', 'Total'].map((head) => (
                      <th
                        key={head}
                        scope='col'
                        style={{
                          height: spacing['48'],
                          paddingInline: spacing['12'],
                          textAlign: 'start',
                          color: colors.textSecondary,
                          fontSize: typography.xs,
                          fontWeight: Number(fontWeights.medium),
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
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
                  {rows.map((row) => (
                    <tr key={`${row.locale}-${row.namespace}`}>
                      <td style={cellStyle}>{row.locale.toUpperCase()}</td>
                      <td style={cellStyle}>{row.namespace}</td>
                      <td style={cellStyle}>{row.missingKeys}</td>
                      <td style={cellStyle}>{row.totalKeys}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
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
