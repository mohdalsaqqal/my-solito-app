import { AdminListInput, FieldRegistryResponse, PagedResponse, ProviderResult } from './types'

export type VendorRow = {
  id: string
  name: string
  email?: string
  phone?: string
  status?: string
  commissionRate?: number
  productCount?: number
  orderCount?: number
  payoutStatus?: string
  createdAt?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type VendorDetail = VendorRow & {
  notes?: string
  approvalStatus?: 'approved' | 'pending' | 'rejected'
  productIds?: string[]
}

export type VendorUpdateInput = {
  name?: string
  email?: string
  phone?: string
  status?: string
  commissionRate?: number
  payoutStatus?: string
  notes?: string
  customFields?: Record<string, unknown>
}

export type VendorActionInput = {
  action: 'approve' | 'reject' | 'change-status'
  input?: Record<string, unknown>
}

export interface AdminVendorProvider {
  listVendors(input: AdminListInput): Promise<ProviderResult<PagedResponse<VendorRow>>>
  vendorFields(): Promise<ProviderResult<FieldRegistryResponse>>
  getVendor(id: string): Promise<ProviderResult<VendorDetail>>
  updateVendor(id: string, input: Partial<VendorUpdateInput>): Promise<ProviderResult<VendorDetail>>
  runVendorAction(id: string, input: VendorActionInput): Promise<ProviderResult<VendorDetail>>
}
