import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </Suspense>
  )
}

async function AccountLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
