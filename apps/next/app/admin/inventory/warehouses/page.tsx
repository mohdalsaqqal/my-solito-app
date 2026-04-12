'use client'

import { InventoryManagementPage } from '../_components/InventoryManagementPage'

export default function AdminInventoryWarehousesPage() {
  return (
    <InventoryManagementPage
      title='Warehouses'
      subtitle='Warehouse-oriented stock view for transfer planning and threshold management.'
      defaultColumns={['warehouse', 'sku', 'title', 'variantTitle', 'available', 'reserved', 'incoming', 'stockStatus', 'vendor', 'updatedAt']}
    />
  )
}

