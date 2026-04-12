import {
  AdminInventoryProvider,
  AdminListInput,
  InventoryActionInput,
  InventoryDetail,
  InventoryRow,
  InventoryUpdateInput,
  PagedResponse,
  ProviderResult,
} from '@real/providers/contracts'
import { inventoryFields } from './fields'
import { paginate, projectRow, sortRows } from './_shared'
import { readAdminMockState, updateAdminMockState } from './store'

function applySearch(rows: InventoryRow[], search?: string) {
  if (!search) return rows
  const needle = search.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((row) =>
    `${row.sku ?? ''} ${row.title ?? ''} ${row.variantTitle ?? ''} ${row.vendor ?? ''}`
      .toLowerCase()
      .includes(needle)
  )
}

function applyFilters(rows: InventoryRow[], filters?: Record<string, unknown>) {
  if (!filters) return rows
  let next = rows
  for (const key of ['warehouse', 'stockStatus', 'vendor'] as const) {
    const value = filters[key]
    if (typeof value === 'string' && value.trim()) {
      next = next.filter((row) => row[key] === value)
    }
  }
  if (filters.belowThreshold === true) {
    next = next.filter((row) => (row.available ?? 0) <= (row.lowStockThreshold ?? 0))
  }

  const updatedFrom = filters.updatedFrom
  if (typeof updatedFrom === 'string' && updatedFrom.trim()) {
    const fromMs = Date.parse(updatedFrom)
    if (!Number.isNaN(fromMs)) {
      next = next.filter((row) => {
        if (!row.updatedAt) return false
        return Date.parse(row.updatedAt) >= fromMs
      })
    }
  }

  const updatedTo = filters.updatedTo
  if (typeof updatedTo === 'string' && updatedTo.trim()) {
    const toMs = Date.parse(updatedTo)
    if (!Number.isNaN(toMs)) {
      next = next.filter((row) => {
        if (!row.updatedAt) return false
        return Date.parse(row.updatedAt) <= toMs
      })
    }
  }
  return next
}

function toRow(item: InventoryDetail): InventoryRow {
  return {
    id: item.id,
    sku: item.sku,
    title: item.title,
    variantTitle: item.variantTitle,
    warehouse: item.warehouse,
    available: item.available,
    reserved: item.reserved,
    incoming: item.incoming,
    lowStockThreshold: item.lowStockThreshold,
    stockStatus: item.stockStatus,
    vendor: item.vendor,
    updatedAt: item.updatedAt,
    customFields: item.customFields,
  }
}

function findInventory(state: { inventory: InventoryDetail[] }, id: string) {
  return state.inventory.find((item) => item.id === id)
}

export const mockAdminInventoryAdapter: AdminInventoryProvider = {
  async listInventory(input: AdminListInput): Promise<ProviderResult<PagedResponse<InventoryRow>>> {
    const state = await readAdminMockState()
    const searched = applySearch(state.inventory.map(toRow), input.search)
    const filtered = applyFilters(searched, input.filters)
    const sorted = sortRows(filtered, input.sort)
    const projected = sorted.map((row) => projectRow(row, input.fields))
    return { ok: true, data: paginate(projected, input) }
  },
  async inventoryFields() {
    return { ok: true, data: inventoryFields }
  },
  async getInventory(id) {
    const state = await readAdminMockState()
    const item = findInventory(state, id)
    if (!item) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_INVENTORY_NOT_FOUND',
          message: 'Inventory record was not found.',
        },
      }
    }
    return { ok: true, data: item }
  },
  async updateInventory(id, input: Partial<InventoryUpdateInput>) {
    const nextState = await updateAdminMockState((state) => {
      const item = findInventory(state, id)
      if (!item) return
      Object.assign(item, input, { updatedAt: new Date().toISOString() })
    })
    const item = findInventory(nextState, id)
    if (!item) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_INVENTORY_NOT_FOUND',
          message: 'Inventory record was not found.',
        },
      }
    }
    return { ok: true, data: item }
  },
  async runInventoryAction(id: string, actionInput: InventoryActionInput) {
    const nextState = await updateAdminMockState((state) => {
      const item = findInventory(state, id)
      if (!item) return
      if (actionInput.action === 'adjust' && typeof actionInput.input?.quantityDelta === 'number') {
        item.available = Math.max(0, (item.available ?? 0) + actionInput.input.quantityDelta)
      }
      if (actionInput.action === 'transfer') {
        const toWarehouse =
          typeof actionInput.input?.toWarehouse === 'string' ? actionInput.input.toWarehouse : item.warehouse ?? 'Unknown'
        const quantity =
          typeof actionInput.input?.quantity === 'number' ? actionInput.input.quantity : 0
        item.transferHistory = [
          {
            id: `transfer-${Date.now()}`,
            fromWarehouse: item.warehouse ?? 'Unknown',
            toWarehouse,
            quantity,
            createdAt: new Date().toISOString(),
          },
          ...(item.transferHistory ?? []),
        ]
        item.warehouse = toWarehouse
      }
      if (actionInput.action === 'assign-warehouse' && typeof actionInput.input?.warehouse === 'string') {
        item.warehouse = actionInput.input.warehouse
      }
      item.stockStatus =
        (item.available ?? 0) <= (item.lowStockThreshold ?? 0) ? 'low' : 'healthy'
      item.lastAdjustmentAt = new Date().toISOString()
      item.updatedAt = new Date().toISOString()
    })
    const item = findInventory(nextState, id)
    if (!item) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_INVENTORY_NOT_FOUND',
          message: 'Inventory record was not found.',
        },
      }
    }
    return { ok: true, data: item }
  },
}
