'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AdminJobRecord, OrderDetail, OrderRow, OrderSummary } from '@real/app/lib/types'
import { colors, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import { AdminEntityListPage } from '../../_components/AdminEntityListPage'
import { DetailEmptyState, formatDateTime, formatMoney, JobNoticePanel, valueOrDash } from '../../_components/AdminHelpers'
import {
  AdminKpiCard,
  AdminKpiGrid,
  AdminTrendPill,
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

const defaultColumns = [
  'orderNumber',
  'customerName',
  'customerEmail',
  'total',
  'paymentStatus',
  'fulfillmentStatus',
  'orderStatus',
  'vendor',
  'itemCount',
  'createdAt',
]

const copy = {
  loadingOrderDetail: 'Loading order detail...',
  paymentOptions: {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
  },
  fulfillmentOptions: {
    fulfilled: 'Fulfilled',
    unfulfilled: 'Unfulfilled',
    partial: 'Partially Fulfilled',
  },
  orderOptions: {
    open: 'Open',
    onHold: 'On Hold',
    cancelled: 'Cancelled',
  },
} as const

export default function AdminSalesOrdersPage() {
  const router = useRouter()
  const [orderSummary, setOrderSummary] = useState<OrderSummary[]>([])
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [fulfillmentStatus, setFulfillmentStatus] = useState('unfulfilled')
  const [orderStatus, setOrderStatus] = useState('open')
  const [vendor, setVendor] = useState('')
  const [latestJob, setLatestJob] = useState<AdminJobRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    void apiClient.orders
      .list()
      .then((response) => setOrderSummary(response))
      .catch(() => {})
  }, [refreshKey])

  const hydrateForm = (order: OrderDetail) => {
    setNotes(order.notes ?? '')
    setTags((order.tags ?? []).join(', '))
    setPaymentStatus(order.paymentStatus ?? 'pending')
    setFulfillmentStatus(order.fulfillmentStatus ?? 'unfulfilled')
    setOrderStatus(order.orderStatus ?? 'open')
    setVendor(order.vendor ?? '')
  }

  const loadOrder = async (id: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    setActiveOrderId(id)
    try {
      const response = await apiClient.admin.getOrder(id)
      setDetail(response)
      hydrateForm(response)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load order detail.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const saveOrder = async () => {
    if (!activeOrderId) return
    setSaving(true)
    setDetailError(null)
    try {
      const response = await apiClient.admin.updateOrder(activeOrderId, {
        paymentStatus,
        fulfillmentStatus,
        orderStatus,
        vendor,
        notes,
        tags: tags
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
      })
      setDetail(response)
      hydrateForm(response)
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to save order.')
    } finally {
      setSaving(false)
    }
  }

  const runOrderAction = async (id: string, action: 'mark-review' | 'refund' | 'exchange' | 'split-shipment') => {
    try {
      const response = await apiClient.admin.runOrderAction(id, { action })
      if (activeOrderId === id) {
        setDetail(response)
        hydrateForm(response)
      }
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to run order action.')
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
      entity: 'orders',
      summary: input.summary,
      targetIds: input.targetIds,
      input: input.data,
    })
    setLatestJob(job)
  }

  const overview = useMemo(() => {
    const revenue = orderSummary.reduce(
      (total, order) => total + Number(order.total ?? 0),
      0,
    )
    const pending = orderSummary.filter((order) => order.status === 'placed').length
    const delivered = orderSummary.filter((order) => order.status === 'delivered').length
    const customers = new Set(
      orderSummary.map((order) => order.ownerUserId).filter(Boolean),
    ).size
    const currency = orderSummary[0]?.currency ?? 'USD'
    return { revenue, pending, delivered, customers, currency }
  }, [orderSummary])

  const summaryCards = (
    <AdminKpiGrid>
      <AdminKpiCard
        label='Tracked revenue'
        value={formatMoney(overview.revenue, overview.currency)}
        meta='Visible order value across the current sales dataset'
        tone='brand'
      />
      <AdminKpiCard
        label='Pending orders'
        value={overview.pending.toLocaleString()}
        meta='Orders still waiting for the next operational action'
        tone={overview.pending > 10 ? 'warning' : 'default'}
        trend={
          <AdminTrendPill
            value={overview.pending > 10 ? 'Needs triage' : 'Stable'}
            tone={overview.pending > 10 ? 'warning' : 'success'}
          />
        }
      />
      <AdminKpiCard
        label='Delivered'
        value={overview.delivered.toLocaleString()}
        meta='Orders that have completed fulfillment'
        tone='success'
      />
      <AdminKpiCard
        label='Customers'
        value={overview.customers.toLocaleString()}
        meta='Distinct buyers visible in the current order flow'
        trend={<AdminTrendPill value='Audience signal' tone='neutral' />}
      />
    </AdminKpiGrid>
  )

  const detailPanel = (
    <>
      <JobNoticePanel job={latestJob} onOpen={(id) => router.push(`/admin/operations/jobs?job=${encodeURIComponent(id)}`)} />
      <EditorShell
        title={detail?.orderNumber ?? 'Order Workspace'}
        subtitle='Review, annotate, and run canonical sales actions without coupling the UI to backend schemas.'
        actions={
          <>
            {detail ? (
              <>
                <Button tone='secondary' onClick={() => void runOrderAction(detail.id, 'mark-review')}>
                  Mark Review
                </Button>
                <Button tone='secondary' onClick={() => void runOrderAction(detail.id, 'refund')}>
                  Refund
                </Button>
              </>
            ) : null}
            <Button tone='primary' onClick={() => void saveOrder()} disabled={saving || !activeOrderId}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>{copy.loadingOrderDetail}</div>
        ) : !detail ? (
          <DetailEmptyState title='No order selected' description='Choose an order row to review the full sales record.' />
        ) : (
          <>
            {detailError ? <div style={{ color: colors.danger, fontSize: typography.sm }}>{detailError}</div> : null}
            <InfoGrid
              rows={[
                { label: 'Order #', value: detail.orderNumber },
                { label: 'Customer', value: valueOrDash(detail.customerName) },
                { label: 'Total', value: formatMoney(detail.total, detail.currency ?? 'USD') },
                { label: 'Created', value: formatDateTime(detail.createdAt) },
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
              <Field label='Payment Status'>
                <SelectInput value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                  <option value='paid'>{copy.paymentOptions.paid}</option>
                  <option value='pending'>{copy.paymentOptions.pending}</option>
                  <option value='failed'>{copy.paymentOptions.failed}</option>
                </SelectInput>
              </Field>
              <Field label='Fulfillment Status'>
                <SelectInput value={fulfillmentStatus} onChange={(event) => setFulfillmentStatus(event.target.value)}>
                  <option value='fulfilled'>{copy.fulfillmentOptions.fulfilled}</option>
                  <option value='unfulfilled'>{copy.fulfillmentOptions.unfulfilled}</option>
                  <option value='partially_fulfilled'>{copy.fulfillmentOptions.partial}</option>
                </SelectInput>
              </Field>
              <Field label='Order Status'>
                <SelectInput value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
                  <option value='open'>{copy.orderOptions.open}</option>
                  <option value='on_hold'>{copy.orderOptions.onHold}</option>
                  <option value='cancelled'>{copy.orderOptions.cancelled}</option>
                </SelectInput>
              </Field>
              <Field label='Vendor'>
                <TextInput value={vendor} onChange={(event) => setVendor(event.target.value)} />
              </Field>
            </div>
            <Field label='Tags'>
              <TextInput value={tags} onChange={(event) => setTags(event.target.value)} />
            </Field>
            <Field label='Notes'>
              <TextAreaInput value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            <InfoGrid
              rows={[
                { label: 'Shipping', value: valueOrDash(detail.shippingAddress) },
                { label: 'Billing', value: valueOrDash(detail.billingAddress) },
                { label: 'Customer Email', value: valueOrDash(detail.customerEmail) },
                { label: 'Vendor Code', value: String(detail.customFields?.vendor_code ?? '-') },
              ]}
            />
            <Panel density='dense'>
              <div style={{ marginBottom: spacing['12'], color: colors.textPrimary, fontSize: typography.sm }}>
                Line Items
              </div>
              <TableShell>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Title', 'SKU', 'Qty', 'Price'].map((head) => (
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
                    {(detail.lineItems ?? []).map((item) => (
                      <tr key={item.id}>
                        <td style={cellStyle}>{item.title}</td>
                        <td style={cellStyle}>{valueOrDash(item.sku)}</td>
                        <td style={cellStyle}>{item.quantity}</td>
                        <td style={cellStyle}>{formatMoney(item.price, detail.currency ?? 'USD')}</td>
                      </tr>
                    ))}
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
    <AdminEntityListPage<OrderRow>
      eyebrow='Sales Operations'
      title='Orders'
      subtitle='Run the sales queue as a high-signal control room: triage exceptions fast, open a detail workspace on the right, and keep refunds or review actions inside the canonical admin path.'
      entity='orders'
      defaultColumns={defaultColumns}
      summaryCards={summaryCards}
      filters={[
        {
          key: 'paymentStatus',
          label: 'Payment',
          type: 'select',
          options: [
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ],
        },
        {
          key: 'fulfillmentStatus',
          label: 'Fulfillment',
          type: 'select',
          options: [
            { value: 'fulfilled', label: 'Fulfilled' },
            { value: 'unfulfilled', label: 'Unfulfilled' },
            { value: 'partially_fulfilled', label: 'Partially Fulfilled' },
          ],
        },
        {
          key: 'orderStatus',
          label: 'Order Status',
          type: 'select',
          options: [
            { value: 'open', label: 'Open' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'on_hold', label: 'On Hold' },
          ],
        },
        { key: 'vendor', label: 'Vendor', type: 'text' },
      ]}
      bulkActions={[
        { key: 'export', label: 'Export Selected' },
        { key: 'review', label: 'Mark for Review' },
        { key: 'tag', label: 'Assign Tag' },
        { key: 'manual', label: 'Manual Action', capabilityPath: 'orders.exchanges' },
      ]}
      fetchRows={(input) => apiClient.admin.listOrdersPaged(input)}
      fetchFields={() => apiClient.admin.orderFields()}
      renderCell={(row, key) => {
        if (key.startsWith('custom.')) return String(row.customFields?.[key.slice('custom.'.length)] ?? '-')
        if (key === 'total') return formatMoney(row.total, row.currency ?? 'USD')
        if (key === 'createdAt' || key === 'updatedAt') return formatDateTime(row[key])
        return String((row as Record<string, unknown>)[key] ?? '-')
      }}
      rowActions={(row) => (
        <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Button tone='ghost' onClick={() => void loadOrder(row.id)}>
            View
          </Button>
          <Button tone='secondary' onClick={() => void runOrderAction(row.id, 'mark-review')}>
            Review
          </Button>
        </div>
      )}
      onBulkAction={async (actionKey, selectedIds) => {
        await queueJob({
          type: actionKey === 'export' ? 'export' : 'bulk-update',
          targetIds: selectedIds,
          summary: `Orders ${actionKey} (${selectedIds.length} selected)`,
          data: { action: actionKey, selectedIds },
        })
      }}
      onExportJob={async () => {
        await queueJob({
          type: 'export',
          summary: 'Orders export',
        })
      }}
      detailPanel={detailPanel}
      refreshKey={refreshKey}
      rowStatus={(row) =>
        row.orderStatus
          ? {
              tone:
                row.orderStatus === 'open'
                  ? 'success'
                  : row.orderStatus === 'on_hold'
                    ? 'warning'
                    : row.orderStatus === 'cancelled'
                      ? 'danger'
                      : 'neutral',
              label: row.orderStatus,
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

