'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Plus, Save, Search } from 'lucide-react'
import { Promotion } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../_components/AdminPagePrimitives'

function isValidIso(value: string) {
  const stamp = Date.parse(value)
  return Number.isFinite(stamp)
}

function prettyDate(value: string) {
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

export default function AdminMarketingPromotionsPage() {
  const [rows, setRows] = useState<Promotion[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [id, setId] = useState('')
  const [code, setCode] = useState('')
  const [startAt, setStartAt] = useState(new Date().toISOString())
  const [endAt, setEndAt] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
  const [priority, setPriority] = useState('1')
  const [rewardType, setRewardType] = useState<'percent_off' | 'fixed_amount_off' | 'free_shipping'>('percent_off')
  const [rewardValue, setRewardValue] = useState('10')
  const [conditionsJson, setConditionsJson] = useState('[{"type":"min_cart_total","amount":50}]')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await apiClient.admin.listPromotions()
      setRows(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load promotions.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const validationIssues = useMemo(() => {
    const issues: string[] = []
    if (!id.trim()) issues.push('Promotion id is required')
    if (!isValidIso(startAt)) issues.push('Start date must be valid ISO')
    if (!isValidIso(endAt)) issues.push('End date must be valid ISO')
    if (new Date(startAt).getTime() >= new Date(endAt).getTime()) issues.push('End date must be after start date')
    if (rewardType === 'percent_off') {
      const value = Number(rewardValue)
      if (!Number.isFinite(value) || value <= 0 || value > 100) issues.push('Percentage must be 0 < value <= 100')
    }
    if (rewardType === 'fixed_amount_off') {
      const value = Number(rewardValue)
      if (!Number.isFinite(value) || value <= 0) issues.push('Fixed amount must be > 0')
    }
    try {
      JSON.parse(conditionsJson)
    } catch {
      issues.push('Conditions JSON is invalid')
    }
    return issues
  }, [conditionsJson, endAt, id, rewardType, rewardValue, startAt])

  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.id} ${item.code ?? ''} ${item.name.en}`.toLowerCase().includes(needle))
  }, [rows, searchTerm])

  return (
    <PageContainer dense>
      <PageHeader title='Promotions' />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: spacing['24'],
        }}
      >
        <Section>
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing['12'], marginBottom: spacing['16'] }}>
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
                Promotion Editor
              </h3>
              <Button
                tone='primary'
                disabled={validationIssues.length > 0}
                onClick={async () => {
                  try {
                    const parsedConditions = JSON.parse(conditionsJson)
                    const rewardValueNumber = Number(rewardValue)
                    await apiClient.admin.createPromotion({
                      id: id.trim(),
                      code: code.trim() || undefined,
                      name: { en: id.trim() || 'promotion', ar: id.trim() || 'promotion' },
                      isActive: true,
                      startAt,
                      endAt,
                      priority: Number(priority) || 1,
                      conditions: parsedConditions,
                      rewards:
                        rewardType === 'free_shipping'
                          ? [{ type: 'free_shipping', value: true }]
                          : [{ type: rewardType, value: rewardValueNumber }],
                    })
                    setId('')
                    setCode('')
                    await load()
                  } catch (cause) {
                    setError(cause instanceof Error ? cause.message : 'Unable to create promotion.')
                  }
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                  <Save size={14} color={colors.textInverted} />
                  Save Promotion
                </span>
              </Button>
            </div>

            <div style={{ display: 'grid', gap: spacing['12'] }}>
              <label style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>Promotion ID</span>
                <input value={id} onChange={(e) => setId(e.target.value)} style={inputStyle} placeholder='promo-summer' />
              </label>
              <label style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>Coupon Code</span>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={inputStyle} placeholder='SUMMER20' />
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: spacing['12'],
                }}
              >
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>Start (ISO)</span>
                  <input value={startAt} onChange={(e) => setStartAt(e.target.value)} style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>End (ISO)</span>
                  <input value={endAt} onChange={(e) => setEndAt(e.target.value)} style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>Priority</span>
                <input value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle} />
              </label>

              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.xl + 2, padding: spacing['12'], backgroundColor: colors.surfaceMuted }}>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Reward
                </p>
                <div style={{ marginTop: spacing['8'], display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
                  {(['percent_off', 'fixed_amount_off', 'free_shipping'] as const).map((type) => (
                    <Button key={type} tone={rewardType === type ? 'primary' : 'secondary'} onClick={() => setRewardType(type)}>
                      {type}
                    </Button>
                  ))}
                </div>
                {rewardType !== 'free_shipping' ? (
                  <input
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value)}
                    style={{ ...inputStyle, marginTop: spacing['8'] }}
                    placeholder='10'
                  />
                ) : null}
              </div>

              <label style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>Conditions JSON</span>
                <textarea
                  value={conditionsJson}
                  onChange={(e) => setConditionsJson(e.target.value)}
                  rows={5}
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    fontFamily: 'monospace',
                    fontSize: typography.xs,
                    paddingBlock: spacing['8'],
                  }}
                />
              </label>
            </div>
          </Panel>
        </Section>

        <Section>
          <div style={{ display: 'grid', gap: spacing['24'] }}>
            <Panel density='dense'>
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
                Validation Summary
              </h3>
              <div style={{ marginTop: spacing['12'], display: 'grid', gap: spacing['8'] }}>
                {validationIssues.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], color: colors.success, fontSize: typography.sm }}>
                    <CheckCircle2 size={16} />
                    Ready to save. Only one highest-priority promotion applies.
                  </div>
                ) : (
                  validationIssues.map((issue) => (
                    <div key={issue} style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], color: colors.danger, fontSize: typography.sm }}>
                      <AlertCircle size={16} />
                      {issue}
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel density='dense'>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], marginBottom: spacing['12'] }}>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
                  Promotions
                </h3>
                <Button tone='primary'>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                    <Plus size={14} color={colors.textInverted} />
                    Create
                  </span>
                </Button>
              </div>

              <div style={{ position: 'relative', marginBottom: spacing['12'] }}>
                <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: 12, top: 12 }} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search promotions...'
                  style={{ ...inputStyle, paddingInlineStart: spacing['32'] + spacing['8'] }}
                />
              </div>

              {filtered.length === 0 ? (
                <EmptyState title='No promotions found' description='Create a promotion to start applying quote discounts.' />
              ) : (
                <TableShell>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Name', 'Code', 'Type', 'Value', 'Window', 'Status'].map((head) => (
                          <th
                            key={head}
                            scope='col'
                            style={{
                              height: spacing['48'],
                              paddingInline: spacing['12'],
                              textAlign: 'start',
                              verticalAlign: 'middle',
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
                      {filtered.map((promo) => {
                        const reward = promo.rewards[0]
                        return (
                          <tr key={promo.id}>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                              {promo.name.en}
                            </td>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                              <code style={{ fontSize: typography.xs, color: colors.textPrimary, backgroundColor: colors.surfaceMuted, padding: `${spacing['2']}px ${spacing['4']}px`, borderRadius: radius.md }}>
                                {promo.code ?? '-'}
                              </code>
                            </td>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                              {reward.type}
                            </td>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                              {'value' in reward ? String(reward.value) : '-'}
                            </td>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.xs }}>
                              {prettyDate(promo.startAt)} - {prettyDate(promo.endAt)}
                            </td>
                            <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                              <StatusPill tone={promo.isActive ? 'success' : 'warning'}>
                                {promo.isActive ? 'Active' : 'Inactive'}
                              </StatusPill>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </TableShell>
              )}
            </Panel>
          </div>
        </Section>
      </div>
    </PageContainer>
  )
}

const inputStyle = {
  width: '100%',
  minHeight: spacing['40'],
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  paddingInline: spacing['12'],
  outline: 'none',
} as const
