import { Suspense } from 'react'
import { connection } from 'next/server'
import RegisterPageIsland from './RegisterPageIsland'

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function RegisterPageContent({ searchParams }: RegisterPageProps) {
  await connection()
  const params = await searchParams
  const nextValue = params.next
  const nextPath = nextValue && nextValue.startsWith('/') ? nextValue : null

  return <RegisterPageIsland nextPath={nextPath} />
}
