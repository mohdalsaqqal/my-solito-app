import {
  AdminJobRecord,
  InventoryDetail,
  OrderDetail,
  ProductDetail,
  VendorDetail,
} from '@real/providers/contracts'
import { generatedMockProductRows } from '../product/generated-mock-erp-data'

export type AdminMockState = {
  products: ProductDetail[]
  orders: OrderDetail[]
  inventory: InventoryDetail[]
  vendors: VendorDetail[]
  jobs: AdminJobRecord[]
}

const vendors = ['Fenty', 'Huda', 'Dior', 'Rare Beauty', 'YSL']
const categories = ['makeup', 'haircare', 'skincare', 'fragrance']
const brands = ['fenty-beauty', 'huda-beauty', 'dior', 'rare-beauty', 'ysl']
const warehouses = ['Amman WH-A', 'Amman WH-B', 'Riyadh WH', 'Dubai WH']
const paymentStatuses = ['paid', 'pending', 'failed']
const fulfillmentStatuses = ['fulfilled', 'unfulfilled', 'partially_fulfilled']
const orderStatuses = ['open', 'cancelled', 'on_hold']
const vendorStatuses = ['approved', 'pending', 'rejected']
const payoutStatuses = ['ready', 'processing', 'on_hold']

type SourceProductRow = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
  stock?: number
  brand?: string
  category?: string
  vendor_sku?: string
  csv_brand_label?: string
}

const sourceProducts = generatedMockProductRows as SourceProductRow[]

export function createAdminMockSeed(): AdminMockState {
  const products: ProductDetail[] = sourceProducts.slice(0, 1200).map((product, index) => {
    const vendor = product.csv_brand_label ?? product.brand ?? vendors[index % vendors.length]
    const brand = product.brand ?? brands[index % brands.length]
    const category = product.category ?? categories[index % categories.length]
    const inventory = product.stock ?? (index % 21 === 0 ? 0 : 12 + (index % 80))
    const status = inventory === 0 ? 'draft' : index % 9 === 0 ? 'archived' : 'active'
    const price = product.price

    return {
      id: product.id,
      title: product.name,
      description: product.description ?? `Premium ${category} catalog item for ${vendor}.`,
      brand,
      category,
      price,
      comparePrice: Math.round((price + 8) * 100) / 100,
      inventory,
      status,
      sku: product.vendor_sku ?? `SKU-${index + 1}`,
      image: product.image,
      vendor,
      currency: product.currency ?? 'USD',
      sales: 20 + (index % 400),
      variantCount: 1 + (index % 6),
      sourceColumns: [
        'title', 'brand', 'category', 'price', 'inventory', 'sku',
        'custom.supplier_code', 'custom.erp_margin',
        'source.external_product_id', 'source.vendor_sku', 'source.erp_line_code',
        'source.formulation_family', 'source.shelf_life_months', 'source.price_band',
        'source.compliance_tags', 'source.key_features',
      ],
      createdAt: new Date(Date.now() - (index + 15) * 86_400_000).toISOString(),
      updatedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
      customFields: {
        supplier_code: `SUP-${(index % 40) + 1}`,
        erp_margin: ((index % 15) + 5) / 100,
      },
    }
  })

  const orders: OrderDetail[] = Array.from({ length: 1800 }, (_, index) => {
    const vendor = vendors[index % 4]
    const itemCount = 1 + (index % 7)
    const price = 39 + (index % 320)
    return {
      id: `ord-${String(index + 1).padStart(7, '0')}`,
      orderNumber: `#${100000 + index}`,
      customerName: `Customer ${index + 1}`,
      customerEmail: `customer${index + 1}@mail.com`,
      total: price,
      currency: 'USD',
      paymentStatus: paymentStatuses[index % paymentStatuses.length],
      fulfillmentStatus: fulfillmentStatuses[index % fulfillmentStatuses.length],
      orderStatus: orderStatuses[index % orderStatuses.length],
      vendor,
      itemCount,
      createdAt: new Date(Date.now() - index * 3_600_000).toISOString(),
      updatedAt: new Date(Date.now() - index * 2_600_000).toISOString(),
      shippingAddress: `Street ${index + 1}, Amman`,
      billingAddress: `Street ${index + 1}, Amman`,
      notes: '',
      tags: index % 4 === 0 ? ['vip'] : [],
      lineItems: Array.from({ length: itemCount }, (_, itemIndex) => ({
        id: `line-${index + 1}-${itemIndex + 1}`,
        sku: `SKU-${(index % 1200) + itemIndex + 1}`,
        title: `${vendor} Item ${itemIndex + 1}`,
        quantity: 1,
        price: Math.max(10, Math.round(price / itemCount)),
      })),
      customFields: {
        vendor_code: `V-${(index % 24) + 1}`,
      },
    }
  })

  const inventory: InventoryDetail[] = Array.from({ length: 2200 }, (_, index) => {
    const available = index % 13 === 0 ? 3 : 22 + (index % 75)
    const threshold = 10
    return {
      id: `inv-${String(index + 1).padStart(7, '0')}`,
      sku: `SKU-${index + 1}`,
      title: `Inventory Item ${index + 1}`,
      variantTitle: index % 2 === 0 ? 'Default' : 'Shade A',
      warehouse: warehouses[index % warehouses.length],
      available,
      reserved: index % 11,
      incoming: index % 9,
      lowStockThreshold: threshold,
      stockStatus: available <= threshold ? 'low' : 'healthy',
      vendor: vendors[index % 4],
      updatedAt: new Date(Date.now() - index * 7_200_000).toISOString(),
      locationNotes: `Aisle ${(index % 9) + 1}`,
      lastAdjustmentAt: new Date(Date.now() - index * 1_800_000).toISOString(),
      transferHistory: [],
      customFields: {
        expiry_date: new Date(Date.now() + (index % 180) * 86_400_000).toISOString(),
      },
    }
  })

  const vendorRows: VendorDetail[] = Array.from({ length: 420 }, (_, index) => ({
    id: `vendor-${String(index + 1).padStart(5, '0')}`,
    name: `Vendor ${index + 1}`,
    email: `vendor${index + 1}@marketplace.com`,
    phone: `+96279${String(100000 + index).slice(0, 6)}`,
    status: vendorStatuses[index % vendorStatuses.length],
    approvalStatus: vendorStatuses[index % vendorStatuses.length] as VendorDetail['approvalStatus'],
    commissionRate: ((index % 9) + 5) / 100,
    productCount: 20 + (index % 110),
    orderCount: 100 + (index % 900),
    payoutStatus: payoutStatuses[index % payoutStatuses.length],
    createdAt: new Date(Date.now() - index * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - index * 35_400_000).toISOString(),
    notes: '',
    productIds: products.filter((product) => product.vendor === vendors[index % vendors.length]).slice(0, 12).map((product) => product.id),
    customFields: {
      vendor_code: `VN-${index + 1}`,
    },
  }))

  return {
    products,
    orders,
    inventory,
    vendors: vendorRows,
    jobs: [],
  }
}
