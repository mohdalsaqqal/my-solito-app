import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function PharmacistLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PharmacistLayoutContent>{children}</PharmacistLayoutContent>
    </Suspense>
  )
}

async function PharmacistLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
