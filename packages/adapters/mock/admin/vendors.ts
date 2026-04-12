import {
  AdminListInput,
  AdminVendorProvider,
  PagedResponse,
  ProviderResult,
  VendorActionInput,
  VendorDetail,
  VendorRow,
  VendorUpdateInput,
} from '@real/providers/contracts'
import { vendorFields } from './fields'
import { paginate, projectRow, sortRows } from './_shared'
import { readAdminMockState, updateAdminMockState } from './store'

function applySearch(rows: VendorRow[], search?: string) {
  if (!search) return rows
  const needle = search.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((row) =>
    `${row.name} ${row.email ?? ''} ${row.phone ?? ''}`.toLowerCase().includes(needle)
  )
}

function applyFilters(rows: VendorRow[], filters?: Record<string, unknown>) {
  if (!filters) return rows
  let next = rows
  const status = filters.status
  if (typeof status === 'string' && status.trim()) {
    next = next.filter((row) => row.status === status)
  }
  const approvalStatus = filters.approvalStatus
  if (typeof approvalStatus === 'string' && approvalStatus.trim()) {
    next = next.filter((row) => row.status === approvalStatus)
  }
  const payoutStatus = filters.payoutStatus
  if (typeof payoutStatus === 'string' && payoutStatus.trim()) {
    next = next.filter((row) => row.payoutStatus === payoutStatus)
  }
  const minCommissionRate = filters.minCommissionRate
  if (typeof minCommissionRate === 'number') {
    next = next.filter((row) => (row.commissionRate ?? 0) >= minCommissionRate)
  }
  const maxCommissionRate = filters.maxCommissionRate
  if (typeof maxCommissionRate === 'number') {
    next = next.filter((row) => (row.commissionRate ?? 0) <= maxCommissionRate)
  }
  const createdFrom = filters.createdFrom
  if (typeof createdFrom === 'string' && createdFrom.trim()) {
    const fromMs = Date.parse(createdFrom)
    if (!Number.isNaN(fromMs)) {
      next = next.filter((row) => {
        if (!row.createdAt) return false
        return Date.parse(row.createdAt) >= fromMs
      })
    }
  }
  const createdTo = filters.createdTo
  if (typeof createdTo === 'string' && createdTo.trim()) {
    const toMs = Date.parse(createdTo)
    if (!Number.isNaN(toMs)) {
      next = next.filter((row) => {
        if (!row.createdAt) return false
        return Date.parse(row.createdAt) <= toMs
      })
    }
  }
  return next
}

function toRow(vendor: VendorDetail): VendorRow {
  return {
    id: vendor.id,
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    status: vendor.status,
    commissionRate: vendor.commissionRate,
    productCount: vendor.productCount,
    orderCount: vendor.orderCount,
    payoutStatus: vendor.payoutStatus,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
    customFields: vendor.customFields,
  }
}

function findVendor(state: { vendors: VendorDetail[] }, id: string) {
  return state.vendors.find((vendor) => vendor.id === id)
}

export const mockAdminVendorAdapter: AdminVendorProvider = {
  async listVendors(input: AdminListInput): Promise<ProviderResult<PagedResponse<VendorRow>>> {
    const state = await readAdminMockState()
    const searched = applySearch(state.vendors.map(toRow), input.search)
    const filtered = applyFilters(searched, input.filters)
    const sorted = sortRows(filtered, input.sort)
    const projected = sorted.map((row) => projectRow(row, input.fields))
    return { ok: true, data: paginate(projected, input) }
  },
  async vendorFields() {
    return { ok: true, data: vendorFields }
  },
  async getVendor(id) {
    const state = await readAdminMockState()
    const vendor = findVendor(state, id)
    if (!vendor) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_VENDOR_NOT_FOUND',
          message: 'Vendor was not found.',
        },
      }
    }
    return { ok: true, data: vendor }
  },
  async updateVendor(id, input: Partial<VendorUpdateInput>) {
    const nextState = await updateAdminMockState((state) => {
      const vendor = findVendor(state, id)
      if (!vendor) return
      Object.assign(vendor, input, { updatedAt: new Date().toISOString() })
    })
    const vendor = findVendor(nextState, id)
    if (!vendor) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_VENDOR_NOT_FOUND',
          message: 'Vendor was not found.',
        },
      }
    }
    return { ok: true, data: vendor }
  },
  async runVendorAction(id: string, actionInput: VendorActionInput) {
    const nextState = await updateAdminMockState((state) => {
      const vendor = findVendor(state, id)
      if (!vendor) return
      if (actionInput.action === 'approve') {
        vendor.status = 'approved'
        vendor.approvalStatus = 'approved'
      }
      if (actionInput.action === 'reject') {
        vendor.status = 'rejected'
        vendor.approvalStatus = 'rejected'
      }
      if (actionInput.action === 'change-status' && typeof actionInput.input?.status === 'string') {
        vendor.status = actionInput.input.status
      }
      vendor.updatedAt = new Date().toISOString()
    })
    const vendor = findVendor(nextState, id)
    if (!vendor) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_VENDOR_NOT_FOUND',
          message: 'Vendor was not found.',
        },
      }
    }
    return { ok: true, data: vendor }
  },
}
