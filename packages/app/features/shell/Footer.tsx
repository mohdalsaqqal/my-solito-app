import { Linking, Platform, useWindowDimensions } from 'react-native'
import { breakpoints, colors, motionDuration, radius, spacing, zIndex } from '@real/tokens'
import {
  Box,
  Divider,
  FooterAccordion,
  FooterColumns,
  FooterLegalRow,
  FooterNewsletter,
  RevealOnScroll,
  FooterSocialLinks,
} from '@real/ui'
import { useState } from 'react'
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
  if (!value) {
    return fallback
  }
  return locale === 'ar' ? value.ar : value.en
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
  const isDesktopViewport = width >= breakpoints.desktopMin
  // Keep first SSR/hydration pass deterministic on web to avoid accordion/columns mismatch.
  const isDesktop = isDesktopViewport || (Platform.OS === 'web' && width === 0)
  const [openSectionId, setOpenSectionId] = useState<string | null>(footerLinks[0]?.id ?? null)

  const resolvedTitle =
    newsletterTitle ?? textForLocale(shellContent?.footer?.newsletterTitle, locale, 'Join our newsletter')
  const resolvedSubtitle =
    newsletterSubtitle ??
    textForLocale(shellContent?.footer?.newsletterSubtitle, locale, 'Get launches and exclusive offers.')
  const legal = textForLocale(shellContent?.footer?.legalNotice, locale, '(c) Real Cosmetics')

  const firstNamePlaceholder = locale === 'ar' ? 'الاسم الأول' : 'First name'
  const emailPlaceholder = locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'
  const submitLabel = locale === 'ar' ? 'اشتراك' : 'Subscribe'
  const submitSuccessMessage = locale === 'ar' ? 'تم الاشتراك بنجاح.' : 'Subscribed successfully.'
  const submitErrorMessage = locale === 'ar' ? 'تعذر الاشتراك حالياً.' : 'Unable to subscribe right now.'

  const openSocial = (id: string) => {
    const found = socialLinks.find((item) => item.id === id)
    if (!found) {
      return
    }

    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
      win?.(found.href, '_blank', 'noopener,noreferrer')
      return
    }

    void Linking.openURL(found.href).catch(() => undefined)
  }

  const openFooterLink = (linkId: string) => {
    const link = footerLinks.flatMap((column) => column.links).find((item) => item.id === linkId)
    if (!link) {
      return
    }

    const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://')

    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
      if (isExternal) {
        win?.(link.href, '_blank', 'noopener,noreferrer')
        return
      }
      win?.(link.href, '_self')
      return
    }

    if (isExternal) {
      void Linking.openURL(link.href).catch(() => undefined)
    }
  }

  return (
    <Box
      style={{
        position: 'relative',
        zIndex: zIndex.base,
        backgroundColor: colors.backgroundSecondary,
        direction: dir,
      }}
    >
      <Box style={{ paddingHorizontal: spacing.pageX, paddingVertical: spacing.xl, gap: spacing.lg }}>
        <RevealOnScroll delayMs={0}>
          <Box
            style={{
              backgroundColor: colors.black,
              borderRadius: radius.md,
              padding: spacing.xl,
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

        <RevealOnScroll delayMs={motionDuration.stagger}>
          <Divider tone='muted' />
        </RevealOnScroll>

        <RevealOnScroll delayMs={motionDuration.stagger * 2}>
          {isDesktop ? (
            <FooterColumns columns={footerLinks} onPressLink={openFooterLink} />
          ) : (
            <FooterAccordion
              sections={footerLinks}
              openSectionId={openSectionId}
              onToggleSection={(sectionId) =>
                setOpenSectionId((current) => (current === sectionId ? null : sectionId))
              }
              onPressLink={openFooterLink}
            />
          )}
        </RevealOnScroll>

        <RevealOnScroll delayMs={motionDuration.stagger * 3}>
          <FooterSocialLinks items={socialLinks} onPress={openSocial} />
        </RevealOnScroll>

        <RevealOnScroll delayMs={motionDuration.stagger * 4}>
          <Divider tone='muted' />
        </RevealOnScroll>

        <RevealOnScroll delayMs={motionDuration.stagger * 5}>
          <FooterLegalRow text={legal} />
        </RevealOnScroll>
      </Box>
    </Box>
  )
}
