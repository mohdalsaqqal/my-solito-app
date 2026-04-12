'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AdminJobRecord, AdminListInput, VendorDetail, VendorRow } from '@real/app/lib/types'
import { colors, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import { AdminEntityListPage } from '../../_components/AdminEntityListPage'
import { DetailEmptyState, formatDateTime, formatPercent, JobNoticePanel, valueOrDash } from '../../_components/AdminHelpers'
import {
  Button,
  EditorShell,
  Field,
  InfoGrid,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '../../_components/AdminPagePrimitives'

type VendorManagementPageProps = {
  title: string
  subtitle?: string
  forcedFilters?: Record<string, unknown>
}

export function VendorManagementPage({
  title,
  subtitle,
  forcedFilters,
}: VendorManagementPageProps) {
  const router = useRouter()
  const [detail, setDetail] = useState<VendorDetail | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('pending')
  const [commissionRate, setCommissionRate] = useState('0.1')
  const [payoutStatus, setPayoutStatus] = useState('ready')
  const [notes, setNotes] = useState('')
  const [latestJob, setLatestJob] = useState<AdminJobRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const hydrateForm = (vendor: VendorDetail) => {
    setName(vendor.name)
    setEmail(vendor.email ?? '')
    setPhone(vendor.phone ?? '')
    setStatus(vendor.status ?? 'pending')
    setCommissionRate(String(vendor.commissionRate ?? 0))
    setPayoutStatus(vendor.payoutStatus ?? 'ready')
    setNotes(vendor.notes ?? '')
  }

  const loadVendor = async (id: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    setActiveId(id)
    try {
      const response = await apiClient.admin.getVendor(id)
      setDetail(response)
      hydrateForm(response)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to load vendor detail.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const saveVendor = async () => {
    if (!activeId) return
    setSaving(true)
    setDetailError(null)
    try {
      const response = await apiClient.admin.updateVendor(activeId, {
        name,
        email,
        phone,
        status,
        commissionRate: Number(commissionRate),
        payoutStatus,
        notes,
      })
      setDetail(response)
      hydrateForm(response)
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to save vendor.')
    } finally {
      setSaving(false)
    }
  }

  const runVendorAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await apiClient.admin.runVendorAction(id, { action })
      if (activeId === id) {
        setDetail(response)
        hydrateForm(response)
      }
      setRefreshKey((prev) => prev + 1)
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : 'Unable to run vendor action.')
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
      entity: 'vendors',
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
        title={detail?.name ?? 'Vendor Workspace'}
        subtitle={subtitle ?? 'Marketplace vendor review, approval, and commission management.'}
        actions={
          <>
            {detail ? (
              <>
                <Button tone='secondary' onClick={() => void runVendorAction(detail.id, 'approve')}>
                  Approve
                </Button>
                <Button tone='secondary' onClick={() => void runVendorAction(detail.id, 'reject')}>
                  Reject
                </Button>
              </>
            ) : null}
            <Button tone='primary' onClick={() => void saveVendor()} disabled={saving || !activeId}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading vendor detail...</div>
        ) : !detail ? (
          <DetailEmptyState title='No vendor selected' description='Choose a vendor row to review contact, approval, and payout data.' />
        ) : (
          <>
            {detailError ? <div style={{ color: colors.danger, fontSize: typography.sm }}>{detailError}</div> : null}
            <InfoGrid
              rows={[
                { label: 'Vendor ID', value: detail.id },
                { label: 'Created', value: formatDateTime(detail.createdAt) },
                { label: 'Updated', value: formatDateTime(detail.updatedAt) },
                { label: 'Products', value: valueOrDash(detail.productCount) },
                { label: 'Orders', value: valueOrDash(detail.orderCount) },
              ]}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: spacing['12'],
              }}
            >
              <Field label='Name'>
                <TextInput value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label='Email'>
                <TextInput value={email} onChange={(event) => setEmail(event.target.value)} />
              </Field>
              <Field label='Phone'>
                <TextInput value={phone} onChange={(event) => setPhone(event.target.value)} />
              </Field>
              <Field label='Status'>
                <SelectInput value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value='approved'>Approved</option>
                  <option value='pending'>Pending</option>
                  <option value='rejected'>Rejected</option>
                </SelectInput>
              </Field>
              <Field label='Commission Rate'>
                <TextInput type='number' step='0.01' value={commissionRate} onChange={(event) => setCommissionRate(event.target.value)} />
              </Field>
              <Field label='Payout Status'>
                <SelectInput value={payoutStatus} onChange={(event) => setPayoutStatus(event.target.value)}>
                  <option value='ready'>Ready</option>
                  <option value='processing'>Processing</option>
                  <option value='on_hold'>On Hold</option>
                </SelectInput>
              </Field>
            </div>
            <Field label='Notes'>
              <TextAreaInput value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            <InfoGrid
              rows={[
                { label: 'Approval', value: valueOrDash(detail.approvalStatus) },
                { label: 'Commission', value: formatPercent(detail.commissionRate) },
                { label: 'Payout', value: valueOrDash(detail.payoutStatus) },
                { label: 'Vendor Code', value: String(detail.customFields?.vendor_code ?? '-') },
              ]}
            />
          </>
        )}
      </EditorShell>
    </>
  )

  return (
    <AdminEntityListPage<VendorRow>
      title={title}
      entity='vendors'
      defaultColumns={['name', 'email', 'phone', 'status', 'commissionRate', 'productCount', 'orderCount', 'payoutStatus', 'createdAt', 'updatedAt']}
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' },
          ],
        },
        {
          key: 'payoutStatus',
          label: 'Payout',
          type: 'select',
          options: [
            { value: 'ready', label: 'Ready' },
            { value: 'processing', label: 'Processing' },
            { value: 'on_hold', label: 'On Hold' },
          ],
        },
      ]}
      bulkActions={[
        { key: 'approve', label: 'Approve', capabilityPath: 'vendors.approvals' },
        { key: 'reject', label: 'Reject', capabilityPath: 'vendors.approvals' },
        { key: 'export', label: 'Export Selected' },
        { key: 'change-status', label: 'Change Status' },
      ]}
      fetchRows={(input: AdminListInput) =>
        apiClient.admin.listVendors({
          ...input,
          filters: {
            ...(input.filters ?? {}),
            ...(forcedFilters ?? {}),
          },
        })
      }
      fetchFields={() => apiClient.admin.vendorFields()}
      renderCell={(row, key) => {
        if (key.startsWith('custom.')) return String(row.customFields?.[key.slice('custom.'.length)] ?? '-')
        if (key === 'commissionRate') return formatPercent(row.commissionRate)
        if (key === 'createdAt' || key === 'updatedAt') return formatDateTime(row[key])
        return String((row as Record<string, unknown>)[key] ?? '-')
      }}
      rowActions={(row) => (
        <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
          <Button tone='ghost' onClick={() => void loadVendor(row.id)}>
            View
          </Button>
          <Button tone='secondary' onClick={() => void runVendorAction(row.id, row.status === 'approved' ? 'reject' : 'approve')}>
            {row.status === 'approved' ? 'Reject' : 'Approve'}
          </Button>
        </div>
      )}
      onBulkAction={async (actionKey, selectedIds) => {
        await queueJob({
          type: actionKey === 'export' ? 'export' : actionKey === 'approve' || actionKey === 'reject' ? 'vendor-approval-batch' : 'bulk-update',
          targetIds: selectedIds,
          summary: `Vendors ${actionKey} (${selectedIds.length} selected)`,
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
        row.status
          ? {
              tone:
                row.status === 'approved'
                  ? 'success'
                  : row.status === 'pending'
                    ? 'warning'
                    : row.status === 'rejected'
                      ? 'danger'
                      : 'neutral',
              label: row.status,
            }
          : null
      }
    />
  )
}
