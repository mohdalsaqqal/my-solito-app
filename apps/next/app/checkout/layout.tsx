import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CheckoutLayoutContent>{children}</CheckoutLayoutContent>
    </Suspense>
  )
}

async function CheckoutLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
