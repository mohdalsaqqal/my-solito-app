'use client'

import dynamic from 'next/dynamic'
import type { Cart, CMSHome, Product, AccountTestDetail } from '@real/app/lib/types'
import type { AuthSession } from '@real/providers/contracts'

type AccountTestDetailPageClientProps = {
  initialSession: AuthSession | null
  initialCmsHome: CMSHome | null
  initialProducts: Product[]
  initialCart: Cart | null
  initialTest: AccountTestDetail | null
  initialError: string | null
}

const AccountTestDetailPageClient = dynamic(
  () => import('./AccountTestDetailPageClient').then((mod) => mod.AccountTestDetailPageClient),
  { ssr: false, loading: () => null }
)

export default function AccountTestDetailPageIsland(props: AccountTestDetailPageClientProps) {
  return <AccountTestDetailPageClient {...props} />
}
