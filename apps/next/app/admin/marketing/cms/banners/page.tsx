'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Save, Plus, Trash2 } from 'lucide-react'
import { colors, elevation, spacing, typography, fontWeights, radius, status } from '@real/tokens'
import {
  Button,
  PageContainer,
  PageHeader,
  Panel,
  Section,
} from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'
import { apiClient } from '../../../../apiClient'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TickerItem {
  id: string
  messageEn: string
  messageAr: string
  active: boolean
}

interface EducationBanner {
  id: string
  titleEn: string
  titleAr: string
  bodyEn: string
  bodyAr: string
  targetPage: string
  active: boolean
}

interface BannersState {
  ticker: {
    items: TickerItem[]
    speedMs: number
  }
  educationBanners: EducationBanner[]
}

const adminBannersTokens = {
  toggleThumbColor: colors.white,
  toggleThumbShadow: elevation.xs,
} as const

const UI_STRINGS = {
  ticker: 'Ticker',
  cycleSpeedMs: 'Cycle Speed (ms)',
  messageEn: 'Message (EN)',
  messageAr: 'Message (AR)',
  educationBanners: 'Education Banners',
  titleEn: 'Title (EN)',
  titleAr: 'Title (AR)',
  bodyEn: 'Body (EN)',
  bodyAr: 'Body (AR)',
  targetPage: 'Target Page',
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyState(): BannersState {
  return {
    ticker: { items: [], speedMs: 4000 },
    educationBanners: [],
  }
}

function newId(): string {
  return String(Date.now()) + String(Math.random()).slice(2)
}

function newTickerItem(): TickerItem {
  return { id: newId(), messageEn: '', messageAr: '', active: true }
}

function newEducationBanner(): EducationBanner {
  return { id: newId(), titleEn: '', titleAr: '', bodyEn: '', bodyAr: '', targetPage: '', active: true }
}

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xl,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  lineHeight: 1.4,
  padding: `${spacing['8']}px ${spacing['12']}px`,
  outline: 'none',
  boxSizing: 'border-box',
}

const fieldLabelStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.medium),
}

const itemCardStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xl,
  padding: `${spacing['16']}px`,
  backgroundColor: colors.background,
  display: 'grid',
  gap: spacing['12'],
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: typography.base,
  fontWeight: Number(fontWeights.semibold),
  color: colors.textPrimary,
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span style={fieldLabelStyle}>{children}</span>
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing['8'],
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: radius.full,
          backgroundColor: checked ? colors.brandPrimary : colors.border,
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: adminBannersTokens.toggleThumbColor,
            transition: 'left 0.2s',
            boxShadow: adminBannersTokens.toggleThumbShadow,
          }}
        />
      </div>
      <span style={{ fontSize: typography.sm, color: colors.textSecondary }}>{label}</span>
    </label>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        backgroundColor: 'transparent',
        color: colors.textSecondary,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Trash2 size={14} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Ticker section
// ---------------------------------------------------------------------------

function TickerSection({
  ticker,
  onChange,
}: {
  ticker: BannersState['ticker']
  onChange: (t: BannersState['ticker']) => void
}) {
  function updateItem(id: string, patch: Partial<TickerItem>) {
    onChange({
      ...ticker,
      items: ticker.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  function deleteItem(id: string) {
    onChange({ ...ticker, items: ticker.items.filter((item) => item.id !== id) })
  }

  function addItem() {
    onChange({ ...ticker, items: [...ticker.items, newTickerItem()] })
  }

  return (
    <Panel>
      <div
        style={{
          marginBottom: spacing['16'],
          paddingBottom: spacing['12'],
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={sectionTitleStyle}>{UI_STRINGS.ticker}</h2>
      </div>

      {/* Speed control */}
      <div style={{ display: 'grid', gap: spacing['4'], marginBottom: spacing['20'] }}>
        <FieldLabel>{UI_STRINGS.cycleSpeedMs}</FieldLabel>
        <input
          type="number"
          min={500}
          step={500}
          value={ticker.speedMs}
          onChange={(e) => onChange({ ...ticker, speedMs: Number(e.target.value) })}
          style={{ ...inputStyle, maxWidth: 160 }}
        />
      </div>

      {/* Ticker items */}
      <div style={{ display: 'grid', gap: spacing['12'] }}>
        {ticker.items.length === 0 ? (
          <div
            style={{
              padding: `${spacing['24']}px`,
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: typography.sm,
              border: `1px dashed ${colors.border}`,
              borderRadius: radius.xl,
            }}
          >
            No ticker items yet. Add one below.
          </div>
        ) : (
          ticker.items.map((item, idx) => (
            <div key={item.id} style={itemCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.medium),
                    color: colors.textSecondary,
                  }}
                >
                  Item {idx + 1}
                </span>
                <DeleteButton onClick={() => deleteItem(item.id)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.messageEn}</FieldLabel>
                  <input
                    value={item.messageEn}
                    onChange={(e) => updateItem(item.id, { messageEn: e.target.value })}
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.messageAr}</FieldLabel>
                  <input
                    value={item.messageAr}
                    onChange={(e) => updateItem(item.id, { messageAr: e.target.value })}
                    dir="rtl"
                    style={inputStyle}
                  />
                </label>
              </div>

              <ToggleSwitch
                checked={item.active}
                onChange={(v) => updateItem(item.id, { active: v })}
                label="Active"
              />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addItem}
        style={{
          marginTop: spacing['12'],
          display: 'flex',
          alignItems: 'center',
          gap: spacing['8'],
          padding: `${spacing['8']}px ${spacing['16']}px`,
          border: `1px dashed ${colors.border}`,
          borderRadius: radius.xl,
          backgroundColor: 'transparent',
          color: colors.textSecondary,
          fontSize: typography.sm,
          cursor: 'pointer',
        }}
      >
        <Plus size={14} />
        Add Ticker Item
      </button>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Education Banners section
// ---------------------------------------------------------------------------

function EducationBannersSection({
  banners,
  onChange,
}: {
  banners: EducationBanner[]
  onChange: (b: EducationBanner[]) => void
}) {
  function updateBanner(id: string, patch: Partial<EducationBanner>) {
    onChange(banners.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function deleteBanner(id: string) {
    onChange(banners.filter((b) => b.id !== id))
  }

  function addBanner() {
    onChange([...banners, newEducationBanner()])
  }

  return (
    <Panel>
      <div
        style={{
          marginBottom: spacing['16'],
          paddingBottom: spacing['12'],
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <h2 style={sectionTitleStyle}>{UI_STRINGS.educationBanners}</h2>
      </div>

      <div style={{ display: 'grid', gap: spacing['16'] }}>
        {banners.length === 0 ? (
          <div
            style={{
              padding: `${spacing['24']}px`,
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: typography.sm,
              border: `1px dashed ${colors.border}`,
              borderRadius: radius.xl,
            }}
          >
            No education banners yet. Add one below.
          </div>
        ) : (
          banners.map((banner, idx) => (
            <div key={banner.id} style={itemCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.medium),
                    color: colors.textSecondary,
                  }}
                >
                  Banner {idx + 1}
                </span>
                <DeleteButton onClick={() => deleteBanner(banner.id)} />
              </div>

              {/* Title row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.titleEn}</FieldLabel>
                  <input
                    value={banner.titleEn}
                    onChange={(e) => updateBanner(banner.id, { titleEn: e.target.value })}
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.titleAr}</FieldLabel>
                  <input
                    value={banner.titleAr}
                    onChange={(e) => updateBanner(banner.id, { titleAr: e.target.value })}
                    dir="rtl"
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Body row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.bodyEn}</FieldLabel>
                  <textarea
                    value={banner.bodyEn}
                    onChange={(e) => updateBanner(banner.id, { bodyEn: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.bodyAr}</FieldLabel>
                  <textarea
                    value={banner.bodyAr}
                    onChange={(e) => updateBanner(banner.id, { bodyAr: e.target.value })}
                    rows={3}
                    dir="rtl"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </label>
              </div>

              {/* Target page + active */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: spacing['16'],
                  alignItems: 'end',
                }}
              >
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <FieldLabel>{UI_STRINGS.targetPage}</FieldLabel>
                  <input
                    value={banner.targetPage}
                    onChange={(e) => updateBanner(banner.id, { targetPage: e.target.value })}
                    placeholder="/shop, /product/:id, …"
                    style={inputStyle}
                  />
                </label>
                <ToggleSwitch
                  checked={banner.active}
                  onChange={(v) => updateBanner(banner.id, { active: v })}
                  label="Active"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addBanner}
        style={{
          marginTop: spacing['12'],
          display: 'flex',
          alignItems: 'center',
          gap: spacing['8'],
          padding: `${spacing['8']}px ${spacing['16']}px`,
          border: `1px dashed ${colors.border}`,
          borderRadius: radius.xl,
          backgroundColor: 'transparent',
          color: colors.textSecondary,
          fontSize: typography.sm,
          cursor: 'pointer',
        }}
      >
        <Plus size={14} />
        Add Banner
      </button>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminCmsBannersPage() {
  const [state, setState] = useState<BannersState>(emptyState())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const nextState = await apiClient.admin.getCmsBanners()
      setState(nextState ?? emptyState())
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to load banners.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      const nextState = await apiClient.admin.updateCmsBanners(state)
      setState(nextState ?? state)
      setSuccessMsg('Banners saved successfully.')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to save banners.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Ticker & Education Banners"
        subtitle="Manage the scrolling ticker messages and dismissible education banners shown across the storefront."
        actions={
          <Button tone="primary" onClick={() => void handleSave()} disabled={saving || loading}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
              <Save size={14} />
              {saving ? 'Saving…' : 'Save'}
            </span>
          </Button>
        }
      />

      {/* Status messages */}
      {successMsg ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing['8'],
            padding: `${spacing['12']}px ${spacing['16']}px`,
            borderRadius: radius.xl,
            backgroundColor: status.success.subtle,
            border: `1px solid ${status.success.base}`,
            color: status.success.base,
            fontSize: typography.sm,
            marginBottom: spacing['24'],
          }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <AdminErrorState message={errorMsg} onRetry={() => void load()} />
      ) : loading ? (
        <AdminLoadingSkeleton />
      ) : (
        <div style={{ display: 'grid', gap: spacing['24'] }}>
          <Section>
            <TickerSection
              ticker={state.ticker}
              onChange={(ticker) => setState((prev) => ({ ...prev, ticker }))}
            />
          </Section>

          <Section>
            <EducationBannersSection
              banners={state.educationBanners}
              onChange={(educationBanners) => setState((prev) => ({ ...prev, educationBanners }))}
            />
          </Section>
        </div>
      )}
    </PageContainer>
  )
}
