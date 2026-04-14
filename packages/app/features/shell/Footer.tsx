import { Linking, Platform } from 'react-native'
import { borderWidth, layout, radius, spacing, typography } from '@real/tokens'
import { Box, Divider, FooterSocialLinks, Icon, PaymentBadges, Text } from '@real/ui'
import { Button as ReusableButton } from '@real/ui/reusables/button'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import { Direction, FooterColumn, LocaleCode, ShellContent, SocialLink } from './types'

type FooterProps = {
  locale: LocaleCode
  dir?: Direction
  shellContent?: ShellContent
  footerLinks: FooterColumn[]
  socialLinks: SocialLink[]
  newsletterTitle?: string
  newsletterSubtitle?: string
}

function textForLocale(value: { en: string; ar: string } | undefined, locale: LocaleCode, fallback: string) {
  if (!value) return fallback
  return locale === 'ar' ? value.ar : value.en
}

const TRUST_ITEMS = [
  { id: 'delivery', icon: 'shipping' as const, labelEn: 'Fast delivery', labelAr: 'توصيل سريع', detailEn: 'Same-day dispatch on selected orders', detailAr: 'شحن في نفس اليوم للطلبات المحددة' },
  { id: 'returns', icon: 'returns' as const, labelEn: 'Easy returns', labelAr: 'إرجاع سهل', detailEn: '14-day returns on eligible items', detailAr: 'إرجاع خلال 14 يوماً للمنتجات المؤهلة' },
  { id: 'secure', icon: 'secure' as const, labelEn: 'Secure checkout', labelAr: 'دفع آمن', detailEn: 'Trusted card and wallet payments', detailAr: 'دفع موثوق بالبطاقات والمحافظ' },
  { id: 'support', icon: 'support' as const, labelEn: 'Beauty support', labelAr: 'دعم الجمال', detailEn: 'Help with orders, shades, and routines', detailAr: 'مساعدة في الطلبات والدرجات والروتين' },
] as const

export function Footer({
  locale,
  dir = 'ltr',
  shellContent,
  footerLinks,
  socialLinks,
  newsletterTitle,
  newsletterSubtitle,
}: FooterProps) {
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'

  if (Platform.OS !== 'web' || !isDesktop) {
    return null
  }

  const legal = textForLocale(
    shellContent?.footer?.legalNotice,
    locale,
    'REAL Cosmetics. All rights reserved.',
  )

  const openSocial = (id: string) => {
    const found = socialLinks.find((item) => item.id === id)
    if (!found) return
    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
      win?.(found.href, '_blank', 'noopener,noreferrer')
      return
    }
    void Linking.openURL(found.href).catch(() => undefined)
  }

  const openFooterLink = (href?: string) => {
    if (!href) return
    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
      win?.(href, isExternal ? '_blank' : '_self', isExternal ? 'noopener,noreferrer' : undefined)
      return
    }
    if (isExternal) {
      void Linking.openURL(href).catch(() => undefined)
    }
  }

  const c = useThemeColors()

  return (
    <Box
      style={{
        direction: dir,
        backgroundColor: c.surface,
        borderTopWidth: borderWidth.thin,
        borderColor: c.divider,
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: layout.containerMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.pageX,
          paddingTop: spacing['32'],
          paddingBottom: spacing['24'],
          gap: spacing['24'],
        }}
      >
        <Box
          style={{
            flexDirection: 'row',
            gap: spacing['16'],
            flexWrap: 'wrap',
            borderWidth: borderWidth.thin,
            borderColor: c.divider,
            borderRadius: radius.lg,
            backgroundColor: c.surfaceMuted,
            paddingHorizontal: spacing['20'],
            paddingVertical: spacing['16'],
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <Box
              key={item.id}
              style={{
                minWidth: 220,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing['12'],
              }}
            >
              <Box
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: radius.full,
                  backgroundColor: c.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: borderWidth.thin,
                  borderColor: c.divider,
                }}
              >
                <Icon name={item.icon} size={18} color={c.textPrimary} />
              </Box>
              <Box style={{ flex: 1, gap: spacing['4'] }}>
                <Text weight='700'>{locale === 'ar' ? item.labelAr : item.labelEn}</Text>
                <Text variant='bodySm' tone='muted'>
                  {locale === 'ar' ? item.detailAr : item.detailEn}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing['24'],
          }}
        >
          <Box style={{ flex: 1.5, flexDirection: 'row', gap: spacing['20'] }}>
            {footerLinks.map((column) => (
              <Box key={column.id} style={{ flex: 1, gap: spacing['12'] }}>
                <Text
                  weight='700'
                  style={{
                    fontSize: typography.label,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {column.title}
                </Text>
                <Box style={{ gap: spacing['8'] }}>
                  {column.links.map((link) => (
                    <ReusableButton
                      key={link.id}
                      variant='ghost'
                      size='sm'
                      href={Platform.OS === 'web' ? link.href : undefined}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onPress={Platform.OS === 'web' ? undefined : () => openFooterLink(link.href)}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <Text variant='bodySm' tone='muted'>
                        {link.label}
                      </Text>
                    </ReusableButton>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Box style={{ flex: 1, gap: spacing['20'] }}>
            <Box
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: spacing['16'],
              }}
            >
              <Box style={{ gap: spacing['8'], flex: 1 }}>
                <Text
                  weight='700'
                  style={{
                    fontSize: typography.label,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {locale === 'ar' ? 'تابعنا' : 'Follow us'}
                </Text>
                <FooterSocialLinks items={socialLinks} onPress={openSocial} />
              </Box>

              <Box style={{ gap: spacing['8'], flex: 1 }}>
                <Text
                  weight='700'
                  style={{
                    fontSize: typography.label,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {locale === 'ar' ? 'الدفع' : 'Payments'}
                </Text>
                <PaymentBadges />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['16'],
          }}
        >
          <Text variant='meta' tone='muted'>
            {legal}
          </Text>
          <Text variant='meta' tone='muted'>
            {locale === 'ar' ? 'التسوق بالجمال يبدأ من هنا' : 'Beauty shopping starts here'}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
