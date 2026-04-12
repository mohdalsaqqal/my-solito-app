'use client'

import { ProductManagementPage } from '../../catalog/products/ProductManagementPage'

export default function AdminMarketplaceVendorProductsPage() {
  return (
    <ProductManagementPage
      title='Vendor Products'
      subtitle='Vendor-linked catalog rows with marketplace-safe custom field access.'
      createEnabled={false}
    />
  )
}

