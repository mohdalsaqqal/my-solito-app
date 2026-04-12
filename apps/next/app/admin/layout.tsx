import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'
import { AdminShell } from './_components/AdminShell'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  )
}

async function AdminLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <AdminShell>{children}</AdminShell>
}
