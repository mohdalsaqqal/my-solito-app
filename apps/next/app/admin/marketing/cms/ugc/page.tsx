import { Suspense } from 'react'
import AdminCmsUgcPageIsland from './UgcPageIsland'

export default function AdminCmsUgcPage() {
  return (
    <Suspense fallback={null}>
      <AdminCmsUgcPageIsland />
    </Suspense>
  )
}
