import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <OrdersLayoutContent>{children}</OrdersLayoutContent>
    </Suspense>
  )
}

async function OrdersLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
