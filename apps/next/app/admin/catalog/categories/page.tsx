'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  Edit,
  EyeOff,
  Trash2,
  X,
  FolderTree,
} from 'lucide-react'
import { apiClient } from '../../../apiClient'
import type { AdminCategoryRecord } from '@real/app/lib/types'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  AdminFormScaffold,
  Button,
  Field,
  PageContainer,
  Panel,
  Section,
  SelectInput,
  StatusPill,
  TextAreaInput,
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

// ─── Slide-over ─────────────────────────────────────────────────────────────

function CategorySlideOver({
  record,
  categories,
  onClose,
  onSave,
}: {
  record: Partial<AdminCategoryRecord> | null
  categories: AdminCategoryRecord[]
  onClose: () => void
  onSave: (data: Partial<AdminCategoryRecord>) => Promise<void>
}) {
  const isEdit = Boolean(record?.id)
  const [form, setForm] = useState<Partial<AdminCategoryRecord>>(record ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(record ?? {})
  }, [record])

  const set = (key: keyof AdminCategoryRecord, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.nameEn?.trim()) {
      setError('English name is required')
      return
    }
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

  const parents = categories.filter((c) => c.id !== form.id && !c.parentId)

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
          width: 480,
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
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="admin-focus-ring"
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

        <div
          style={{ flex: 1, overflowY: 'auto', padding: `${spacing['24']}px` }}
        >
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            <Field label="Name (English)">
              <TextInput
                value={form.nameEn ?? ''}
                onChange={(e) => set('nameEn', e.target.value)}
                placeholder="e.g. Skincare"
              />
            </Field>
            <Field label="Name (Arabic)">
              <TextInput
                value={form.nameAr ?? ''}
                onChange={(e) => set('nameAr', e.target.value)}
                placeholder="بعربي"
                dir="rtl"
              />
            </Field>
            <Field label="Slug">
              <TextInput
                value={form.slug ?? ''}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated"
              />
            </Field>
            <Field label="Parent Category">
              <SelectInput
                value={form.parentId ?? ''}
                onChange={(e) =>
                  set(
                    'parentId',
                    (e.target.value || undefined) as string | undefined,
                  )
                }
              >
                <option value="">None (root)</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameEn}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput
                value={form.status ?? 'visible'}
                onChange={(e) =>
                  set('status', e.target.value as 'visible' | 'hidden')
                }
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </SelectInput>
            </Field>
            <Field label="Sort Order">
              <TextInput
                type="number"
                value={String(form.sortOrder ?? 0)}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
              />
            </Field>
            <Field label="Meta Title" hint="SEO — optional">
              <TextInput
                value={form.metaTitle ?? ''}
                onChange={(e) => set('metaTitle', e.target.value)}
              />
            </Field>
            <Field label="Meta Description" hint="SEO — optional">
              <TextAreaInput
                value={form.metaDescription ?? ''}
                onChange={(e) => set('metaDescription', e.target.value)}
              />
            </Field>
            {form.sourceId && (
              <Field label="Source ID">
                <TextInput
                  value={form.sourceId}
                  readOnly
                  style={{
                    backgroundColor: colors.surfaceMuted,
                    color: colors.textSecondary,
                  }}
                />
              </Field>
            )}
            {error && (
              <p
                style={{
                  margin: 0,
                  color: colors.danger,
                  fontSize: typography.sm,
                }}
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            padding: `${spacing['16']}px ${spacing['24']}px`,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: spacing['8'],
            justifyContent: 'flex-end',
          }}
        >
          <Button tone="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            tone="primary"
            onClick={() => {
              void handleSave()
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Tree row ────────────────────────────────────────────────────────────────

function CategoryTreeRow({
  record,
  depth,
  children,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  record: AdminCategoryRecord
  depth: number
  children?: React.ReactNode
  onEdit: (r: AdminCategoryRecord) => void
  onToggleStatus: (r: AdminCategoryRecord) => void
  onDelete: (r: AdminCategoryRecord) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = Boolean(children)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing['8'],
          paddingBlock: spacing['8'],
          paddingInlineStart: depth * 24 + spacing['8'],
          paddingInlineEnd: spacing['8'],
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="admin-focus-ring"
          style={{
            border: 0,
            background: 'transparent',
            cursor: hasChildren ? 'pointer' : 'default',
            color: colors.textSecondary,
            padding: 0,
            width: 20,
            flexShrink: 0,
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : null}
        </button>

        <FolderTree
          size={16}
          color={colors.textSecondary}
          style={{ flexShrink: 0 }}
        />

        <span
          style={{
            flex: 1,
            fontSize: typography.sm,
            fontWeight: Number(fontWeights.medium),
            color: colors.textPrimary,
          }}
        >
          {record.nameEn}
        </span>

        <span
          style={{
            fontSize: typography.xs,
            color: colors.textSecondary,
            minWidth: 80,
          }}
        >
          /{record.slug}
        </span>

        <span
          style={{
            fontSize: typography.xs,
            color: colors.textSecondary,
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.full,
            padding: `2px ${spacing['8']}px`,
            minWidth: 40,
            textAlign: 'center',
          }}
        >
          {record.productCount}
        </span>

        <StatusPill tone={record.status === 'visible' ? 'success' : 'neutral'}>
          {record.status}
        </StatusPill>

        {record.sourceId && (
          <span
            style={{
              fontSize: typography.xs,
              color: colors.info,
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.full,
              padding: `2px ${spacing['8']}px`,
            }}
          >
            synced
          </span>
        )}

        <div style={{ display: 'flex', gap: spacing['4'] }}>
          <button
            type="button"
            onClick={() => onEdit(record)}
            style={iconBtnStyle}
            title="Edit"
            className="admin-focus-ring"
          >
            <Edit size={14} color={colors.textSecondary} />
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(record)}
            style={iconBtnStyle}
            title={record.status === 'visible' ? 'Hide' : 'Show'}
            className="admin-focus-ring"
          >
            <EyeOff size={14} color={colors.textSecondary} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(record)}
            style={iconBtnStyle}
            title="Delete"
            className="admin-focus-ring"
          >
            <Trash2 size={14} color={colors.danger} />
          </button>
        </div>
      </div>
      {hasChildren && expanded ? <div>{children}</div> : null}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [slideOver, setSlideOver] = useState<
    Partial<AdminCategoryRecord> | undefined
  >(undefined)
  const [notice, setNotice] = useState<{
    tone: 'danger' | 'success' | 'warning'
    message: string
  } | null>(null)

  const load = async () => {
    try {
      const res = await apiClient.admin.listCategories()
      setCategories(res.categories)
      setNotice(null)
    } catch (err) {
      setNotice({
        tone: 'danger',
        message:
          err instanceof Error ? err.message : 'Failed to load categories.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setNotice(null)
    try {
      const res = await apiClient.admin.syncCategories()
      await load()
      setNotice({
        tone: 'success',
        message: `Sync complete: ${res.synced.created} created, ${res.synced.updated} updated.`,
      })
    } catch {
      setNotice({ tone: 'danger', message: 'Sync failed. Please try again.' })
    } finally {
      setSyncing(false)
    }
  }

  const handleSave = async (data: Partial<AdminCategoryRecord>) => {
    if (data.id) {
      const res = await apiClient.admin.updateCategory(data.id, data)
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? res.category : c)),
      )
    } else {
      const res = await apiClient.admin.createCategory(data)
      setCategories((prev) => [...prev, res.category])
    }
  }

  const handleToggleStatus = async (record: AdminCategoryRecord) => {
    const next: 'visible' | 'hidden' =
      record.status === 'visible' ? 'hidden' : 'visible'
    const res = await apiClient.admin.updateCategory(record.id, {
      status: next,
    })
    setCategories((prev) =>
      prev.map((c) => (c.id === record.id ? res.category : c)),
    )
  }

  const handleDelete = async (record: AdminCategoryRecord) => {
    if (record.productCount > 0) {
      setNotice({
        tone: 'warning',
        message: `Cannot delete "${record.nameEn}" because ${record.productCount} products are assigned.`,
      })
      return
    }
    if (!confirm(`Delete "${record.nameEn}"?`)) return
    await apiClient.admin.deleteCategory(record.id)
    setCategories((prev) => prev.filter((c) => c.id !== record.id))
  }

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          !search ||
          c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.includes(search.toLowerCase()),
      ),
    [categories, search],
  )

  const roots = filtered.filter((c) => !c.parentId)
  const childrenOf = (parentId: string) =>
    filtered.filter((c) => c.parentId === parentId)
  const visibleCount = filtered.filter((c) => c.status === 'visible').length
  const hiddenCount = filtered.filter((c) => c.status === 'hidden').length

  function renderTree(
    records: AdminCategoryRecord[],
    depth = 0,
  ): React.ReactNode {
    return records.map((record) => {
      const kids = childrenOf(record.id)
      return (
        <CategoryTreeRow
          key={record.id}
          record={record}
          depth={depth}
          onEdit={(r) => setSlideOver(r)}
          onToggleStatus={(r) => {
            void handleToggleStatus(r)
          }}
          onDelete={(r) => {
            void handleDelete(r)
          }}
        >
          {kids.length > 0 ? renderTree(kids, depth + 1) : undefined}
        </CategoryTreeRow>
      )
    })
  }

  return (
    <PageContainer>
      <Section>
        <AdminFormScaffold
          title="Categories"
          subtitle="Organize your storefront taxonomy in a simple tree for non-technical admins."
          notice={
            notice ? { tone: notice.tone, message: notice.message } : undefined
          }
          actions={
            <>
              <Button
                tone="secondary"
                onClick={() => {
                  void handleSync()
                }}
                disabled={syncing}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing['4'],
                  }}
                >
                  <RefreshCw size={14} />
                  {syncing ? 'Syncing...' : 'Sync from Source'}
                </span>
              </Button>
              <Button tone="primary" onClick={() => setSlideOver({})}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing['4'],
                  }}
                >
                  <Plus size={14} />
                  Add Category
                </span>
              </Button>
            </>
          }
        >
          <Panel density="dense">
            <div style={{ display: 'grid', gap: spacing['12'] }}>
              <TextInput
                type="search"
                placeholder="Search by category name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 360 }}
              />
              <div
                style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}
              >
                <StatusPill tone="neutral">Total: {filtered.length}</StatusPill>
                <StatusPill tone="success">Visible: {visibleCount}</StatusPill>
                <StatusPill tone="warning">Hidden: {hiddenCount}</StatusPill>
              </div>
            </div>
          </Panel>

          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: cardRadius,
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing['8'],
                paddingBlock: spacing['8'],
                paddingInline: spacing['8'],
                backgroundColor: colors.surfaceMuted,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span style={{ width: 20, flexShrink: 0 }} />
              <span style={{ width: 20, flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Name
              </span>
              <span
                style={{
                  width: 120,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Slug
              </span>
              <span
                style={{
                  width: 60,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textAlign: 'center',
                }}
              >
                Products
              </span>
              <span
                style={{
                  width: 80,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Status
              </span>
              <span
                style={{
                  width: 60,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Source
              </span>
              <span style={{ width: 80 }} />
            </div>

            {loading ? (
              <p
                style={{
                  padding: spacing['24'],
                  margin: 0,
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                }}
              >
                Loading...
              </p>
            ) : roots.length === 0 ? (
              <div
                style={{
                  padding: spacing['32'],
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                }}
              >
                No categories yet.{' '}
                <button
                  type="button"
                  onClick={() => setSlideOver({})}
                  className="admin-focus-ring"
                  style={{
                    border: 0,
                    background: 'none',
                    color: colors.brandPrimary,
                    cursor: 'pointer',
                    fontSize: typography.sm,
                  }}
                >
                  Add one
                </button>{' '}
                or{' '}
                <button
                  type="button"
                  onClick={() => {
                    void handleSync()
                  }}
                  className="admin-focus-ring"
                  style={{
                    border: 0,
                    background: 'none',
                    color: colors.brandPrimary,
                    cursor: 'pointer',
                    fontSize: typography.sm,
                  }}
                >
                  sync from source
                </button>
                .
              </div>
            ) : (
              renderTree(roots)
            )}
          </div>
        </AdminFormScaffold>
      </Section>

      {slideOver !== undefined && (
        <CategorySlideOver
          record={slideOver}
          categories={categories}
          onClose={() => setSlideOver(undefined)}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  )
}
