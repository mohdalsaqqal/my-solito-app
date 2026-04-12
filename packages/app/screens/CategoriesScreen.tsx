import React, { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { breakpoints, borderWidth, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text } from '@real/ui/primitives'
import { Button as ReusableButton } from '@real/ui/reusables/button'
import { useThemeColors } from '@real/ui/responsive'
import type { CMSHome } from '@real/app/lib/types'
import type { ShellFeaturedSlot, ShellMegaMenuSection } from '@real/app/features/shell/types'

type CategoryTreeNode = {
  id: string
  slug: string
  name: { en: string; ar: string }
  children: CategoryTreeNode[]
}

type CategoriesScreenProps = {
  cmsHome?: CMSHome | null
  categoryTree: CategoryTreeNode[]
  locale?: 'en' | 'ar'
  onNavigate?: (href: string) => void
}

function toShopCategoryHref(slug: string) {
  return `/shop?categories=${encodeURIComponent(slug)}`
}

function localize(locale: 'en' | 'ar', value?: { en: string; ar: string }, fallback = '') {
  if (!value) return fallback
  return locale === 'ar' ? value.ar : value.en
}

function buildFallbackSections(
  categoryTree: CategoryTreeNode[],
  locale: 'en' | 'ar'
): ShellMegaMenuSection[] {
  return categoryTree.map((category) => ({
    id: category.id,
    label: localize(locale, category.name, category.slug),
    href: toShopCategoryHref(category.slug),
    columns: category.children.map((child) => ({
      id: child.id,
      label: localize(locale, child.name, child.slug),
      href: toShopCategoryHref(child.slug),
      children: child.children.map((grandchild) => ({
        id: grandchild.id,
        label: localize(locale, grandchild.name, grandchild.slug),
        href: toShopCategoryHref(grandchild.slug),
      })),
    })),
  }))
}

function featuredSlotLabel(slot: ShellFeaturedSlot | undefined, locale: 'en' | 'ar') {
  if (!slot) return null
  if (slot.type === 'campaign') return locale === 'ar' ? 'حملة مميزة' : 'Featured campaign'
  if (slot.type === 'product') return locale === 'ar' ? 'منتج مميز' : 'Featured product'
  return locale === 'ar' ? 'لافتة مميزة' : 'Featured banner'
}

export const CategoriesScreen = React.memo(function CategoriesScreen({
  cmsHome,
  categoryTree,
  locale = 'en',
  onNavigate,
}: CategoriesScreenProps) {
  const { width } = useWindowDimensions()
  const c = useThemeColors()
  const isDesktop = width >= breakpoints.desktopMin

  const sections = useMemo(() => {
    const cmsSections = cmsHome?.shell?.navigation?.menus?.headerMegaCategories?.sections
    if (cmsSections && cmsSections.length > 0) {
      return cmsSections
    }
    return buildFallbackSections(categoryTree, locale)
  }, [categoryTree, cmsHome, locale])

  const title = locale === 'ar' ? 'تسوّق حسب الفئة' : 'Shop by category'
  const subtitle =
    locale === 'ar'
      ? 'تصفّح نفس هيكل الفئات المستخدم في القائمة الرئيسية، مع الأقسام الفرعية والعلامات المرتبطة.'
      : 'Browse the same category hierarchy used in the main navigation, with subcategories and relevant brands.'
  const browseAllLabel = locale === 'ar' ? 'عرض الكل' : 'Browse all'

  return (
    <PageScaffold variant='commerce' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='16'>
            <Box gap='6'>
              <Text variant='headline' weight='700'>
                {title}
              </Text>
              <Text variant='bodySm' tone='muted'>
                {subtitle}
              </Text>
            </Box>

            <Box gap='16'>
              {sections.map((section) => (
                <Box
                  key={section.id}
                  style={{
                    borderWidth: borderWidth.thin,
                    borderRadius: radius.xl,
                    borderColor: c.border,
                    padding: spacing['16'],
                    gap: spacing['16'],
                    backgroundColor: c.surface,
                  }}
                >
                  <Box
                    style={{
                      gap: spacing['6'],
                      flexDirection: isDesktop ? 'row' : 'column',
                      alignItems: isDesktop ? 'center' : 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box style={{ gap: spacing['4'], flex: 1 }}>
                      <Text variant='title' weight='700'>
                        {section.label}
                      </Text>
                      {section.description ? (
                        <Text variant='bodySm' tone='muted'>
                          {section.description}
                        </Text>
                      ) : null}
                    </Box>
                    {section.href ? (
                      <ReusableButton href={section.href} onPress={() => onNavigate?.(section.href!)} variant='ghost' size='sm'>
                        <Text variant='meta' weight='700' tone='primary'>
                          {browseAllLabel}
                        </Text>
                      </ReusableButton>
                    ) : null}
                  </Box>

                  <Box
                    style={{
                      flexDirection: isDesktop ? 'row' : 'column',
                      gap: spacing['16'],
                    }}
                  >
                    <Box style={{ flex: 1, gap: spacing['12'] }}>
                      {section.columns.map((column) => (
                        <Box key={column.id} style={{ gap: spacing['6'] }}>
                          <ReusableButton
                            href={column.href}
                            onPress={() => column.href && onNavigate?.(column.href)}
                            variant='ghost'
                            size='sm'
                          >
                            <Text variant='bodySm' weight='700'>
                              {column.label}
                            </Text>
                          </ReusableButton>
                          <Box
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: spacing['8'],
                            }}
                          >
                            {column.children.map((child) => (
                              <ReusableButton
                                key={child.id}
                                href={child.href}
                                onPress={() => child.href && onNavigate?.(child.href)}
                                variant='ghost'
                                size='sm'
                              >
                                <Box
                                  style={{
                                    borderWidth: borderWidth.thin,
                                    borderColor: c.border,
                                    borderRadius: radius.full,
                                    paddingHorizontal: spacing['10'],
                                    paddingVertical: spacing['6'],
                                  }}
                                >
                                  <Text variant='meta' tone='muted'>
                                    {child.label}
                                  </Text>
                                </Box>
                              </ReusableButton>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {section.brandRail?.items?.length || section.featuredSlot ? (
                      <Box
                        style={{
                          width: isDesktop ? 260 : '100%',
                          gap: spacing['12'],
                          borderTopWidth: isDesktop ? 0 : borderWidth.thin,
                          borderStartWidth: isDesktop ? borderWidth.thin : 0,
                          borderColor: c.border,
                          paddingTop: isDesktop ? 0 : spacing['12'],
                          paddingStart: isDesktop ? spacing['16'] : 0,
                        }}
                      >
                        {section.brandRail?.items?.length ? (
                          <Box style={{ gap: spacing['8'] }}>
                            <Text variant='caption' weight='700' tone='muted'>
                              {section.brandRail.title ?? (locale === 'ar' ? 'علامات مميزة' : 'Featured brands')}
                            </Text>
                            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                              {section.brandRail.items.map((brand) => (
                                <ReusableButton
                                  key={brand.id}
                                  href={brand.href}
                                  onPress={() => brand.href && onNavigate?.(brand.href)}
                                  variant='ghost'
                                  size='sm'
                                >
                                  <Box
                                    style={{
                                    borderWidth: borderWidth.thin,
                                    borderColor: c.border,
                                    borderRadius: radius.full,
                                    paddingHorizontal: spacing['10'],
                                    paddingVertical: spacing['6'],
                                    }}
                                  >
                                    <Text variant='meta' weight='700' tone='muted'>
                                      {brand.label}
                                    </Text>
                                  </Box>
                                </ReusableButton>
                              ))}
                            </Box>
                          </Box>
                        ) : null}

                        {section.featuredSlot ? (
                          <Box
                            style={{
                              borderWidth: borderWidth.thin,
                              borderColor: c.border,
                              borderRadius: radius.lg,
                              padding: spacing['12'],
                              gap: spacing['6'],
                            }}
                          >
                            <Text variant='caption' weight='700' tone='muted'>
                              {featuredSlotLabel(section.featuredSlot, locale)}
                            </Text>
                            <Text variant='bodySm' weight='700'>
                              {section.featuredSlot.title}
                            </Text>
                            {section.featuredSlot.subtitle ? (
                              <Text variant='meta' tone='muted'>
                                {section.featuredSlot.subtitle}
                              </Text>
                            ) : null}
                            {section.featuredSlot.href ? (
                              <ReusableButton
                                href={section.featuredSlot.href}
                                onPress={() => onNavigate?.(section.featuredSlot!.href!)}
                                variant='ghost'
                                size='sm'
                              >
                                <Text variant='meta' weight='700' tone='primary'>
                                  {section.featuredSlot.ctaLabel ?? browseAllLabel}
                                </Text>
                              </ReusableButton>
                            ) : null}
                          </Box>
                        ) : null}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
