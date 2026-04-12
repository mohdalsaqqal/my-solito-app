import { FieldRegistryResponse } from '@real/providers/contracts'

export const productFields: FieldRegistryResponse = {
  coreFields: [
    { key: 'image', label: 'Image', type: 'image', source: 'core' },
    { key: 'title', label: 'Title', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'brand', label: 'Brand', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'category', label: 'Category', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'price', label: 'Price', type: 'money', sortable: true, filterable: true, source: 'core' },
    { key: 'comparePrice', label: 'Compare Price', type: 'money', sortable: true, source: 'core' },
    { key: 'inventory', label: 'Inventory', type: 'number', sortable: true, filterable: true, source: 'core' },
    { key: 'status', label: 'Status', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'sku', label: 'SKU', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'vendor', label: 'Vendor', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true, filterable: true, source: 'core' },
  ],
  computedFields: [
    { key: 'sales', label: 'Sales', type: 'number', sortable: true, source: 'computed' },
    { key: 'variantCount', label: 'Variants', type: 'number', sortable: true, source: 'computed' },
  ],
  customFields: [
    { key: 'custom.supplier_code', label: 'Supplier Code', type: 'string', source: 'custom' },
    { key: 'custom.erp_margin', label: 'ERP Margin', type: 'number', source: 'custom' },
  ],
}

export const orderFields: FieldRegistryResponse = {
  coreFields: [
    { key: 'orderNumber', label: 'Order #', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'customerName', label: 'Customer', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'customerEmail', label: 'Customer Email', type: 'string', source: 'core' },
    { key: 'total', label: 'Total', type: 'money', sortable: true, filterable: true, source: 'core' },
    { key: 'paymentStatus', label: 'Payment', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'fulfillmentStatus', label: 'Fulfillment', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'orderStatus', label: 'Order Status', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'vendor', label: 'Vendor', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'itemCount', label: 'Items', type: 'number', sortable: true, source: 'core' },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true, filterable: true, source: 'core' },
    { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true, filterable: true, source: 'core' },
  ],
  computedFields: [],
  customFields: [{ key: 'custom.vendor_code', label: 'Vendor Code', type: 'string', source: 'custom' }],
}

export const inventoryFields: FieldRegistryResponse = {
  coreFields: [
    { key: 'sku', label: 'SKU', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'title', label: 'Title', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'variantTitle', label: 'Variant', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'warehouse', label: 'Warehouse', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'available', label: 'Available', type: 'number', sortable: true, filterable: true, source: 'core' },
    { key: 'reserved', label: 'Reserved', type: 'number', sortable: true, source: 'core' },
    { key: 'incoming', label: 'Incoming', type: 'number', sortable: true, source: 'core' },
    { key: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number', sortable: true, source: 'core' },
    { key: 'stockStatus', label: 'Stock Status', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'vendor', label: 'Vendor', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true, filterable: true, source: 'core' },
  ],
  computedFields: [],
  customFields: [{ key: 'custom.expiry_date', label: 'Expiry Date', type: 'date', source: 'custom' }],
}

export const vendorFields: FieldRegistryResponse = {
  coreFields: [
    { key: 'name', label: 'Name', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'email', label: 'Email', type: 'string', sortable: true, filterable: true, source: 'core' },
    { key: 'phone', label: 'Phone', type: 'string', source: 'core' },
    { key: 'status', label: 'Status', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'commissionRate', label: 'Commission', type: 'number', sortable: true, filterable: true, source: 'core' },
    { key: 'productCount', label: 'Products', type: 'number', sortable: true, source: 'core' },
    { key: 'orderCount', label: 'Orders', type: 'number', sortable: true, source: 'core' },
    { key: 'payoutStatus', label: 'Payout', type: 'status', sortable: true, filterable: true, source: 'core' },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true, filterable: true, source: 'core' },
    { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true, filterable: true, source: 'core' },
  ],
  computedFields: [],
  customFields: [{ key: 'custom.vendor_code', label: 'Vendor Code', type: 'string', source: 'custom' }],
}
