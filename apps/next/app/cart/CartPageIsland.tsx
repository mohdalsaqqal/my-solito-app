'use client'

import dynamic from 'next/dynamic'
import type { Cart, CMSHome, Product } from '@real/app/lib/types'

type CartPageClientProps = {
  initialProducts: Product[]
  initialCart: Cart | null
  initialCmsHome: CMSHome | null
  initialError: string | null
}

const CartPageClient = dynamic(
  () => import('./CartPageClient').then((mod) => mod.CartPageClient),
  { ssr: false, loading: () => null }
)

export default function CartPageIsland(props: CartPageClientProps) {
  return <CartPageClient {...props} />
}
