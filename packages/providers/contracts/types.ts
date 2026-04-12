export type ProviderFailure = {
  ok: false
  error: {
    code: string
    message: string
  }
}

export type ProviderSuccess<T> = {
  ok: true
  data: T
}

export type ProviderResult<T> = ProviderSuccess<T> | ProviderFailure

export type CursorSort = {
  key: string
  direction: 'asc' | 'desc'
}

export type PageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export type PagedResponse<T> = {
  nodes: T[]
  pageInfo: PageInfo
}

export type ColumnType =
  | 'string'
  | 'number'
  | 'money'
  | 'date'
  | 'status'
  | 'image'
  | 'boolean'
  | 'badge'

export type ColumnDefinition = {
  key: string
  label: string
  type: ColumnType
  sortable?: boolean
  filterable?: boolean
  source: 'core' | 'computed' | 'custom'
}

export type FieldRegistryResponse = {
  coreFields: ColumnDefinition[]
  computedFields: ColumnDefinition[]
  customFields: ColumnDefinition[]
}

export type SavedViewEntity = 'products' | 'orders' | 'inventory' | 'vendors'

export type SavedView = {
  id: string
  entity: SavedViewEntity
  name: string
  filters?: Record<string, unknown>
  sort?: CursorSort
  visibleColumns: string[]
}

export type AdminJobEntity = SavedViewEntity | 'system'

export type AdminJobType =
  | 'export'
  | 'import'
  | 'bulk-update'
  | 'stock-adjust'
  | 'transfer'
  | 'vendor-approval-batch'
  | 'payout-run'

export type AdminJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type AdminJobRecord = {
  id: string
  type: AdminJobType
  entity: AdminJobEntity
  status: AdminJobStatus
  createdAt: string
  updatedAt: string
  summary: string
  requestedBy: {
    userId: string
    email: string
  }
  targetIds: string[]
  input?: Record<string, unknown>
  result?: Record<string, unknown>
}

export type AdminJobCreateInput = {
  type: AdminJobType
  entity: AdminJobEntity
  summary: string
  targetIds?: string[]
  input?: Record<string, unknown>
}

export type CommerceCapabilities = {
  products: {
    bulkEdit: boolean
    variantImages: boolean
    advancedVariants: boolean
  }
  orders: {
    refunds: boolean
    exchanges: boolean
    splitShipments: boolean
  }
  inventory: {
    multiWarehouse: boolean
    reservations: boolean
    transfers: boolean
  }
  vendors: {
    marketplace: boolean
    approvals: boolean
    commissions: boolean
    payouts: boolean
  }
}

export type AdminListInput = {
  limit: number
  cursor?: string
  search?: string
  filters?: Record<string, unknown>
  sort?: CursorSort
  fields?: string[]
}

export type AdminDetailBase = {
  id: string
  createdAt?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export function matchProviderResult<T, R>(
  result: ProviderResult<T>,
  handlers: {
    ok: (data: T) => R
    fail: (error: ProviderFailure['error']) => R
  }
): R {
  if (result.ok) {
    return handlers.ok(result.data)
  }

  return handlers.fail(result.error)
}
