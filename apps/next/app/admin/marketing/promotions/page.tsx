'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BadgePercent,
  CalendarRange,
  Plus,
  Power,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import type {
  Promotion,
  PromotionCondition,
  PromotionReward,
} from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  ActivityFeed,
  AdminCommandBar,
  AdminKpiCard,
  AdminKpiGrid,
  AdminPanelHeader,
  AdminTrendPill,
  Button,
  EmptyState,
  Field,
  InlineLoading,
  MetricList,
  PageContainer,
  Panel,
  SelectInput,
  StatusPill,
  TextInput,
  WorkspaceLayout,
} from '../../_components/AdminPagePrimitives'

const iconBtnStyle = {
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  width: 44,
  height: 44,
  borderRadius: radius.md,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

const promotionDrawerTokens = {
  backdrop: colors.black,
  panelBackground: colors.surface,
  panelBorder: colors.border,
  panelShadow: '0 16px 36px rgba(15,15,17,0.10), 0 28px 56px rgba(15,15,17,0.12)',
  headerBackground: colors.surfaceLowest,
} as const

const copy = {
  conditionTypes: {
    minCartTotal: 'Min cart total',
    brandIn: 'Brand in',
    couponRequired: 'Coupon required',
  },
  placeholders: {
    amount: 'Amount',
    brands: 'brand1, brand2',
    couponOptional: 'Coupon code (optional)',
    promotionId: 'SUMMER_SALE_2026',
    displayName: 'Summer Sale 10% Off',
    couponCode: 'SAVE10',
    search: 'Search by ID, code, or name',
  },
  rewardTypes: {
    percentOff: 'Percent off (%)',
    fixedAmountOff: 'Fixed amount off',
    freeShipping: 'Free shipping',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  queue: {
    reward: 'Reward',
    window: 'Window',
    conditions: 'Conditions',
  },
} as const

type ConditionRow =
  | { type: 'min_cart_total'; amount: string }
  | { type: 'brand_in'; brands: string }
  | { type: 'coupon_required'; code: string }

function conditionRowToPayload(row: ConditionRow): PromotionCondition {
  if (row.type === 'min_cart_total') {
    return { type: 'min_cart_total', amount: Number(row.amount) }
  }
  if (row.type === 'brand_in') {
    return {
      type: 'brand_in',
      brands: row.brands
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
  }
  return { type: 'coupon_required', code: row.code || undefined }
}

function conditionPayloadToRow(c: PromotionCondition): ConditionRow {
  if (c.type === 'min_cart_total') {
    return { type: 'min_cart_total', amount: String(c.amount) }
  }
  if (c.type === 'brand_in') {
    return { type: 'brand_in', brands: c.brands.join(', ') }
  }
  return {
    type: 'coupon_required',
    code: (c as { type: 'coupon_required'; code?: string }).code ?? '',
  }
}

function formatDateRange(startAt: string, endAt: string) {
  return `${new Date(startAt).toLocaleDateString()} - ${new Date(endAt).toLocaleDateString()}`
}

function formatRelativeWindow(endAt: string) {
  const diffMs = new Date(endAt).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / 86400000)
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Ends today'
  if (diffDays === 1) return 'Ends tomorrow'
  return `${diffDays} days left`
}

function rewardLabel(reward?: PromotionReward) {
  if (!reward) return 'No reward'
  if (reward.type === 'percent_off') return `${reward.value}% off`
  if (reward.type === 'fixed_amount_off') return `-${reward.value}`
  return 'Free shipping'
}

function conditionsLabel(conditions: PromotionCondition[]) {
  if (conditions.length === 0) return 'No conditions'
  return conditions
    .map((condition) => {
      if (condition.type === 'min_cart_total') return `Cart > ${condition.amount}`
      if (condition.type === 'brand_in') return `${condition.brands.length} brand rule`
      return 'Coupon gate'
    })
    .join(' - ')
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
        <div
          key={i}
          style={{
            display: 'flex',
            gap: spacing['8'],
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
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
              <option value='min_cart_total'>{copy.conditionTypes.minCartTotal}</option>
              <option value='brand_in'>{copy.conditionTypes.brandIn}</option>
              <option value='coupon_required'>{copy.conditionTypes.couponRequired}</option>
            </SelectInput>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            {row.type === 'min_cart_total' ? (
              <TextInput
                type='number'
                placeholder={copy.placeholders.amount}
                value={row.amount}
                onChange={(e) => updateRow(i, { ...row, amount: e.target.value })}
              />
            ) : null}
            {row.type === 'brand_in' ? (
              <TextInput
                placeholder={copy.placeholders.brands}
                value={row.brands}
                onChange={(e) => updateRow(i, { ...row, brands: e.target.value })}
              />
            ) : null}
            {row.type === 'coupon_required' ? (
              <TextInput
                placeholder={copy.placeholders.couponOptional}
                value={row.code}
                onChange={(e) => updateRow(i, { ...row, code: e.target.value })}
              />
            ) : null}
          </div>
          <button
            type='button'
            onClick={() => removeRow(i)}
            style={iconBtnStyle}
            title='Remove condition'
            aria-label='Remove condition'
          >
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
  const [form, setForm] = useState<FormState>(
    promotion ? promotionToForm(promotion) : blankForm(),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const validate = (): string | null => {
    if (!isEdit && !form.id.trim()) return 'Promotion ID is required'
    if (!form.startAt || !form.endAt) return 'Start and end dates are required'
    if (new Date(form.startAt) >= new Date(form.endAt)) {
      return 'End date must be after start date'
    }
    if (form.rewardType === 'percent_off') {
      const v = Number(form.rewardValue)
      if (!Number.isFinite(v) || v <= 0 || v > 100) return 'Percentage must be 1-100'
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

  useEffect(() => {
    const doc = globalThis.document
    if (!doc) return

    previousActiveRef.current = doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)

      if (focusables.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = doc.activeElement

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault()
          last?.focus()
        }
        return
      }

      if (active === last || !panelRef.current.contains(active)) {
        event.preventDefault()
        first?.focus()
      }
    }

    doc.addEventListener('keydown', onKeyDown)
    return () => {
      doc.removeEventListener('keydown', onKeyDown)
      previousActiveRef.current?.focus()
    }
  }, [onClose])

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: promotionDrawerTokens.backdrop,
          opacity: 0.38,
          zIndex: 40,
        }}
      />
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 580,
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: promotionDrawerTokens.panelBackground,
          borderLeft: `1px solid ${promotionDrawerTokens.panelBorder}`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: promotionDrawerTokens.panelShadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing['12'],
            padding: `${spacing['20']}px ${spacing['24']}px`,
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: promotionDrawerTokens.headerBackground,
          }}
        >
          <div style={{ display: 'grid', gap: spacing['6'] }}>
            <span
              style={{
                color: colors.brandPrimary,
                fontSize: typography.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: Number(fontWeights.semibold),
              }}
            >
              Campaign workspace
            </span>
            <h2
              id={titleId}
              style={{
                margin: 0,
                fontSize: typography.xl,
                fontWeight: Number(fontWeights.bold),
                color: colors.textPrimary,
              }}
            >
              {isEdit ? 'Edit promotion' : 'New promotion'}
            </h2>
            <p
              id={descriptionId}
              style={{
                margin: 0,
                color: colors.textSecondary,
                fontSize: typography.sm,
                lineHeight: 1.5,
              }}
            >
              Shape the reward, timing, and gating logic before publishing the next discount lane.
            </p>
          </div>
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              color: colors.textSecondary,
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing['24']}px` }}>
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            {!isEdit ? (
              <Field label='Promotion ID' hint='Unique identifier. This cannot be changed after creation.'>
                <TextInput
                  value={form.id}
                  onChange={(e) => set('id', e.target.value)}
                  placeholder={copy.placeholders.promotionId}
                />
              </Field>
            ) : null}

            <div style={formCardStyle}>
              <Field label='Display name'>
                <TextInput
                  value={form.nameEn}
                  onChange={(e) => set('nameEn', e.target.value)}
                  placeholder={copy.placeholders.displayName}
                />
              </Field>
              <Field label='Coupon code' hint='Leave blank to run this as an auto-applied campaign.'>
                <TextInput
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder={copy.placeholders.couponCode}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
              <Field label='Start date'>
                <TextInput type='date' value={form.startAt} onChange={(e) => set('startAt', e.target.value)} />
              </Field>
              <Field label='End date'>
                <TextInput type='date' value={form.endAt} onChange={(e) => set('endAt', e.target.value)} />
              </Field>
            </div>

            <div style={formCardStyle}>
              <Field label='Reward type'>
                <SelectInput
                  value={form.rewardType}
                  onChange={(e) => set('rewardType', e.target.value as FormState['rewardType'])}
                >
                  <option value='percent_off'>{copy.rewardTypes.percentOff}</option>
                  <option value='fixed_amount_off'>{copy.rewardTypes.fixedAmountOff}</option>
                  <option value='free_shipping'>{copy.rewardTypes.freeShipping}</option>
                </SelectInput>
              </Field>
              {form.rewardType !== 'free_shipping' ? (
                <Field label={form.rewardType === 'percent_off' ? 'Discount (%)' : 'Discount amount'}>
                  <TextInput type='number' value={form.rewardValue} onChange={(e) => set('rewardValue', e.target.value)} />
                </Field>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
              <Field label='Priority' hint='Higher values win when campaigns collide.'>
                <TextInput type='number' value={form.priority} onChange={(e) => set('priority', e.target.value)} />
              </Field>
              <Field label='Status'>
                <SelectInput
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => set('isActive', e.target.value === 'active')}
                >
                  <option value='active'>{copy.status.active}</option>
                  <option value='inactive'>{copy.status.inactive}</option>
                </SelectInput>
              </Field>
            </div>

            <Field
              label='Conditions'
              hint='All configured conditions must be true before the campaign applies.'
            >
              <ConditionBuilder rows={form.conditions} onChange={(c) => set('conditions', c)} />
            </Field>

            {error ? (
              <p style={{ margin: 0, color: colors.danger, fontSize: typography.sm }}>{error}</p>
            ) : null}
          </div>
        </div>

        <div
          style={{
            padding: `${spacing['16']}px ${spacing['24']}px`,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: spacing['8'],
            justifyContent: 'flex-end',
            backgroundColor: colors.surface,
          }}
        >
          <Button tone='ghost' onClick={onClose}>
            Cancel
          </Button>
          <Button tone='primary' onClick={() => { void handleSave() }} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create promotion'}
          </Button>
        </div>
      </div>
    </>
  )
}

const statusTabs = ['all', 'active', 'inactive'] as const

export default function AdminMarketingPromotionsPage() {
  const [rows, setRows] = useState<Promotion[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusTabs)[number]>('all')
  const [slideOver, setSlideOver] = useState<Promotion | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiClient.admin.listPromotions()
      setRows(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load promotions')
    } finally {
      setLoading(false)
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
    if (!window.confirm(`Delete promotion "${p.id}"?`)) return
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

  const activeRows = rows.filter((row) => row.isActive)
  const inactiveRows = rows.filter((row) => !row.isActive)
  const codeDrivenRows = rows.filter((row) => Boolean(row.code))
  const endingSoon = activeRows.filter((row) => {
    const diffMs = new Date(row.endAt).getTime() - Date.now()
    return diffMs >= 0 && diffMs <= 7 * 86400000
  })

  const activityItems = activeRows.slice(0, 5).map((promotion) => ({
    id: promotion.id,
    title: promotion.name.en || promotion.id,
    detail: `${rewardLabel(promotion.rewards[0])} - ${conditionsLabel(promotion.conditions)}`,
    meta: formatRelativeWindow(promotion.endAt),
    tone: promotion.isActive ? ('success' as const) : ('neutral' as const),
  }))

  const railMetrics = [
    { label: 'Code-led campaigns', value: codeDrivenRows.length.toLocaleString(), tone: 'brand' as const },
    { label: 'Auto-applied campaigns', value: (rows.length - codeDrivenRows.length).toLocaleString() },
    {
      label: 'Ending this week',
      value: endingSoon.length.toLocaleString(),
      tone: endingSoon.length ? ('warning' as const) : ('default' as const),
    },
    {
      label: 'Highest priority',
      value: rows.length ? String(Math.max(...rows.map((promotion) => promotion.priority))) : '0',
    },
  ]

  return (
    <PageContainer>
      <AdminCommandBar
        eyebrow='Marketing Operations'
        title='Promotions'
        subtitle='Operate discount strategy as a campaign control room: manage live windows, reward tension, and coupon-driven traffic without losing merchandising context.'
        status={
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
            <AdminTrendPill
              value={activeRows.length ? `${activeRows.length} live campaigns` : 'No live campaigns'}
              tone={activeRows.length ? 'success' : 'warning'}
            />
            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
              {endingSoon.length ? `${endingSoon.length} ending in 7 days` : 'No immediate expiry pressure'}
            </span>
          </div>
        }
        actions={
          <>
            <Button tone='secondary' onClick={() => void load()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button tone='primary' onClick={() => setSlideOver(null)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                <Plus size={14} /> New Promotion
              </span>
            </Button>
          </>
        }
      />

      {error ? (
        <Panel tone='danger'>
          <div style={{ color: colors.danger, fontSize: typography.sm }}>{error}</div>
        </Panel>
      ) : null}

      <AdminKpiGrid>
        <AdminKpiCard label='Live campaigns' value={activeRows.length.toLocaleString()} meta='Promotions currently available to shoppers' icon={Sparkles} tone='brand' />
        <AdminKpiCard label='Coupon-driven' value={codeDrivenRows.length.toLocaleString()} meta='Campaigns that rely on explicit codes' icon={Tag} trend={<AdminTrendPill value='Acquisition lever' tone='neutral' />} />
        <AdminKpiCard label='Ending soon' value={endingSoon.length.toLocaleString()} meta='Live campaigns ending within the next 7 days' icon={CalendarRange} tone={endingSoon.length ? 'warning' : 'default'} />
        <AdminKpiCard label='Inactive' value={inactiveRows.length.toLocaleString()} meta='Drafted or paused promotions ready for review' icon={BadgePercent} tone='default' />
      </AdminKpiGrid>

      <WorkspaceLayout
        main={
          <>
            <Panel tone='brand'>
              <AdminPanelHeader title='Campaign filters' subtitle='Switch between live and inactive lanes, then narrow the queue with keyword search.' />
              <div style={{ display: 'grid', gap: spacing['12'] }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing['12'],
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
                    {statusTabs.map((value) => {
                      const active = statusFilter === value
                      const label = value === 'all' ? 'All' : value === 'active' ? 'Active' : 'Inactive'
                      return (
                        <button
                          key={value}
                          type='button'
                          onClick={() => setStatusFilter(value)}
                          className='admin-focus-ring'
                          style={{
                            border: 0,
                            cursor: 'pointer',
                            borderRadius: radius.full,
                            padding: `6px ${spacing['16']}px`,
                            fontSize: typography.sm,
                            fontWeight: Number(fontWeights.medium),
                            backgroundColor: active ? colors.textPrimary : 'transparent',
                            color: active ? colors.textInverted : colors.textSecondary,
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                    <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: 12, top: 12 }} />
                    <input
                      className='admin-focus-ring'
                      type='search'
                      aria-label={copy.placeholders.search}
                      placeholder={copy.placeholders.search}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: 44,
                        borderRadius: radius.xl,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        color: colors.textPrimary,
                        paddingInlineStart: spacing['32'] + spacing['8'],
                        paddingInlineEnd: spacing['12'],
                        fontSize: typography.sm,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs, lineHeight: 1.5 }}>
                  Use the campaign workspace to keep high-priority offers visible, tighten reward overlap, and retire stale promotions before they dilute the shopping signal.
                </p>
              </div>
            </Panel>
            <Panel>
              <AdminPanelHeader
                title='Promotion queue'
                subtitle='Every row keeps the reward, timing, and gating logic visible so operators can act quickly without opening each record.'
                actions={<StatusPill tone='neutral'>{filtered.length.toLocaleString()} visible</StatusPill>}
              />

              {loading ? (
                <InlineLoading label='Loading promotions...' />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={search || statusFilter !== 'all' ? 'No matching campaigns' : 'No promotions yet'}
                  description={
                    search || statusFilter !== 'all'
                      ? 'Try widening the search or switching lanes.'
                      : 'Create the first campaign to start shaping discount strategy.'
                  }
                />
              ) : (
                <div style={{ display: 'grid', gap: spacing['12'] }}>
                  {filtered.map((promotion) => {
                    const reward = promotion.rewards[0]
                    return (
                      <div
                        key={promotion.id}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl + 4,
                          backgroundColor: colors.surface,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: spacing['16'],
                            display: 'grid',
                            gap: spacing['12'],
                            background:
                              promotion.isActive
                                ? 'linear-gradient(180deg, rgba(44,97,83,0.05) 0%, rgba(255,255,255,1) 100%)'
                                : colors.surface,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: spacing['12'],
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'grid', gap: spacing['6'] }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: spacing['8'],
                                  flexWrap: 'wrap',
                                }}
                              >
                                <span style={{ color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                                  {promotion.name.en || promotion.id}
                                </span>
                                <StatusPill tone={promotion.isActive ? 'success' : 'neutral'}>
                                  {promotion.isActive ? 'Active' : 'Inactive'}
                                </StatusPill>
                                <AdminTrendPill value={`Priority ${promotion.priority}`} tone='neutral' />
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: spacing['8'],
                                  flexWrap: 'wrap',
                                  color: colors.textSecondary,
                                  fontSize: typography.sm,
                                }}
                              >
                                <span>{promotion.id}</span>
                                <span>-</span>
                                <span>{promotion.code || 'Auto applied'}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
                              <button type='button' onClick={() => setSlideOver(promotion)} style={iconBtnStyle} title='Edit promotion'>
                                <ArrowUpRight size={15} color={colors.textSecondary} />
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  void handleToggle(promotion)
                                }}
                                style={iconBtnStyle}
                                title={promotion.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Power size={15} color={promotion.isActive ? colors.success : colors.textSecondary} />
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  void handleDelete(promotion)
                                }}
                                style={iconBtnStyle}
                                title='Delete promotion'
                              >
                                <Trash2 size={15} color={colors.danger} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gap: spacing['10'],
                              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            }}
                          >
                            <div style={infoChipStyle}>
                              <span style={infoChipLabelStyle}>{copy.queue.reward}</span>
                              <span style={infoChipValueStyle}>{rewardLabel(reward)}</span>
                            </div>
                            <div style={infoChipStyle}>
                              <span style={infoChipLabelStyle}>{copy.queue.window}</span>
                              <span style={infoChipValueStyle}>{formatDateRange(promotion.startAt, promotion.endAt)}</span>
                            </div>
                            <div style={infoChipStyle}>
                              <span style={infoChipLabelStyle}>{copy.queue.conditions}</span>
                              <span style={infoChipValueStyle}>{conditionsLabel(promotion.conditions)}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: spacing['12'],
                              flexWrap: 'wrap',
                              borderTop: `1px solid ${colors.border}`,
                              paddingTop: spacing['12'],
                            }}
                          >
                            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                              {formatRelativeWindow(promotion.endAt)}
                            </span>
                            <Button tone='secondary' onClick={() => setSlideOver(promotion)}>
                              Open campaign
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </>
        }
        rail={
          <>
            <Panel>
              <AdminPanelHeader title='Campaign posture' subtitle='A fast summary of how the current promotion mix is structured.' />
              <MetricList rows={railMetrics} />
            </Panel>

            <Panel>
              <AdminPanelHeader title='Live campaign activity' subtitle='The currently active campaigns most likely to influence the next shopper session.' />
              {activityItems.length === 0 ? (
                <EmptyState title='No active campaigns' description='Launch a promotion to start populating this lane.' />
              ) : (
                <ActivityFeed items={activityItems} empty='No active campaigns' />
              )}
            </Panel>

            <Panel tone='brand'>
              <AdminPanelHeader title='Operator note' subtitle='Best practice for this page' />
              <p
                style={{
                  margin: 0,
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                  lineHeight: 1.6,
                }}
              >
                Keep the queue biased toward a few intentional campaigns. Too many overlapping offers weakens scanability for operators and erodes pricing clarity for shoppers.
              </p>
            </Panel>
          </>
        }
      />

      {slideOver !== undefined ? (
        <PromotionSlideOver promotion={slideOver} onClose={() => setSlideOver(undefined)} onSave={handleSave} />
      ) : null}
    </PageContainer>
  )
}

const formCardStyle = {
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xl,
  backgroundColor: colors.surfaceMuted,
  padding: spacing['16'],
  display: 'grid',
  gap: spacing['12'],
} as const

const infoChipStyle = {
  display: 'grid',
  gap: spacing['4'],
  padding: spacing['12'],
  borderRadius: radius.xl,
  backgroundColor: colors.surfaceMuted,
  border: `1px solid ${colors.border}`,
} as const

const infoChipLabelStyle = {
  color: colors.textSecondary,
  fontSize: typography.xs,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
} as const

const infoChipValueStyle = {
  color: colors.textPrimary,
  fontSize: typography.sm,
  fontWeight: Number(fontWeights.semibold),
  lineHeight: 1.45,
} as const
