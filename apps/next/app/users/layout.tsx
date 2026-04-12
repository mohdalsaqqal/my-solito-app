import { ReactNode, Suspense } from 'react'
import { connection } from 'next/server'

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <UsersLayoutContent>{children}</UsersLayoutContent>
    </Suspense>
  )
}

async function UsersLayoutContent({ children }: { children: ReactNode }) {
  await connection()
  return <>{children}</>
}
