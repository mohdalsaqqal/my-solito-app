'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AdminJobRecord, AdminListInput, InventoryDetail, InventoryRow } from '@real/app/lib/types'
import { colors, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import { AdminEntityListPage } from '../../_components/AdminEntityListPage'
import { DetailEmptyState, formatDateTime, JobNoticePanel, valueOrDash } from '../../_components/AdminHelpers'
import {
  Button,
  EditorShell,
  Field,
  InfoGrid,
  Panel,
  SelectInput,
  TableShell,
  TextAreaInput,
  TextInput,
} from '../../_components/AdminPagePrimitives'

type InventoryManagementPageProps = {
  title: string
  subtitle?: string
  defaultColumns: string[]
  forcedFilters?: Record<string, unknown>
}

export function InventoryManagementPage({
  title,
  subtitle,
  defaultColumns,
  forcedFilters,
}: InventoryManagementPageProps) {
  const router = useRouter()
  const [detail, setDetail] = useState<InventoryDetail | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [warehouse, setWarehouse] = useState('')
  const [vendor, setVendor] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('0')
  const [locationNotes, setLocationNotes] = useState('')
  const [latestJob, setLatestJob] = useState<AdminJobRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const hydrateForm = (item: InventoryDetail) => {
    setWarehouse(item.warehouse ?? '')
    setVendor(item.vendor ?? '')
    setLowStockThreshold(String(item.lowStockThreshold ?? 0))
    setLocationNotes(item.locationNotes ?? '')
  }

  const loadInventory = async (id: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    setActiveId(id)
    try {
      const response = await apiClient.admin.getInventory(id)
      setDetail(response)
      hydrateForm(response)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load inventory detail.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const saveInventory = async () => {
    if (!activeId) return
    setSaving(true)
    setDetailError(null)
    try {
      const response = await apiClient.admin.updateInventory(activeId, {
        warehouse,
        vendor,
        lowStockThreshold: Number(lowStockThreshold),
        locationNotes,
      })
      setDetail(response)
      hydrateForm(response)
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to save inventory record.')
    } finally {
      setSaving(false)
    }
  }

  const runInventoryAction = async (id: string, action: 'adjust' | 'transfer', input?: Record<string, unknown>) => {
    try {
      const response = await apiClient.admin.runInventoryAction(id, { action, input })
      if (activeId === id) {
        setDetail(response)
        hydrateForm(response)
      }
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to run inventory action.')
    }
  }

  const queueJob = async (input: {
    type: AdminJobRecord['type']
    summary: string
    targetIds?: string[]
    data?: Record<string, unknown>
  }) => {
    const job = await apiClient.admin.createJob({
      type: input.type,
      entity: 'inventory',
      summary: input.summary,
      targetIds: input.targetIds,
      input: input.data,
    })
    setLatestJob(job)
  }

  const detailPanel = (
    <>
      <JobNoticePanel job={latestJob} onOpen={(id) => router.push(`/admin/operations/jobs?job=${encodeURIComponent(id)}`)} />
      <EditorShell
        title={detail?.sku ?? 'Inventory Workspace'}
        subtitle={subtitle ?? 'Warehouse-aware stock controls with canonical inventory fields.'}
        actions={
          <>
            {detail ? (
              <>
                <Button tone='secondary' onClick={() => void runInventoryAction(detail.id, 'adjust', { quantityDelta: 5 })}>
                  Adjust +5
                </Button>
                <Button
                  tone='secondary'
                  onClick={() =>
                    void runInventoryAction(detail.id, 'transfer', {
                      toWarehouse: detail.warehouse === 'Dubai WH' ? 'Amman WH-A' : 'Dubai WH',
                      quantity: 5,
                    })
                  }
                >
                  Transfer
                </Button>
              </>
            ) : null}
            <Button tone='primary' onClick={() => void saveInventory()} disabled={saving || !activeId}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading inventory detail...</div>
        ) : !detail ? (
          <DetailEmptyState title='No inventory row selected' description='Select a stock row to inspect warehouse and transfer details.' />
        ) : (
          <>
            {detailError ? <div style={{ color: colors.danger, fontSize: typography.sm }}>{detailError}</div> : null}
            <InfoGrid
              rows={[
                { label: 'SKU', value: valueOrDash(detail.sku) },
                { label: 'Available', value: valueOrDash(detail.available) },
                { label: 'Reserved', value: valueOrDash(detail.reserved) },
                { label: 'Incoming', value: valueOrDash(detail.incoming) },
                { label: 'Updated', value: formatDateTime(detail.updatedAt) },
              ]}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: spacing['12'],
              }}
            >
              <Field label='Warehouse'>
                <TextInput value={warehouse} onChange={(event) => setWarehouse(event.target.value)} />
              </Field>
              <Field label='Vendor'>
                <TextInput value={vendor} onChange={(event) => setVendor(event.target.value)} />
              </Field>
              <Field label='Low Stock Threshold'>
                <TextInput type='number' value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value)} />
              </Field>
              <Field label='Stock Status'>
                <SelectInput value={detail.stockStatus ?? 'healthy'} disabled>
                  <option value='healthy'>Healthy</option>
                  <option value='low'>Low</option>
                </SelectInput>
              </Field>
            </div>
            <Field label='Location Notes'>
              <TextAreaInput value={locationNotes} onChange={(event) => setLocationNotes(event.target.value)} />
            </Field>
            <InfoGrid
              rows={[
                { label: 'Title', value: valueOrDash(detail.title) },
                { label: 'Variant', value: valueOrDash(detail.variantTitle) },
                { label: 'Expiry', value: valueOrDash(detail.customFields?.expiry_date ? formatDateTime(String(detail.customFields.expiry_date)) : '-') },
                { label: 'Last Adjustment', value: formatDateTime(detail.lastAdjustmentAt) },
              ]}
            />
            <Panel density='dense'>
              <div style={{ marginBottom: spacing['12'], color: colors.textPrimary, fontSize: typography.sm }}>
                Transfer History
              </div>
              <TableShell>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['From', 'To', 'Qty', 'Created'].map((head) => (
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
                    {(detail.transferHistory ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={4} style={cellStyle}>
                          No transfers yet.
                        </td>
                      </tr>
                    ) : (
                      (detail.transferHistory ?? []).map((item) => (
                        <tr key={item.id}>
                          <td style={cellStyle}>{item.fromWarehouse}</td>
                          <td style={cellStyle}>{item.toWarehouse}</td>
                          <td style={cellStyle}>{item.quantity}</td>
                          <td style={cellStyle}>{formatDateTime(item.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableShell>
            </Panel>
          </>
        )}
      </EditorShell>
    </>
  )

  return (
    <AdminEntityListPage<InventoryRow>
      title={title}
      entity='inventory'
      defaultColumns={defaultColumns}
      filters={[
        { key: 'warehouse', label: 'Warehouse', type: 'text' },
        {
          key: 'stockStatus',
          label: 'Stock Status',
          type: 'select',
          options: [
            { value: 'healthy', label: 'Healthy' },
            { value: 'low', label: 'Low' },
          ],
        },
        { key: 'vendor', label: 'Vendor', type: 'text' },
        { key: 'belowThreshold', label: 'Below Threshold', type: 'boolean' },
      ]}
      bulkActions={[
        { key: 'export', label: 'Export Selected' },
        { key: 'adjust', label: 'Adjust Stock', capabilityPath: 'inventory.reservations' },
        { key: 'transfer', label: 'Transfer', capabilityPath: 'inventory.transfers' },
        { key: 'assign-warehouse', label: 'Assign Warehouse', capabilityPath: 'inventory.multiWarehouse' },
      ]}
      fetchRows={(input: AdminListInput) =>
        apiClient.admin.listInventory({
          ...input,
          filters: {
            ...(input.filters ?? {}),
            ...(forcedFilters ?? {}),
          },
        })
      }
      fetchFields={() => apiClient.admin.inventoryFields()}
      renderCell={(row, key) => {
        if (key.startsWith('custom.')) return String(row.customFields?.[key.slice('custom.'.length)] ?? '-')
        if (key === 'updatedAt') return formatDateTime(row.updatedAt)
        return String((row as Record<string, unknown>)[key] ?? '-')
      }}
      rowActions={(row) => (
        <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Button tone='ghost' onClick={() => void loadInventory(row.id)}>
            View
          </Button>
          <Button tone='secondary' onClick={() => void runInventoryAction(row.id, 'adjust', { quantityDelta: 5 })}>
            +5
          </Button>
        </div>
      )}
      onBulkAction={async (actionKey, selectedIds) => {
        const type =
          actionKey === 'export'
            ? 'export'
            : actionKey === 'transfer'
              ? 'transfer'
              : actionKey === 'adjust'
                ? 'stock-adjust'
                : 'bulk-update'
        await queueJob({
          type,
          targetIds: selectedIds,
          summary: `Inventory ${actionKey} (${selectedIds.length} selected)`,
          data: { action: actionKey, selectedIds },
        })
      }}
      onExportJob={async () => {
        await queueJob({
          type: 'export',
          summary: `${title} export`,
          data: { filters: forcedFilters ?? null },
        })
      }}
      detailPanel={detailPanel}
      refreshKey={refreshKey}
      rowStatus={(row) =>
        row.stockStatus
          ? {
              tone: row.stockStatus === 'healthy' ? 'success' : row.stockStatus === 'low' ? 'warning' : 'neutral',
              label: row.stockStatus,
            }
          : null
      }
    />
  )
}

const cellStyle = {
  padding: spacing['12'],
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  fontSize: typography.sm,
} as const
