import { CommerceCapabilities } from '@real/providers/contracts'

export const mockCommerceCapabilities: CommerceCapabilities = {
  products: {
    bulkEdit: true,
    variantImages: true,
    advancedVariants: true,
  },
  orders: {
    refunds: true,
    exchanges: false,
    splitShipments: false,
  },
  inventory: {
    multiWarehouse: true,
    reservations: true,
    transfers: true,
  },
  vendors: {
    marketplace: true,
    approvals: true,
    commissions: true,
    payouts: false,
  },
}
