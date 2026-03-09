'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultSalesItems,
  defaultShellContent,
} from '@real/app/features/shell'
import { CMSHome } from '@real/app/lib/types'
import { Box, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'
import { spacing } from '@real/tokens'
import { apiClient } from '../../apiClient'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { resolveDirection } from '@real/app/lib/rtl-manager'

type PharmacistRouteShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function PharmacistRouteShell({ title, subtitle, children }: PharmacistRouteShellProps) {
  const router = useRouter()
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [sessionName, setSessionName] = useState('')
  const [sessionEmail, setSessionEmail] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadShell = useCallback(async () => {
    const [session, result] = await Promise.all([apiClient.auth.session(), apiClient.cms.home()])
    if (!session) {
      router.replace('/auth/login?next=/pharmacist/scan')
      return
    }
    if (session.role !== 'pharmacist' && session.role !== 'admin') {
      router.replace('/')
      return
    }
    setSessionName(session.name)
    setSessionEmail(session.email)
    setCmsHome(result)
    setCheckingAuth(false)
  }, [router])

  useEffect(() => {
    void loadShell()
  }, [loadShell])

  if (checkingAuth) {
    return null
  }

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      logoSrc={cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt="Real Cosmetics"
      campaignText={cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={cmsHome?.shell?.topBar?.ctaHref ?? '/shop'}
      cartCount={0}
      wishlistCount={0}
      accountCount={0}
      cartItems={[]}
      cartSubtotal={0}
      categories={defaultCategories}
      salesItems={defaultSalesItems}
      brandItems={defaultBrandItems}
      footerLinks={[]}
      socialLinks={[]}
      newsletterTitle=""
      newsletterSubtitle=""
      onViewCart={() => undefined}
      onCheckout={() => undefined}
      onMobileCartNavigate={() => undefined}
      showFooter={false}
    >
      <Box px='pageX' py='sectionY' gap='24'>
        <Card variant='raised' style={{ gap: spacing['8'] }}>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: spacing['12'],
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Box style={{ gap: spacing['4'], flexShrink: 1, minWidth: 0 }}>
              <Text variant='h2'>{title}</Text>
              {subtitle ? <Text tone='muted'>{subtitle}</Text> : null}
              <Text variant='caption' tone='muted'>
                Signed in as {sessionName}{sessionEmail ? ` (${sessionEmail})` : ''}
              </Text>
            </Box>
            <Box style={{ width: '100%', maxWidth: spacing['128'] }}>
              <Button
                size='sm'
                variant='outline'
                onPress={async () => {
                  setSigningOut(true)
                  try {
                    await apiClient.auth.logout()
                    router.push('/')
                  } finally {
                    setSigningOut(false)
                  }
                }}
                disabled={signingOut}
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </Box>
          </Box>
        </Card>

        {children}
      </Box>
    </Layout>
  )
}
