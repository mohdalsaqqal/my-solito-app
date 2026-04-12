import { AdminListInput, FieldRegistryResponse, PagedResponse, ProviderResult } from './types'

export type InventoryRow = {
  id: string
  sku?: string
  title?: string
  variantTitle?: string
  warehouse?: string
  available?: number
  reserved?: number
  incoming?: number
  lowStockThreshold?: number
  stockStatus?: string
  vendor?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type InventoryDetail = InventoryRow & {
  locationNotes?: string
  lastAdjustmentAt?: string
  transferHistory?: Array<{
    id: string
    fromWarehouse: string
    toWarehouse: string
    quantity: number
    createdAt: string
  }>
}

export type InventoryUpdateInput = {
  warehouse?: string
  lowStockThreshold?: number
  vendor?: string
  locationNotes?: string
  customFields?: Record<string, unknown>
}

export type InventoryActionInput = {
  action: 'adjust' | 'transfer' | 'assign-warehouse'
  input?: Record<string, unknown>
}

export interface AdminInventoryProvider {
  listInventory(input: AdminListInput): Promise<ProviderResult<PagedResponse<InventoryRow>>>
  inventoryFields(): Promise<ProviderResult<FieldRegistryResponse>>
  getInventory(id: string): Promise<ProviderResult<InventoryDetail>>
  updateInventory(id: string, input: Partial<InventoryUpdateInput>): Promise<ProviderResult<InventoryDetail>>
  runInventoryAction(id: string, input: InventoryActionInput): Promise<ProviderResult<InventoryDetail>>
}
