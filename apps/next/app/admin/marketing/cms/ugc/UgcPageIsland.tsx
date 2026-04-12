'use client'

import AdminCmsUgcPageClient from './UgcPageClient'

export default function AdminCmsUgcPageIsland() {
  if (typeof window === 'undefined') {
    return null
  }

  return <AdminCmsUgcPageClient />
}
