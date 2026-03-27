import { useEffect, useMemo, useState } from 'react'
import { Image, Linking, Platform, useWindowDimensions } from 'react-native'
import {
  borderWidth,
  breakpoints,
  colors,
  componentTokens,
  layout,
  motionDuration,
  radius,
  spacing,
  zIndex,
} from '@real/tokens'
import {
  Box,
  BrandArc,
  Divider,
  FooterAccordion,
  FooterNewsletter,
  FooterSocialLinks,
  PaymentBadges,
  RevealOnScroll,
  Text,
} from '@real/ui'
import { Touchable } from '@real/ui/primitives'
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

type FooterDisplayColumn = {
  id: string
  title: string
  links: Array<{ id: string; label: string; href: string }>
}

const FOOTER_INSTAGRAM_TILES = [
  '/figma/footer/insta-1.jpg',
  '/figma/footer/insta-2.jpg',
  '/figma/footer/insta-3.jpg',
  '/figma/footer/insta-4.jpg',
  '/figma/footer/insta-5.jpg',
  '/figma/footer/insta-6.jpg',
  '/figma/footer/insta-7.png',
  '/figma/footer/insta-8.jpg',
]

function textForLocale(value: { en: string; ar: string } | undefined, locale: LocaleCode, fallback: string) {
  if (!value) return fallback
  return locale === 'ar' ? value.ar : value.en
}

function buildDisplayColumns(footerLinks: FooterColumn[], locale: LocaleCode): FooterDisplayColumn[] {
  if (footerLinks.length === 0) {
    return [
      {
        id: 'quick-links',
        title: locale === 'ar' ? 'روابط سريعة' : 'Quick Links',
        links: [],
      },
      {
        id: 'useful-links',
        title: locale === 'ar' ? 'روابط مفيدة' : 'Useful Links',
        links: [],
      },
    ]
  }

  if (footerLinks.length <= 2) {
    return footerLinks
  }

  const midpoint = Math.ceil(footerLinks.length / 2)

  return [
    {
      id: footerLinks[0]?.id ?? 'quick-links',
      title: footerLinks[0]?.title ?? (locale === 'ar' ? 'روابط سريعة' : 'Quick Links'),
      links: footerLinks.slice(0, midpoint).flatMap((column) => column.links ?? []).filter((link) => Boolean(link?.href)),
    },
    {
      id: footerLinks[midpoint]?.id ?? 'useful-links',
      title: footerLinks[midpoint]?.title ?? (locale === 'ar' ? 'روابط مفيدة' : 'Useful Links'),
      links: footerLinks.slice(midpoint).flatMap((column) => column.links ?? []).filter((link) => Boolean(link?.href)),
    },
  ]
}

export function Footer({
  locale,
  dir = 'ltr',
  shellContent,
  footerLinks,
  socialLinks,
  newsletterTitle,
  newsletterSubtitle,
}: FooterProps) {
  const { width } = useWindowDimensions()
  const tokens = componentTokens.storefrontHome.footer
  const isDesktopViewport = width >= breakpoints.desktopMin
  const [hasHydrated, setHasHydrated] = useState(Platform.OS !== 'web')
  const isDesktop = Platform.OS === 'web' && !hasHydrated ? true : isDesktopViewport
  const [openSectionId, setOpenSectionId] = useState<string | null>(footerLinks[0]?.id ?? null)

  useEffect(() => {
    if (Platform.OS === 'web') {
      setHasHydrated(true)
    }
  }, [])

  const resolvedTitle =
    newsletterTitle ?? textForLocale(shellContent?.footer?.newsletterTitle, locale, 'Subscribe our newsletter')
  const resolvedSubtitle =
    newsletterSubtitle ??
    textForLocale(shellContent?.footer?.newsletterSubtitle, locale, 'Receive updates and weekly offers.')
  const legal = textForLocale(
    shellContent?.footer?.legalNotice,
    locale,
    locale === 'ar'
      ? 'حقوق النشر 2026 ريال كوزمتكس. التصميم بواسطة BZOTech.com'
      : 'Copyright 2026 REAL cosmetics. Designed by BZOTech.com',
  )

  const firstNamePlaceholder = locale === 'ar' ? 'الاسم الأول' : 'First name'
  const emailPlaceholder = locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'
  const submitLabel = locale === 'ar' ? 'اشتراك' : 'Subscribe'
  const submitSuccessMessage = locale === 'ar' ? 'تم الاشتراك بنجاح.' : 'Subscribed successfully.'
  const submitErrorMessage = locale === 'ar' ? 'تعذر الاشتراك حالياً.' : 'Unable to subscribe right now.'
  const followLabel = locale === 'ar' ? 'تابعنا' : 'Follow us'
  const paymentLabel = locale === 'ar' ? 'الدفع' : 'Payment'
  const instagramLabel = locale === 'ar' ? 'إنستغرام' : 'Instagram'
  const instagramHref = socialLinks.find((item) => item.id.toLowerCase().includes('insta'))?.href
  const displayColumns = useMemo(() => buildDisplayColumns(footerLinks, locale), [footerLinks, locale])
  const desktopColumns = footerLinks.length > 0 ? footerLinks : displayColumns

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

  const openFooterLink = (linkId: string) => {
    const link = footerLinks.flatMap((column) => column.links).find((item) => item.id === linkId)
    const href = link?.href?.trim()
    if (!link || !href) return

    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
      if (isExternal) {
        win?.(href, '_blank', 'noopener,noreferrer')
        return
      }
      win?.(href, '_self')
      return
    }

    if (isExternal) {
      void Linking.openURL(href).catch(() => undefined)
    }
  }

  const instagramTileHeight = isDesktop ? tokens.instagramTileHeightDesktop : tokens.instagramTileHeightMobile
  const instagramColumns = isDesktop ? tokens.instagramColumnsDesktop : tokens.instagramColumnsMobile
  const instagramTileWidth: `${number}%` = `${100 / instagramColumns}%`

  return (
    <Box
      style={{
        position: 'relative',
        zIndex: zIndex.base,
        backgroundColor: colors.inkBlack,
        direction: dir,
      }}
    >
      <Box
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: -tokens.topArcOffsetY,
          start: 0,
          end: 0,
          alignItems: 'center',
          opacity: tokens.topArcOpacity,
        }}
      >
      </Box>

      {Platform.OS === 'web' ? (
        <Box style={{ position: 'relative' }}>
          <Box style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {FOOTER_INSTAGRAM_TILES.map((uri, index) => (
              <Box
                key={`${uri}-${index}`}
                style={{
                  width: instagramTileWidth,
                  height: instagramTileHeight,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri }}
                  resizeMode='cover'
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ))}
          </Box>
          <Touchable
            href={instagramHref}
            target={instagramHref ? '_blank' : undefined}
            rel={instagramHref ? 'noopener noreferrer' : undefined}
            accessibilityRole='link'
            onPress={Platform.OS === 'web' ? undefined : instagramHref ? () => openSocial('instagram') : undefined}
            style={{
              position: 'absolute',
              top: Math.max(8, Math.round(instagramTileHeight / 2) - 20),
              left: '50%',
              transform: [{ translateX: -56 }],
            }}
          >
            <Box
              style={{
                minHeight: tokens.instagramButtonHeight,
                borderRadius: radius.md,
                backgroundColor: colors.white,
                paddingHorizontal: tokens.instagramButtonPaddingX,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                weight='600'
                style={{
                  color: colors.textPrimary,
                  fontSize: tokens.instagramButtonTextSize,
                  lineHeight: tokens.instagramButtonTextLineHeight,
                }}
              >
                {instagramLabel}
              </Text>
            </Box>
          </Touchable>
        </Box>
      ) : null}

      <Box
        style={{
          width: '100%',
          maxWidth: layout.containerMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.pageX,
          paddingTop: tokens.brandBlockPaddingTop,
          paddingBottom: tokens.brandBlockPaddingBottom,
        }}
      >
        <Box style={{ gap: spacing['4'] }}>
          <Text
            weight='700'
            tone='inverse'
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: tokens.wordmarkSize,
              lineHeight: tokens.wordmarkLineHeight,
              letterSpacing: tokens.wordmarkTracking,
            }}
          >
            REAL
          </Text>
          <Text
            variant='meta'
            tone='inverse'
            weight='700'
            style={{
              textTransform: 'uppercase',
              fontSize: tokens.cosmeticsSize,
              lineHeight: tokens.cosmeticsLineHeight,
              letterSpacing: tokens.cosmeticsTracking,
              opacity: 0.64,
            }}
          >
            {locale === 'ar' ? 'مستحضرات التجميل' : 'cosmetics'}
          </Text>
          <Text
            variant='meta'
            tone='inverse'
            style={{
              textTransform: 'uppercase',
              fontSize: tokens.taglineSize,
              lineHeight: tokens.taglineLineHeight,
              letterSpacing: tokens.taglineTracking,
              opacity: 0.72,
            }}
          >
            {locale === 'ar' ? 'جمال بلا حدود' : 'endless beauty'}
          </Text>
        </Box>
      </Box>

      <Box
        style={{
          width: '100%',
          maxWidth: layout.containerMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.pageX,
          paddingBottom: spacing['32'],
          gap: tokens.mainGridGap,
        }}
      >
        {isDesktop ? (
          <RevealOnScroll delayMs={motionDuration.stagger}>
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: tokens.mainGridGap,
              }}
            >
              {desktopColumns.map((column) => (
                <Box key={column.id} style={{ minWidth: 120, gap: spacing['16'], flex: 1 }}>
                  <Text
                    variant='label'
                    tone='inverse'
                    weight='700'
                    style={{ textTransform: 'uppercase', letterSpacing: tokens.sectionTitleTracking }}
                  >
                    {column.title}
                  </Text>
                  <Box style={{ gap: spacing['8'] }}>
                    {column.links.filter((link) => Boolean(link?.href)).map((link) => (
                      <Touchable
                        key={link.id}
                        href={link.href}
                        target={link.href?.startsWith('http') ? '_blank' : undefined}
                        rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        accessibilityRole='link'
                        onPress={Platform.OS === 'web' ? undefined : () => openFooterLink(link.id)}
                      >
                        {({ hovered, focused }) => (
                          <Text
                            variant='footer'
                            tone='inverse'
                            style={{
                              lineHeight: tokens.linkLineHeight,
                              opacity: hovered || focused ? 1 : tokens.linkOpacity,
                            }}
                          >
                            {link.label}
                          </Text>
                        )}
                      </Touchable>
                    ))}
                  </Box>
                </Box>
              ))}

              <Box style={{ minWidth: 140, gap: spacing['16'] }}>
                <Box style={{ gap: spacing['8'] }}>
                  <Text
                    variant='label'
                    tone='inverse'
                    weight='700'
                    style={{ textTransform: 'uppercase', letterSpacing: tokens.sectionTitleTracking }}
                  >
                    {followLabel}
                  </Text>
                  <FooterSocialLinks items={socialLinks} onPress={openSocial} />
                </Box>
                <Box style={{ gap: spacing['8'] }}>
                  <Text
                    variant='label'
                    tone='inverse'
                    weight='700'
                    style={{ textTransform: 'uppercase', letterSpacing: tokens.sectionTitleTracking }}
                  >
                    {paymentLabel}
                  </Text>
                  <PaymentBadges />
                </Box>
              </Box>

              <Box style={{ flex: 1.1, maxWidth: tokens.newsletterMaxWidth }}>
                <FooterNewsletter
                  title={resolvedTitle}
                  subtitle={resolvedSubtitle}
                  firstNamePlaceholder={firstNamePlaceholder}
                  emailPlaceholder={emailPlaceholder}
                  submitLabel={submitLabel}
                  successMessage={submitSuccessMessage}
                  errorMessage={submitErrorMessage}
                />
              </Box>
            </Box>
          </RevealOnScroll>
        ) : (
          <>
            <RevealOnScroll delayMs={motionDuration.stagger}>
              <Box
                style={{
                  backgroundColor: colors.inkDeep,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  borderWidth: borderWidth.thin,
                  borderColor: colors.inkMid,
                }}
              >
                <FooterNewsletter
                  title={resolvedTitle}
                  subtitle={resolvedSubtitle}
                  firstNamePlaceholder={firstNamePlaceholder}
                  emailPlaceholder={emailPlaceholder}
                  submitLabel={submitLabel}
                  successMessage={submitSuccessMessage}
                  errorMessage={submitErrorMessage}
                />
              </Box>
            </RevealOnScroll>

            <RevealOnScroll delayMs={motionDuration.stagger * 2}>
              <Box
                style={{
                  backgroundColor: colors.inkDeep,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  gap: spacing.lg,
                  borderWidth: borderWidth.thin,
                  borderColor: colors.inkMid,
                }}
              >
                <Box style={{ gap: spacing['8'] }}>
                  <Text
                    variant='label'
                    tone='inverse'
                    weight='700'
                    style={{ textTransform: 'uppercase', letterSpacing: tokens.sectionTitleTracking }}
                  >
                    {followLabel}
                  </Text>
                  <FooterSocialLinks items={socialLinks} onPress={openSocial} />
                </Box>
                <Divider tone='muted' />
                <Box style={{ gap: spacing['8'] }}>
                  <Text
                    variant='label'
                    tone='inverse'
                    weight='700'
                    style={{ textTransform: 'uppercase', letterSpacing: tokens.sectionTitleTracking }}
                  >
                    {paymentLabel}
                  </Text>
                  <PaymentBadges />
                </Box>
              </Box>
            </RevealOnScroll>

            <RevealOnScroll delayMs={motionDuration.stagger * 3}>
              <FooterAccordion
                sections={footerLinks}
                openSectionId={openSectionId}
                onToggleSection={(sectionId) =>
                  setOpenSectionId((current) => (current === sectionId ? null : sectionId))
                }
                onPressLink={openFooterLink}
              />
            </RevealOnScroll>
          </>
        )}
      </Box>

      <RevealOnScroll delayMs={motionDuration.stagger * 4}>
        <Box
          style={{
            borderTopWidth: borderWidth.thin,
            borderColor: colors.inkMid,
            paddingVertical: tokens.legalPaddingY,
            alignItems: 'center',
            paddingHorizontal: spacing.pageX,
          }}
        >
          <Text
            variant='caption'
            tone='inverse'
            style={{
              opacity: tokens.legalOpacity,
              textAlign: 'center',
            }}
          >
            {legal}
          </Text>
        </Box>
      </RevealOnScroll>
    </Box>
  )
}
