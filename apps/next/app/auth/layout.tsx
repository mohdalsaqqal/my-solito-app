import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  )
}

async function AuthLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
