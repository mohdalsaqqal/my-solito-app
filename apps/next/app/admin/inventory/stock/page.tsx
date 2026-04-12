'use client'

import { InventoryManagementPage } from '../_components/InventoryManagementPage'

export default function AdminInventoryStockPage() {
  return (
    <InventoryManagementPage
      title='Stock'
      subtitle='Primary stock table with canonical inventory actions and custom field support.'
      defaultColumns={['sku', 'title', 'variantTitle', 'warehouse', 'available', 'reserved', 'incoming', 'lowStockThreshold', 'stockStatus', 'vendor', 'updatedAt']}
    />
  )
}

