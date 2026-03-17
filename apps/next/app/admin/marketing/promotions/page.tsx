'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, Power, X, Tag } from 'lucide-react'
import type { Promotion, PromotionCondition, PromotionReward } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  Button,
  Field,
  PageContainer,
  PageHeader,
  Section,
  SelectInput,
  StatusPill,
  TextInput,
} from '../../_components/AdminPagePrimitives'

const cardRadius = radius.xl + 4
const iconBtnStyle = {
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  padding: spacing['4'],
  borderRadius: radius.md,
  display: 'flex',
  alignItems: 'center',
} as const

// ─── Condition Builder ───────────────────────────────────────────────────────

type ConditionRow =
  | { type: 'min_cart_total'; amount: string }
  | { type: 'brand_in'; brands: string }
  | { type: 'coupon_required'; code: string }

function conditionRowToPayload(row: ConditionRow): PromotionCondition {
  if (row.type === 'min_cart_total') return { type: 'min_cart_total', amount: Number(row.amount) }
  if (row.type === 'brand_in')
    return {
      type: 'brand_in',
      brands: row.brands
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
  return { type: 'coupon_required', code: row.code || undefined }
}

function conditionPayloadToRow(c: PromotionCondition): ConditionRow {
  if (c.type === 'min_cart_total') return { type: 'min_cart_total', amount: String(c.amount) }
  if (c.type === 'brand_in') return { type: 'brand_in', brands: c.brands.join(', ') }
  return {
    type: 'coupon_required',
    code: (c as { type: 'coupon_required'; code?: string }).code ?? '',
  }
}

function ConditionBuilder({
  rows,
  onChange,
}: {
  rows: ConditionRow[]
  onChange: (rows: ConditionRow[]) => void
}) {
  const addRow = () => onChange([...rows, { type: 'min_cart_total', amount: '50' }])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const updateRow = (i: number, row: ConditionRow) =>
    onChange(rows.map((r, idx) => (idx === i ? row : r)))

  return (
    <div style={{ display: 'grid', gap: spacing['8'] }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: spacing['8'], alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 180px' }}>
            <SelectInput
              value={row.type}
              onChange={(e) => {
                const t = e.target.value as ConditionRow['type']
                if (t === 'min_cart_total') updateRow(i, { type: t, amount: '50' })
                else if (t === 'brand_in') updateRow(i, { type: t, brands: '' })
                else updateRow(i, { type: t, code: '' })
              }}
            >
              <option value='min_cart_total'>Min cart total</option>
              <option value='brand_in'>Brand in</option>
              <option value='coupon_required'>Coupon required</option>
            </SelectInput>
          </div>
          <div style={{ flex: 1 }}>
            {row.type === 'min_cart_total' && (
              <TextInput
                type='number'
                placeholder='Amount'
                value={row.amount}
                onChange={(e) => updateRow(i, { ...row, amount: e.target.value })}
              />
            )}
            {row.type === 'brand_in' && (
              <TextInput
                placeholder='brand1, brand2'
                value={row.brands}
                onChange={(e) => updateRow(i, { ...row, brands: e.target.value })}
              />
            )}
            {row.type === 'coupon_required' && (
              <TextInput
                placeholder='Coupon code (optional)'
                value={row.code}
                onChange={(e) => updateRow(i, { ...row, code: e.target.value })}
              />
            )}
          </div>
          <button type='button' onClick={() => removeRow(i)} style={iconBtnStyle} title='Remove condition' aria-label='Remove condition'>
            <X size={14} color={colors.danger} />
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={addRow}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing['4'],
          border: 0,
          background: 'none',
          cursor: 'pointer',
          color: colors.brandPrimary,
          fontSize: typography.sm,
          padding: 0,
        }}
      >
        <Plus size={14} /> Add condition
      </button>
    </div>
  )
}

// ─── Form state helpers ──────────────────────────────────────────────────────

type FormState = {
  id: string
  code: string
  nameEn: string
  startAt: string
  endAt: string
  priority: string
  isActive: boolean
  rewardType: 'percent_off' | 'fixed_amount_off' | 'free_shipping'
  rewardValue: string
  conditions: ConditionRow[]
}

function blankForm(): FormState {
  const today = new Date().toISOString().slice(0, 10)
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  return {
    id: '',
    code: '',
    nameEn: '',
    startAt: today,
    endAt: twoWeeks,
    priority: '1',
    isActive: true,
    rewardType: 'percent_off',
    rewardValue: '10',
    conditions: [{ type: 'min_cart_total', amount: '50' }],
  }
}

function promotionToForm(p: Promotion): FormState {
  const reward = p.rewards[0]
  return {
    id: p.id,
    code: p.code ?? '',
    nameEn: p.name.en,
    startAt: p.startAt.slice(0, 10),
    endAt: p.endAt.slice(0, 10),
    priority: String(p.priority),
    isActive: p.isActive,
    rewardType: reward?.type ?? 'percent_off',
    rewardValue: reward && reward.type !== 'free_shipping' ? String(reward.value) : '0',
    conditions: p.conditions.map(conditionPayloadToRow),
  }
}

// ─── Slide-over ──────────────────────────────────────────────────────────────

function PromotionSlideOver({
  promotion,
  onClose,
  onSave,
}: {
  promotion: Promotion | null
  onClose: () => void
  onSave: (form: FormState) => Promise<void>
}) {
  const isEdit = Boolean(promotion)
  const [form, setForm] = useState<FormState>(promotion ? promotionToForm(promotion) : blankForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const validate = (): string | null => {
    if (!isEdit && !form.id.trim()) return 'Promotion ID is required'
    if (!form.startAt || !form.endAt) return 'Start and end dates are required'
    if (new Date(form.startAt) >= new Date(form.endAt)) return 'End date must be after start date'
    if (form.rewardType === 'percent_off') {
      const v = Number(form.rewardValue)
      if (!Number.isFinite(v) || v <= 0 || v > 100) return 'Percentage must be 1–100'
    }
    if (form.rewardType === 'fixed_amount_off') {
      const v = Number(form.rewardValue)
      if (!Number.isFinite(v) || v <= 0) return 'Fixed amount must be > 0'
    }
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 520,
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: colors.surface,
          borderLeft: `1px solid ${colors.border}`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing['16']}px ${spacing['24']}px`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: typography.lg,
              fontWeight: Number(fontWeights.semibold),
              color: colors.textPrimary,
            }}
          >
            {isEdit ? 'Edit Promotion' : 'New Promotion'}
          </h2>
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: spacing['4'],
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing['24']}px` }}>
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            {!isEdit && (
              <Field label='Promotion ID' hint='Unique identifier — cannot be changed after creation'>
                <TextInput
                  value={form.id}
                  onChange={(e) => set('id', e.target.value)}
                  placeholder='e.g. SUMMER_SALE_2026'
                />
              </Field>
            )}
            <Field label='Display Name'>
              <TextInput
                value={form.nameEn}
                onChange={(e) => set('nameEn', e.target.value)}
                placeholder='e.g. Summer Sale 10% Off'
              />
            </Field>
            <Field label='Coupon Code' hint='Leave blank if no code required'>
              <TextInput
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder='e.g. SAVE10'
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
              <Field label='Start Date'>
                <TextInput
                  type='date'
                  value={form.startAt}
                  onChange={(e) => set('startAt', e.target.value)}
                />
              </Field>
              <Field label='End Date'>
                <TextInput
                  type='date'
                  value={form.endAt}
                  onChange={(e) => set('endAt', e.target.value)}
                />
              </Field>
            </div>
            <Field label='Reward Type'>
              <SelectInput
                value={form.rewardType}
                onChange={(e) => set('rewardType', e.target.value as FormState['rewardType'])}
              >
                <option value='percent_off'>Percent Off (%)</option>
                <option value='fixed_amount_off'>Fixed Amount Off</option>
                <option value='free_shipping'>Free Shipping</option>
              </SelectInput>
            </Field>
            {form.rewardType !== 'free_shipping' && (
              <Field label={form.rewardType === 'percent_off' ? 'Discount (%)' : 'Discount Amount'}>
                <TextInput
                  type='number'
                  value={form.rewardValue}
                  onChange={(e) => set('rewardValue', e.target.value)}
                />
              </Field>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
              <Field label='Priority' hint='Higher = applied first'>
                <TextInput
                  type='number'
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value)}
                />
              </Field>
              <Field label='Status'>
                <SelectInput
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => set('isActive', e.target.value === 'active')}
                >
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </SelectInput>
              </Field>
            </div>
            <Field
              label='Conditions'
              hint='All conditions must be met for the promotion to apply'
            >
              <ConditionBuilder
                rows={form.conditions}
                onChange={(c) => set('conditions', c)}
              />
            </Field>
            {error && (
              <p style={{ margin: 0, color: colors.danger, fontSize: typography.sm }}>{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: `${spacing['16']}px ${spacing['24']}px`,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: spacing['8'],
            justifyContent: 'flex-end',
          }}
        >
          <Button tone='ghost' onClick={onClose}>
            Cancel
          </Button>
          <Button
            tone='primary'
            onClick={() => {
              void handleSave()
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Promotion'}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminMarketingPromotionsPage() {
  const [rows, setRows] = useState<Promotion[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  // undefined = slide-over closed; null = new; Promotion = edit
  const [slideOver, setSlideOver] = useState<Promotion | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await apiClient.admin.listPromotions()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const buildReward = (form: FormState): PromotionReward => {
    if (form.rewardType === 'free_shipping') return { type: 'free_shipping', value: true }
    if (form.rewardType === 'percent_off') return { type: 'percent_off', value: Number(form.rewardValue) }
    return { type: 'fixed_amount_off', value: Number(form.rewardValue) }
  }

  const handleSave = async (form: FormState) => {
    if (slideOver && slideOver.id) {
      // Edit path
      const updated = await apiClient.admin.updatePromotion(slideOver.id, {
        code: form.code || undefined,
        name: { en: form.nameEn, ar: slideOver.name.ar },
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        priority: Number(form.priority),
        isActive: form.isActive,
        rewards: [buildReward(form)],
        conditions: form.conditions.map(conditionRowToPayload),
      })
      setRows((prev) => prev.map((r) => (r.id === slideOver.id ? updated : r)))
    } else {
      // Create path
      const created = await apiClient.admin.createPromotion({
        id: form.id.trim(),
        code: form.code || undefined,
        name: { en: form.nameEn, ar: form.nameEn },
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        priority: Number(form.priority),
        isActive: form.isActive,
        rewards: [buildReward(form)],
        conditions: form.conditions.map(conditionRowToPayload),
      })
      setRows((prev) => [...prev, created])
    }
  }

  const handleDelete = async (p: Promotion) => {
    if (!confirm(`Delete promotion "${p.id}"?`)) return
    await apiClient.admin.deletePromotion(p.id)
    setRows((prev) => prev.filter((r) => r.id !== p.id))
  }

  const handleToggle = async (p: Promotion) => {
    const updated = await apiClient.admin.updatePromotion(p.id, { isActive: !p.isActive })
    setRows((prev) => prev.map((r) => (r.id === p.id ? updated : r)))
  }

  const filtered = useMemo(
    () =>
      rows.filter((p) => {
        const matchSearch =
          !search ||
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          (p.code ?? '').toLowerCase().includes(search.toLowerCase()) ||
          p.name.en.toLowerCase().includes(search.toLowerCase())
        const matchStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && p.isActive) ||
          (statusFilter === 'inactive' && !p.isActive)
        return matchSearch && matchStatus
      }),
    [rows, search, statusFilter],
  )

  const pillTab = (label: string, value: typeof statusFilter) => (
    <button
      type='button'
      key={value}
      onClick={() => setStatusFilter(value)}
      style={{
        border: 0,
        cursor: 'pointer',
        borderRadius: radius.full,
        padding: `6px ${spacing['16']}px`,
        fontSize: typography.sm,
        fontWeight: Number(fontWeights.medium),
        backgroundColor: statusFilter === value ? colors.brandPrimary : 'transparent',
        color: statusFilter === value ? '#fff' : colors.textSecondary,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <PageContainer>
      <PageHeader
        title='Promotions'
        subtitle='Create and manage discount promotions, coupon codes, and reward rules.'
        actions={
          <Button tone='primary' onClick={() => setSlideOver(null)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
              <Plus size={14} /> New Promotion
            </span>
          </Button>
        }
      />

      {error && <p style={{ color: colors.danger, fontSize: typography.sm }}>{error}</p>}

      {/* Filters row */}
      <Section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['16'],
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: spacing['4'],
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.full,
              padding: '4px',
            }}
          >
            {pillTab('All', 'all')}
            {pillTab('Active', 'active')}
            {pillTab('Inactive', 'inactive')}
          </div>
          <TextInput
            type='search'
            placeholder='Search by ID, code, name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>
      </Section>

      {/* Table */}
      <Section>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: spacing['48'],
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <Tag size={32} color={colors.textSecondary} style={{ marginBottom: spacing['12'] }} />
            <p
              style={{
                margin: '0 0 4px',
                fontSize: typography.base,
                fontWeight: Number(fontWeights.semibold),
                color: colors.textPrimary,
              }}
            >
              {search || statusFilter !== 'all' ? 'No promotions match' : 'No promotions yet'}
            </p>
            <p style={{ margin: 0, fontSize: typography.sm, color: colors.textSecondary }}>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create your first promotion to get started.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: cardRadius,
              overflow: 'hidden',
              backgroundColor: colors.surface,
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 140px 200px 80px 80px 100px',
                backgroundColor: colors.surfaceMuted,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {['Promotion', 'Code', 'Reward', 'Window', 'Priority', 'Status', ''].map((h) => (
                <div
                  key={h}
                  style={{
                    padding: `${spacing['8']}px ${spacing['12']}px`,
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.semibold),
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {filtered.map((p) => {
              const reward = p.rewards[0]
              const rewardLabel =
                reward?.type === 'percent_off'
                  ? `${reward.value}% off`
                  : reward?.type === 'fixed_amount_off'
                    ? `-${reward.value}`
                    : 'Free shipping'
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 140px 200px 80px 80px 100px',
                    borderBottom: `1px solid ${colors.border}`,
                    alignItems: 'center',
                  }}
                >
                  {/* Promotion name/id */}
                  <div style={{ padding: `${spacing['12']}px` }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: typography.sm,
                        fontWeight: Number(fontWeights.medium),
                        color: colors.textPrimary,
                      }}
                    >
                      {p.id}
                    </p>
                    {p.name.en && (
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: typography.xs,
                          color: colors.textSecondary,
                        }}
                      >
                        {p.name.en}
                      </p>
                    )}
                  </div>
                  {/* Code */}
                  <div style={{ padding: `${spacing['12']}px` }}>
                    {p.code ? (
                      <span
                        style={{
                          fontSize: typography.xs,
                          fontFamily: 'monospace',
                          backgroundColor: colors.surfaceMuted,
                          borderRadius: radius.md,
                          padding: `2px ${spacing['8']}px`,
                          color: colors.textPrimary,
                        }}
                      >
                        {p.code}
                      </span>
                    ) : (
                      <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                        —
                      </span>
                    )}
                  </div>
                  {/* Reward */}
                  <div
                    style={{
                      padding: `${spacing['12']}px`,
                      fontSize: typography.sm,
                      color: colors.textPrimary,
                    }}
                  >
                    {rewardLabel}
                  </div>
                  {/* Window */}
                  <div
                    style={{
                      padding: `${spacing['12']}px`,
                      fontSize: typography.xs,
                      color: colors.textSecondary,
                    }}
                  >
                    {new Date(p.startAt).toLocaleDateString()} –{' '}
                    {new Date(p.endAt).toLocaleDateString()}
                  </div>
                  {/* Priority */}
                  <div
                    style={{
                      padding: `${spacing['12']}px`,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {p.priority}
                  </div>
                  {/* Status */}
                  <div style={{ padding: `${spacing['12']}px` }}>
                    <StatusPill tone={p.isActive ? 'success' : 'neutral'}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </div>
                  {/* Actions */}
                  <div
                    style={{
                      padding: `${spacing['8']}px`,
                      display: 'flex',
                      gap: spacing['4'],
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type='button'
                      onClick={() => setSlideOver(p)}
                      style={iconBtnStyle}
                      title='Edit'
                    >
                      <Edit2 size={14} color={colors.textSecondary} />
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        void handleToggle(p)
                      }}
                      style={iconBtnStyle}
                      title={p.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={14} color={p.isActive ? colors.success : colors.textSecondary} />
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        void handleDelete(p)
                      }}
                      style={iconBtnStyle}
                      title='Delete'
                    >
                      <Trash2 size={14} color={colors.danger} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Slide-over */}
      {slideOver !== undefined && (
        <PromotionSlideOver
          promotion={slideOver}
          onClose={() => setSlideOver(undefined)}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  )
}
