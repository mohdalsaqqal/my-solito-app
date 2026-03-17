'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Filter } from 'lucide-react'
import {
  AdminJobRecord,
  AdminListInput,
  ProductDetail,
  ProductRow,
  ProductUpsertInput,
} from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import { AdminEntityListPage } from '../../_components/AdminEntityListPage'
import { DetailEmptyState, formatDateTime, formatMoney, formatPercent, JobNoticePanel, valueOrDash } from '../../_components/AdminHelpers'
import {
  Button,
  EditorShell,
  Field,
  InfoGrid,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '../../_components/AdminPagePrimitives'

const defaultColumns = ['title', 'image', 'brand', 'category', 'price', 'inventory', 'status', 'sku', 'vendor', 'updatedAt']

const emptyDraft: ProductUpsertInput = {
  title: '',
  brand: '',
  category: '',
  price: 0,
  comparePrice: 0,
  inventory: 0,
  status: 'draft',
  sku: '',
  image: '',
  vendor: '',
  description: '',
  currency: 'USD',
  sales: 0,
  variantCount: 1,
  customFields: {
    supplier_code: '',
    erp_margin: 0,
  },
}

function toDraft(detail: ProductDetail): ProductUpsertInput {
  return {
    title: detail.title,
    brand: detail.brand ?? '',
    category: detail.category ?? '',
    price: detail.price ?? 0,
    comparePrice: detail.comparePrice ?? 0,
    inventory: detail.inventory ?? 0,
    status: detail.status ?? 'draft',
    sku: detail.sku ?? '',
    image: detail.image ?? '',
    vendor: detail.vendor ?? '',
    description: detail.description ?? '',
    currency: detail.currency ?? 'USD',
    sales: detail.sales ?? 0,
    variantCount: detail.variantCount ?? 1,
    customFields: {
      supplier_code: String(detail.customFields?.supplier_code ?? ''),
      erp_margin: Number(detail.customFields?.erp_margin ?? 0),
    },
  }
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

type ProductManagementPageProps = {
  title: string
  subtitle?: string
  forcedFilters?: Record<string, unknown>
  createEnabled?: boolean
}

export function ProductManagementPage({
  title,
  subtitle,
  forcedFilters,
  createEnabled = true,
}: ProductManagementPageProps) {
  const router = useRouter()
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ProductDetail | null>(null)
  const [draft, setDraft] = useState<ProductUpsertInput>(emptyDraft)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [latestJob, setLatestJob] = useState<AdminJobRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadProduct = async (id: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    setIsCreateMode(false)
    setActiveProductId(id)
    try {
      const response = await apiClient.admin.getProduct(id)
      setDetail(response)
      setDraft(toDraft(response))
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load product detail.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const startCreate = () => {
    setIsCreateMode(true)
    setActiveProductId(null)
    setDetail(null)
    setDetailError(null)
    setDraft({
      ...emptyDraft,
      customFields: { ...emptyDraft.customFields },
    })
  }

  const saveProduct = async () => {
    setSaving(true)
    setDetailError(null)
    try {
      const next = isCreateMode
        ? await apiClient.admin.createProduct(draft)
        : await apiClient.admin.updateProduct(activeProductId ?? '', draft)
      setDetail(next)
      setDraft(toDraft(next))
      setActiveProductId(next.id)
      setIsCreateMode(false)
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to save product.')
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (id: string, action: 'activate' | 'deactivate' | 'archive') => {
    try {
      const next = await apiClient.admin.runProductAction(id, { action })
      if (activeProductId === id) {
        setDetail(next)
        setDraft(toDraft(next))
      }
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to update product status.')
    }
  }

  const createJob = async (input: {
    type: AdminJobRecord['type']
    summary: string
    targetIds?: string[]
    data?: Record<string, unknown>
  }) => {
    const job = await apiClient.admin.createJob({
      type: input.type,
      entity: 'products',
      summary: input.summary,
      targetIds: input.targetIds,
      input: input.data,
    })
    setLatestJob(job)
    return job
  }

  const detailPanel = (
    <>
      <JobNoticePanel job={latestJob} onOpen={(id) => router.push(`/admin/operations/jobs?job=${encodeURIComponent(id)}`)} />
      <EditorShell
        title={isCreateMode ? 'Create Product' : detail?.title ?? 'Product Workspace'}
        subtitle={subtitle ?? 'Canonical product editor with backend-safe fields and custom attributes.'}
        actions={
          <>
            {detail && !isCreateMode ? (
              <Button tone='secondary' onClick={() => void runAction(detail.id, detail.status === 'active' ? 'archive' : 'activate')}>
                {detail.status === 'active' ? 'Archive' : 'Activate'}
              </Button>
            ) : null}
            <Button tone='primary' onClick={() => void saveProduct()} disabled={saving || (!isCreateMode && !activeProductId)}>
              {saving ? 'Saving...' : isCreateMode ? 'Create Product' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading product detail...</div>
        ) : !isCreateMode && !detail ? (
          <DetailEmptyState
            title='No product selected'
            description='Choose a row to inspect or edit the canonical product record.'
          />
        ) : (
          <>
            {detailError ? (
              <div style={{ color: colors.danger, fontSize: typography.sm }}>{detailError}</div>
            ) : null}
            <InfoGrid
              rows={[
                { label: 'Product ID', value: valueOrDash(detail?.id ?? activeProductId) },
                { label: 'Status', value: valueOrDash(draft.status) },
                { label: 'Updated', value: formatDateTime(detail?.updatedAt) },
                { label: 'Sales', value: formatMoney(draft.sales, draft.currency) },
                { label: 'ERP Margin', value: formatPercent(Number(draft.customFields?.erp_margin ?? 0)) },
              ]}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: spacing['12'],
              }}
            >
              <Field label='Title'>
                <TextInput value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} />
              </Field>
              <Field label='SKU'>
                <TextInput value={draft.sku ?? ''} onChange={(event) => setDraft((prev) => ({ ...prev, sku: event.target.value }))} />
              </Field>
              <Field label='Brand'>
                <TextInput value={draft.brand ?? ''} onChange={(event) => setDraft((prev) => ({ ...prev, brand: event.target.value }))} />
              </Field>
              <Field label='Category'>
                <TextInput value={draft.category ?? ''} onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))} />
              </Field>
              <Field label='Vendor'>
                <TextInput value={draft.vendor ?? ''} onChange={(event) => setDraft((prev) => ({ ...prev, vendor: event.target.value }))} />
              </Field>
              <Field label='Status'>
                <SelectInput value={draft.status ?? 'draft'} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value='draft'>Draft</option>
                  <option value='active'>Active</option>
                  <option value='archived'>Archived</option>
                </SelectInput>
              </Field>
              <Field label='Price'>
                <TextInput type='number' value={String(draft.price ?? 0)} onChange={(event) => setDraft((prev) => ({ ...prev, price: toNumber(event.target.value) }))} />
              </Field>
              <Field label='Compare Price'>
                <TextInput type='number' value={String(draft.comparePrice ?? 0)} onChange={(event) => setDraft((prev) => ({ ...prev, comparePrice: toNumber(event.target.value) }))} />
              </Field>
              <Field label='Inventory'>
                <TextInput type='number' value={String(draft.inventory ?? 0)} onChange={(event) => setDraft((prev) => ({ ...prev, inventory: toNumber(event.target.value) }))} />
              </Field>
              <Field label='Variants'>
                <TextInput type='number' value={String(draft.variantCount ?? 1)} onChange={(event) => setDraft((prev) => ({ ...prev, variantCount: toNumber(event.target.value) }))} />
              </Field>
              <Field label='Supplier Code'>
                <TextInput
                  value={String(draft.customFields?.supplier_code ?? '')}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      customFields: {
                        ...(prev.customFields ?? {}),
                        supplier_code: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label='ERP Margin'>
                <TextInput
                  type='number'
                  step='0.01'
                  value={String(draft.customFields?.erp_margin ?? 0)}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      customFields: {
                        ...(prev.customFields ?? {}),
                        erp_margin: toNumber(event.target.value),
                      },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label='Description'>
              <TextAreaInput value={draft.description ?? ''} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} />
            </Field>
            {detail?.sourceColumns?.length ? (
              <InfoGrid
                rows={detail.sourceColumns.map((column) => ({
                  label: column,
                  value: column.startsWith('custom.')
                    ? String(detail.customFields?.[column.slice('custom.'.length)] ?? '-')
                    : 'Available',
                }))}
              />
            ) : null}
          </>
        )}
      </EditorShell>
    </>
  )

  return (
    <AdminEntityListPage<ProductRow>
      title={title}
      entity='products'
      defaultColumns={defaultColumns}
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' },
          ],
        },
        { key: 'brand', label: 'Brand', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'vendor', label: 'Vendor', type: 'text' },
        { key: 'lowStock', label: 'Low Stock', type: 'boolean' },
      ]}
      bulkActions={[
        { key: 'activate', label: 'Activate', capabilityPath: 'products.bulkEdit' },
        { key: 'deactivate', label: 'Deactivate', capabilityPath: 'products.bulkEdit' },
        { key: 'archive', label: 'Archive', capabilityPath: 'products.bulkEdit' },
        { key: 'assign-category', label: 'Assign Category', capabilityPath: 'products.bulkEdit' },
        { key: 'assign-vendor', label: 'Assign Vendor', capabilityPath: 'products.bulkEdit' },
        { key: 'export', label: 'Export Selected' },
      ]}
      filterHeaderSlot={
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['8'] }}>
          {/* Row 1: status pill tabs + filter toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing['8'] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
              {(['', 'active', 'draft', 'archived'] as const).map((value) => {
                const label = value === '' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)
                const isActive = statusFilter === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    style={{
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      borderRadius: radius.full,
                      border: `1px solid ${isActive ? colors.brandPrimary : colors.border}`,
                      backgroundColor: isActive ? colors.brandPrimary : 'transparent',
                      color: isActive ? colors.white : colors.textSecondary,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.medium),
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing['8'],
                padding: `${spacing['8']}px ${spacing['12']}px`,
                borderRadius: radius.xl,
                border: `1px solid ${colors.border}`,
                backgroundColor: showFilters ? colors.surfaceMuted : 'transparent',
                color: colors.textSecondary,
                fontSize: typography.xs,
                fontWeight: Number(fontWeights.medium),
                cursor: 'pointer',
              }}
            >
              <Filter size={12} color={colors.textSecondary} />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>
      }
      hideAutoFilters={!showFilters}
      fetchRows={(input: AdminListInput) =>
        apiClient.admin.listProducts({
          ...input,
          filters: {
            ...(input.filters ?? {}),
            ...(forcedFilters ?? {}),
            ...(statusFilter ? { status: statusFilter } : {}),
          },
        })
      }
      fetchFields={() => apiClient.admin.productFields()}
      renderCell={(row, key) => {
        if (key === 'image') {
          if (row.image) {
            return (
              <img
                src={row.image}
                alt={row.title}
                width={40}
                height={40}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  objectFit: 'cover',
                  display: 'block',
                  border: `1px solid ${colors.border}`,
                }}
              />
            )
          }
          const initial = (row.title ?? '?').charAt(0).toUpperCase()
          return (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceMuted,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textSecondary,
                fontSize: typography.sm,
                fontWeight: Number(fontWeights.medium),
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )
        }
        if (key === 'inventory') {
          const qty = Number((row as Record<string, unknown>).inventory ?? -1)
          let dotColor: string = colors.success
          let label = 'In stock'
          if (qty === 0) {
            dotColor = colors.danger
            label = 'Out'
          } else if (qty > 0 && qty <= 10) {
            dotColor = colors.warning
            label = 'Low'
          } else if (qty < 0) {
            return String((row as Record<string, unknown>).inventory ?? '-')
          }
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: radius.full,
                  backgroundColor: dotColor,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{label}</span>
              <span style={{ color: colors.textPrimary, fontSize: typography.sm }}>{qty}</span>
            </span>
          )
        }
        if (key.startsWith('custom.')) return String(row.customFields?.[key.slice('custom.'.length)] ?? '-')
        if (key === 'price' || key === 'comparePrice') return formatMoney(row[key], 'USD')
        if (key === 'updatedAt') return formatDateTime(row.updatedAt)
        return String((row as Record<string, unknown>)[key] ?? '-')
      }}
      rowActions={(row) => (
        <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Button tone='ghost' onClick={() => void loadProduct(row.id)}>
            View
          </Button>
          <Button tone='secondary' onClick={() => void runAction(row.id, row.status === 'active' ? 'archive' : 'activate')}>
            {row.status === 'active' ? 'Archive' : 'Activate'}
          </Button>
        </div>
      )}
      onBulkAction={async (actionKey, selectedIds) => {
        const jobType = actionKey === 'export' ? 'export' : 'bulk-update'
        await createJob({
          type: jobType,
          targetIds: selectedIds,
          summary: `Products ${actionKey} (${selectedIds.length} selected)`,
          data: { action: actionKey, selectedIds },
        })
      }}
      onExportJob={async () => {
        await createJob({
          type: 'export',
          summary: `Products export (${forcedFilters ? 'scoped' : 'all results'})`,
          data: { filters: forcedFilters ?? null },
        })
      }}
      pageActions={
        createEnabled ? (
          <Button tone='primary' onClick={startCreate}>
            Add Product
          </Button>
        ) : undefined
      }
      detailPanel={detailPanel}
      refreshKey={refreshKey}
      rowStatus={(row) =>
        row.status
          ? {
              tone:
                row.status === 'active'
                  ? 'success'
                  : row.status === 'draft'
                    ? 'warning'
                    : row.status === 'archived'
                      ? 'danger'
                      : 'neutral',
              label: row.status,
            }
          : null
      }
    />
  )
}
