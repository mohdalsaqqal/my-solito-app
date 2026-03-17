'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, RefreshCw, Edit, Trash2, X, LayoutGrid, List } from 'lucide-react'
import { apiClient } from '../../../apiClient'
import type { AdminBrandRecord } from '@real/app/lib/types'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  Button,
  Field,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  SelectInput,
  StatusPill,
  TextAreaInput,
  TextInput,
} from '../../_components/AdminPagePrimitives'

const _cardRadius = radius.xl + 4

const iconBtnStyle = {
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  padding: spacing['4'],
  borderRadius: radius.md,
  display: 'flex',
  alignItems: 'center',
} as const

// ─── Slide-over ─────────────────────────────────────────────────────────────

function BrandSlideOver({
  record,
  onClose,
  onSave,
}: {
  record: Partial<AdminBrandRecord> | null
  onClose: () => void
  onSave: (data: Partial<AdminBrandRecord>) => Promise<void>
}) {
  const isEdit = Boolean(record?.id)
  const [form, setForm] = useState<Partial<AdminBrandRecord>>(record ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setForm(record ?? {}) }, [record])

  const set = (key: keyof AdminBrandRecord, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.nameEn?.trim()) { setError('English name is required'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (record === null) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 480, maxWidth: '100vw',
        height: '100vh', backgroundColor: colors.surface, borderLeft: `1px solid ${colors.border}`,
        zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing['16']}px ${spacing['24']}px`, borderBottom: `1px solid ${colors.border}` }}>
          <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>
            {isEdit ? 'Edit Brand' : 'New Brand'}
          </h2>
          <button type='button' aria-label='Close panel' onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.textSecondary, padding: spacing['4'] }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing['24']}px` }}>
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            {form.logoUrl && (
              <div style={{ width: 80, height: 80, borderRadius: radius.xl, border: `1px solid ${colors.border}`, overflow: 'hidden', backgroundColor: colors.surfaceMuted }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt='logo preview' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <Field label='Logo URL' hint='Square image — used in homepage spotlights'>
              <TextInput value={form.logoUrl ?? ''} onChange={(e) => set('logoUrl', e.target.value)} placeholder='https://...' />
            </Field>
            <Field label='Name (English)'>
              <TextInput value={form.nameEn ?? ''} onChange={(e) => set('nameEn', e.target.value)} />
            </Field>
            <Field label='Name (Arabic)'>
              <TextInput value={form.nameAr ?? ''} onChange={(e) => set('nameAr', e.target.value)} dir='rtl' />
            </Field>
            <Field label='Slug'>
              <TextInput value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} placeholder='auto-generated' />
            </Field>
            <Field label='Description'>
              <TextAreaInput value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field label='Website URL'>
              <TextInput value={form.websiteUrl ?? ''} onChange={(e) => set('websiteUrl', e.target.value)} placeholder='https://...' />
            </Field>
            <Field label='Status'>
              <SelectInput value={form.status ?? 'visible'} onChange={(e) => set('status', e.target.value as 'visible' | 'hidden')}>
                <option value='visible'>Visible</option>
                <option value='hidden'>Hidden</option>
              </SelectInput>
            </Field>
            {form.sourceId && (
              <Field label='Source ID'>
                <TextInput value={form.sourceId} readOnly style={{ backgroundColor: colors.surfaceMuted, color: colors.textSecondary }} />
              </Field>
            )}
            {error && <p style={{ margin: 0, color: colors.danger, fontSize: typography.sm }}>{error}</p>}
          </div>
        </div>

        <div style={{ padding: `${spacing['16']}px ${spacing['24']}px`, borderTop: `1px solid ${colors.border}`, display: 'flex', gap: spacing['8'], justifyContent: 'flex-end' }}>
          <Button tone='ghost' onClick={onClose}>Cancel</Button>
          <Button tone='primary' onClick={() => { void handleSave() }} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Brand'}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Brand Card (grid view) ──────────────────────────────────────────────────

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: AdminBrandRecord
  onEdit: (b: AdminBrandRecord) => void
  onDelete: (b: AdminBrandRecord) => void
}) {
  return (
    <div style={{
      border: `1px solid ${colors.border}`, borderRadius: radius.xl, backgroundColor: colors.surface,
      padding: spacing['16'], display: 'flex', flexDirection: 'column', gap: spacing['8'],
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing['8'] }}>
        <div style={{ width: 48, height: 48, borderRadius: radius.lg, border: `1px solid ${colors.border}`, overflow: 'hidden', backgroundColor: colors.surfaceMuted, flexShrink: 0 }}>
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.nameEn} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: typography.sm, color: colors.textSecondary, fontWeight: Number(fontWeights.semibold) }}>
              {brand.nameEn.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing['4'] }}>
          <button type='button' onClick={() => onEdit(brand)} style={iconBtnStyle} title='Edit'>
            <Edit size={14} color={colors.textSecondary} />
          </button>
          <button type='button' onClick={() => onDelete(brand)} style={iconBtnStyle} title='Delete'>
            <Trash2 size={14} color={colors.danger} />
          </button>
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>{brand.nameEn}</p>
        {brand.nameAr && <p style={{ margin: '2px 0 0', fontSize: typography.xs, color: colors.textSecondary, direction: 'rtl' }}>{brand.nameAr}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>{brand.productCount} products</span>
        <StatusPill tone={brand.status === 'visible' ? 'success' : 'neutral'}>
          {brand.status}
        </StatusPill>
      </div>
      {brand.sourceId && (
        <span style={{ fontSize: typography.xs, color: colors.info, alignSelf: 'flex-start' }}>synced</span>
      )}
    </div>
  )
}

// ─── Brand List Row ──────────────────────────────────────────────────────────

function BrandListRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand: AdminBrandRecord
  onEdit: (b: AdminBrandRecord) => void
  onDelete: (b: AdminBrandRecord) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: spacing['16'],
      paddingBlock: spacing['8'], paddingInline: spacing['16'],
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: radius.md, border: `1px solid ${colors.border}`, overflow: 'hidden', backgroundColor: colors.surfaceMuted, flexShrink: 0 }}>
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt={brand.nameEn} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.semibold) }}>
            {brand.nameEn.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span style={{ flex: 1, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>{brand.nameEn}</span>
      <span style={{ fontSize: typography.xs, color: colors.textSecondary, minWidth: 80 }}>/{brand.slug}</span>
      <span style={{ fontSize: typography.xs, color: colors.textSecondary, minWidth: 60, textAlign: 'center' }}>{brand.productCount}</span>
      <StatusPill tone={brand.status === 'visible' ? 'success' : 'neutral'}>{brand.status}</StatusPill>
      {brand.sourceId && (
        <span style={{ fontSize: typography.xs, color: colors.info, backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: `2px ${spacing['8']}px` }}>synced</span>
      )}
      <div style={{ display: 'flex', gap: spacing['4'] }}>
        <button type='button' onClick={() => onEdit(brand)} style={iconBtnStyle} title='Edit'>
          <Edit size={14} color={colors.textSecondary} />
        </button>
        <button type='button' onClick={() => onDelete(brand)} style={iconBtnStyle} title='Delete'>
          <Trash2 size={14} color={colors.danger} />
        </button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrandRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [slideOver, setSlideOver] = useState<Partial<AdminBrandRecord> | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await apiClient.admin.listBrandsAdmin()
      setBrands(res.brands)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await apiClient.admin.syncBrands()
      await load()
      alert(`Synced: ${res.synced.created} created, ${res.synced.updated} updated`)
    } catch {
      alert('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleSave = async (data: Partial<AdminBrandRecord>) => {
    if (data.id) {
      const res = await apiClient.admin.updateBrand(data.id, data)
      setBrands((prev) => prev.map((b) => b.id === data.id ? res.brand : b))
    } else {
      const res = await apiClient.admin.createBrand(data)
      setBrands((prev) => [...prev, res.brand])
    }
  }

  const handleDelete = async (brand: AdminBrandRecord) => {
    if (brand.productCount > 0) {
      alert(`Cannot delete: ${brand.productCount} products use this brand.`)
      return
    }
    if (!confirm(`Delete "${brand.nameEn}"?`)) return
    await apiClient.admin.deleteBrand(brand.id)
    setBrands((prev) => prev.filter((b) => b.id !== brand.id))
  }

  const filtered = useMemo(() =>
    brands.filter((b) =>
      !search || b.nameEn.toLowerCase().includes(search.toLowerCase()) || b.slug.includes(search.toLowerCase())
    ), [brands, search])

  return (
    <PageContainer>
      <PageHeader
        title='Brands'
        subtitle='Manage your brand catalog. Brands can sync from source and be enriched here.'
        actions={
          <>
            {/* view toggle */}
            <div style={{ display: 'flex', border: `1px solid ${colors.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
              <button
                type='button'
                onClick={() => setViewMode('grid')}
                style={{
                  border: 0, padding: `${spacing['4']}px ${spacing['8']}px`, cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? colors.brandPrimary : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : colors.textSecondary,
                  display: 'flex', alignItems: 'center',
                }}
                title='Grid view'
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type='button'
                onClick={() => setViewMode('list')}
                style={{
                  border: 0, padding: `${spacing['4']}px ${spacing['8']}px`, cursor: 'pointer',
                  backgroundColor: viewMode === 'list' ? colors.brandPrimary : 'transparent',
                  color: viewMode === 'list' ? '#fff' : colors.textSecondary,
                  display: 'flex', alignItems: 'center',
                }}
                title='List view'
              >
                <List size={14} />
              </button>
            </div>
            <Button tone='secondary' onClick={() => { void handleSync() }} disabled={syncing}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
                <RefreshCw size={14} />
                {syncing ? 'Syncing...' : 'Sync from Source'}
              </span>
            </Button>
            <Button tone='primary' onClick={() => setSlideOver({})}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
                <Plus size={14} />
                Add Brand
              </span>
            </Button>
          </>
        }
      />

      {error && <p style={{ color: colors.danger, fontSize: typography.sm }}>{error}</p>}

      <Section>
        <Panel density='dense'>
          <TextInput
            type='search'
            placeholder='Search brands...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </Panel>
      </Section>

      <Section>
        {loading ? (
          <p style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: spacing['32'], textAlign: 'center', color: colors.textSecondary, fontSize: typography.sm, border: `1px solid ${colors.border}`, borderRadius: radius.xl }}>
            No brands yet.{' '}
            <button type='button' onClick={() => setSlideOver({})} style={{ border: 0, background: 'none', color: colors.brandPrimary, cursor: 'pointer', fontSize: typography.sm }}>
              Add one
            </button>{' '}
            or{' '}
            <button type='button' onClick={() => { void handleSync() }} style={{ border: 0, background: 'none', color: colors.brandPrimary, cursor: 'pointer', fontSize: typography.sm }}>
              sync from source
            </button>.
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing['16'] }}>
            {filtered.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={(b) => setSlideOver(b)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['16'], paddingBlock: spacing['8'], paddingInline: spacing['16'], backgroundColor: colors.surfaceMuted, borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ width: 36, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Brand</span>
              <span style={{ width: 120, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Slug</span>
              <span style={{ width: 60, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Products</span>
              <span style={{ width: 80, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
              <span style={{ width: 60 }} />
              <span style={{ width: 56 }} />
            </div>
            {filtered.map((brand) => (
              <BrandListRow
                key={brand.id}
                brand={brand}
                onEdit={(b) => setSlideOver(b)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Section>

      {slideOver !== undefined && (
        <BrandSlideOver
          record={slideOver}
          onClose={() => setSlideOver(undefined)}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  )
}
