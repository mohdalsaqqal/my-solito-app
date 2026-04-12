'use client'

import { InventoryManagementPage } from '../_components/InventoryManagementPage'

export default function AdminInventoryLowStockPage() {
  return (
    <InventoryManagementPage
      title='Low Inventory'
      subtitle='Threshold breach view focused on replenishment and transfer follow-up.'
      defaultColumns={['sku', 'title', 'variantTitle', 'warehouse', 'available', 'lowStockThreshold', 'stockStatus', 'vendor', 'updatedAt']}
      forcedFilters={{ belowThreshold: true }}
    />
  )
}

