'use client'

import { VendorManagementPage } from '../_components/VendorManagementPage'

export default function AdminMarketplaceVendorApprovalPage() {
  return (
    <VendorManagementPage
      title='Vendor Approval'
      subtitle='Approval-focused marketplace queue filtered to pending vendors.'
      forcedFilters={{ approvalStatus: 'pending', status: 'pending' }}
    />
  )
}

