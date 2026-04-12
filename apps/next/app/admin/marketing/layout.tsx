'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'

const TABS = [
  { label: 'Promotions', href: '/admin/marketing/promotions' },
  { label: 'Referrals', href: '/admin/marketing/referrals' },
  { label: 'Releases', href: '/admin/marketing/cms/releases' },
  { label: 'Blocks', href: '/admin/marketing/cms/blocks' },
  { label: 'Banners', href: '/admin/marketing/cms/offer-banners' },
  { label: 'Queries', href: '/admin/marketing/cms/queries' },
  { label: 'Site Config', href: '/admin/marketing/cms/site-config' },
  { label: 'Ticker & Banners', href: '/admin/marketing/cms/banners' },
  { label: 'UGC Gallery', href: '/admin/marketing/cms/ugc' },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: spacing['4'],
          padding: `${spacing['12']}px ${spacing['24']}px`,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                padding: `6px ${spacing['16']}px`,
                borderRadius: radius.full,
                fontSize: typography.sm,
                fontWeight: Number(fontWeights.medium),
                backgroundColor: active ? colors.brandPrimary : 'transparent',
                color: active ? '#fff' : colors.textSecondary,
                transition: 'background 0.15s',
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
