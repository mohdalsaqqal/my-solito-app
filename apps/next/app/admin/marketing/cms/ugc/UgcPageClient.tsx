'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Save, Plus, Trash2, Image } from 'lucide-react'
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
import { UGC_COPY } from './ugc.copy'

interface UGCItem {
  id: string
  imageUrl: string
  caption: string
  sourceHandle: string
  active: boolean
  order: number
}

interface UGCState {
  items: UGCItem[]
}

const ugcAdminTokens = {
  toggleThumbColor: colors.white,
  toggleThumbShadow: elevation.xs,
} as const

function emptyState(): UGCState {
  return { items: [] }
}

function newId(): string {
  return String(Date.now()) + String(Math.random()).slice(2)
}

function newUGCItem(order: number): UGCItem {
  return {
    id: newId(),
    imageUrl: '',
    caption: '',
    sourceHandle: '',
    active: true,
    order,
  }
}

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
  display: 'flex',
  flexDirection: 'column',
  gap: spacing['12'],
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: typography.base,
  fontWeight: Number(fontWeights.semibold),
  color: colors.textPrimary,
}

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
            backgroundColor: ugcAdminTokens.toggleThumbColor,
            transition: 'left 0.2s',
            boxShadow: ugcAdminTokens.toggleThumbShadow,
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

function UGCItemCard({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: UGCItem
  index: number
  onUpdate: (patch: Partial<UGCItem>) => void
  onDelete: () => void
}) {
  return (
    <div style={itemCardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing['8'],
            fontSize: typography.xs,
            fontWeight: Number(fontWeights.medium),
            color: colors.textSecondary,
          }}
        >
          <Image size={12} />
          {UGC_COPY.photoLabel} {index + 1}
        </span>
        <DeleteButton onClick={onDelete} />
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: spacing['4'] }}>
        <FieldLabel>{UGC_COPY.imageUrl}</FieldLabel>
        <input
          type="url"
          value={item.imageUrl}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder={UGC_COPY.imageUrlPlaceholder}
          style={inputStyle}
        />
      </label>

      {item.imageUrl ? (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={UGC_COPY.previewAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          gap: spacing['12'],
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: spacing['4'], flex: 2 }}>
          <FieldLabel>{UGC_COPY.caption}</FieldLabel>
          <input
            type="text"
            value={item.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder={UGC_COPY.captionPlaceholder}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: spacing['4'], flex: 1 }}>
          <FieldLabel>{UGC_COPY.sourceHandle}</FieldLabel>
          <input
            type="text"
            value={item.sourceHandle}
            onChange={(e) => onUpdate({ sourceHandle: e.target.value })}
            placeholder={UGC_COPY.sourceHandlePlaceholder}
            style={inputStyle}
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing['24'],
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: spacing['4'] }}>
          <FieldLabel>{UGC_COPY.displayOrder}</FieldLabel>
          <input
            type="number"
            min={0}
            step={1}
            value={item.order}
            onChange={(e) => onUpdate({ order: Number(e.target.value) })}
            style={{ ...inputStyle, maxWidth: 100 }}
          />
        </label>
        <ToggleSwitch
          checked={item.active}
          onChange={(v) => onUpdate({ active: v })}
          label={UGC_COPY.showOnHomepage}
        />
      </div>
    </div>
  )
}

export default function AdminCmsUgcPageClient() {
  const [state, setState] = useState<UGCState>(emptyState())
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
      const nextState = await apiClient.admin.getCmsUgc()
      setState(nextState ?? emptyState())
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : UGC_COPY.loadError)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      const nextState = await apiClient.admin.updateCmsUgc(state)
      setState(nextState ?? state)
      setSuccessMsg(UGC_COPY.success)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : UGC_COPY.saveError)
    } finally {
      setSaving(false)
    }
  }

  function updateItem(id: string, patch: Partial<UGCItem>) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))
  }

  function deleteItem(id: string) {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  function addItem() {
    const maxOrder = state.items.reduce((m, i) => Math.max(m, i.order), -1)
    setState((prev) => ({
      ...prev,
      items: [...prev.items, newUGCItem(maxOrder + 1)],
    }))
  }

  return (
    <PageContainer>
      <PageHeader
        title={UGC_COPY.title}
        subtitle={UGC_COPY.subtitle}
        actions={
          <Button tone="primary" onClick={() => void handleSave()} disabled={saving || loading}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
              <Save size={14} />
              {saving ? UGC_COPY.saving : UGC_COPY.save}
            </span>
          </Button>
        }
      />

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
        <Section>
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
              <h2 style={sectionTitleStyle}>
                {UGC_COPY.photos}
                <span
                  style={{
                    marginLeft: spacing['8'],
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.regular),
                    color: colors.textSecondary,
                  }}
                >
                  ({state.items.length} total, {state.items.filter((i) => i.active).length} active)
                </span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['12'] }}>
              {state.items.length === 0 ? (
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
                  {UGC_COPY.noPhotos}
                </div>
              ) : (
                state.items.map((item, idx) => (
                  <UGCItemCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onUpdate={(patch) => updateItem(item.id, patch)}
                    onDelete={() => deleteItem(item.id)}
                  />
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
              {UGC_COPY.addPhoto}
            </button>
          </Panel>
        </Section>
      )}
    </PageContainer>
  )
}
