/**
 * CMS Seed Script — populates Prisma with baseline CMS merchandising data.
 *
 * Usage: npx tsx apps/next/scripts/cms-seed.ts
 *
 * This script seeds the CMS with the same merchandising content that currently
 * lives in the mock CMS adapter (packages/adapters/mock/cms/index.ts).
 * After seeding, the mock adapter serves as fallback-only, not canonical truth.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRails() {
  const rails = [
    {
      railId: 'best-items-month',
      titleEn: 'Best Items for This Month',
      titleAr: 'أفضل المنتجات لهذا الشهر',
      querySource: 'best_sellers',
      queryLimit: 12,
      querySortBy: 'price_desc',
      position: 0,
    },
    {
      railId: 'new-arrivals',
      titleEn: 'New Arrivals',
      titleAr: 'وصل حديثاً',
      querySource: 'new_arrivals',
      queryLimit: 12,
      querySortBy: 'name_asc',
      position: 1,
    },
    {
      railId: 'value-bundles',
      titleEn: 'Value Bundles',
      titleAr: 'باقات التوفير',
      querySource: 'bundle_only',
      queryLimit: 12,
      querySortBy: 'price_desc',
      position: 2,
    },
  ]

  for (const rail of rails) {
    await prisma.cmsMarketingRail.upsert({
      where: { railId: rail.railId },
      create: rail,
      update: rail,
    })
  }
  console.log(`  ✓ Seeded ${rails.length} marketing rails`)
}

async function seedCampaigns() {
  const campaigns = [
    {
      campaignId: 'm-camp-hero-primary',
      zone: 'home_hero_primary',
      titleEn: "The Week's Best Beauty Savings",
      titleAr: 'أفضل عروض الجمال لهذا الأسبوع',
      subtitleEn: 'Shop the strongest markdowns across skincare, fragrance, hair, and makeup.',
      subtitleAr: 'تسوقي أقوى التخفيضات عبر العناية بالبشرة والعطور والشعر والمكياج.',
      ctaLabelEn: 'See all deals',
      ctaLabelAr: 'عرض كل التخفيضات',
      href: '/shop',
      imageUrl: '/figma/hero/tile-1-top-offers.png',
      timerEndsAt: '2026-03-31T22:59:59.000Z',
      urgencyBadgeEn: 'Top Offers',
      urgencyBadgeAr: 'أفضل العروض',
      showTimer: false,
      showUrgency: false,
      position: 0,
    },
    {
      campaignId: 'm-camp-home-flash-zone',
      zone: 'home_flash_sale',
      titleEn: 'Flash Zone: up to 45% off',
      titleAr: 'منطقة العروض: حتى 45% خصم',
      subtitleEn: 'Inventory changes hourly on selected bundles and skincare routines.',
      subtitleAr: 'المخزون يتغير كل ساعة على باقات وروتينات مختارة.',
      ctaLabelEn: 'Open flash sale',
      ctaLabelAr: 'افتح العروض',
      href: '/sales',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&h=600&q=80',
      timerEndsAt: '2026-03-02T20:00:00.000Z',
      urgencyBadgeEn: 'Selling fast',
      urgencyBadgeAr: 'يباع بسرعة',
      showTimer: true,
      showUrgency: true,
      position: 1,
    },
    {
      campaignId: 'm-camp-shop-banner',
      zone: 'shop_banner',
      titleEn: 'Daily deal marketplace',
      titleAr: 'سوق عروض يومي',
      subtitleEn: 'Offers rotate throughout the day. Prices update by stock pressure.',
      subtitleAr: 'العروض تتجدد طوال اليوم والأسعار تتغير حسب ضغط المخزون.',
      ctaLabelEn: 'Shop all deals',
      ctaLabelAr: 'تسوق كل العروض',
      href: '/shop',
      timerEndsAt: '2026-03-01T21:00:00.000Z',
      urgencyBadgeEn: 'Today only',
      urgencyBadgeAr: 'اليوم فقط',
      showTimer: true,
      showUrgency: true,
      position: 2,
    },
  ]

  for (const c of campaigns) {
    await prisma.cmsCampaign.upsert({
      where: { campaignId: c.campaignId },
      create: c,
      update: c,
    })
  }
  console.log(`  ✓ Seeded ${campaigns.length} campaigns`)
}

async function seedHeroCards() {
  const cards = [
    {
      cardId: 'm-hero-1',
      titleEn: 'Build a Better Daily Ritual',
      titleAr: 'ابنِ روتيناً يومياً أفضل',
      subtitleEn: 'A skin-first edit of cleansers, serums, and moisturizers that layer beautifully.',
      subtitleAr: 'تشكيلة تُعنى بالبشرة من المنظفات والسيروم والمرطبات.',
      ctaLabelEn: 'Explore the edit',
      ctaLabelAr: 'استكشف التشكيلة',
      href: '/shop',
      imageUrl: '/figma/hero/tile-2-editorial.png',
      badgeLabelEn: 'Routine Notes',
      badgeLabelAr: 'ملاحظات الروتين',
      position: 0,
    },
    {
      cardId: 'm-hero-2',
      titleEn: 'Fresh Launches Across the Floor',
      titleAr: 'إطلاقات جديدة في جميع الأقسام',
      subtitleEn: 'Trending drops, exclusive bundles, and just-landed beauty from the brands shoppers watch.',
      subtitleAr: 'أحدث الإطلاقات والباقات الحصرية والمستجدات الجمالية.',
      ctaLabelEn: 'Shop new arrivals',
      ctaLabelAr: 'تسوق الوافد الجديد',
      href: '/shop',
      imageUrl: '/figma/hero/tile-3-new.jpg',
      badgeLabelEn: 'New In',
      badgeLabelAr: 'جديد',
      position: 1,
    },
    {
      cardId: 'm-hero-3',
      titleEn: 'A More Refined Way to Shop Beauty',
      titleAr: 'طريقة أكثر رقياً للتسوق الجمالي',
      subtitleEn: 'Discover prestige fragrance, polished skincare, and elevated gifting in one destination.',
      subtitleAr: 'اكتشفي العطور الفاخرة والعناية بالبشرة الراقية والهدايا المميزة في وجهة واحدة.',
      ctaLabelEn: 'Enter prestige',
      ctaLabelAr: 'ادخلي عالم الفخامة',
      href: '/shop',
      imageUrl: '/figma/hero/tile-4-luxury.png',
      badgeLabelEn: 'Prestige Hall',
      badgeLabelAr: 'قاعة الفخامة',
      position: 2,
    },
    {
      cardId: 'm-hero-4',
      titleEn: 'More Beauty in Every Order',
      titleAr: 'جمال أكثر في كل طلب',
      subtitleEn: 'Unlock bonus samples, bundle savings, and member-only offers built to convert.',
      subtitleAr: 'افتحي عينات إضافية وتوفيراً في الباقات وعروضاً حصرية للأعضاء.',
      ctaLabelEn: 'Unlock offers',
      ctaLabelAr: 'افتحي العروض',
      href: '/shop',
      imageUrl: '/figma/hero/tile-5-member.png',
      badgeLabelEn: 'Member Value',
      badgeLabelAr: 'قيمة الأعضاء',
      position: 3,
    },
  ]

  for (const card of cards) {
    await prisma.cmsHeroCard.upsert({
      where: { cardId: card.cardId },
      create: card,
      update: card,
    })
  }
  console.log(`  ✓ Seeded ${cards.length} hero cards`)
}

async function seedEditorialHotspot() {
  await prisma.cmsEditorialHotspot.upsert({
    where: { id: 'hotspot-main' },
    create: {
      id: 'hotspot-main',
      enabled: true,
      titleEn: 'The Makeup Map',
      titleAr: 'خريطة المكياج',
      subtitleEn: 'Follow the look with a quieter editorial image and the exact products layered beside it.',
      subtitleAr: 'اتبعي الإطلالة عبر صورة تحريرية هادئة مع المنتجات الدقيقة المعروضة بجانبها.',
      ctaLabelEn: 'Shop the look',
      ctaLabelAr: 'تسوقي الإطلالة',
      href: '/shop?categories=makeup',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&h=1800&q=80',
      productIdsJson: JSON.stringify(['76959', '66583', '72078', '76960']),
    },
    update: {
      titleEn: 'The Makeup Map',
      titleAr: 'خريطة المكياج',
    },
  })
  console.log('  ✓ Seeded editorial hotspot')
}

async function seedNewsletterCta() {
  await prisma.cmsNewsletterCta.upsert({
    where: { id: 'newsletter-main' },
    create: {
      id: 'newsletter-main',
      enabled: true,
      titleEn: 'Join our rewards program',
      titleAr: 'انضم لبرنامج المكافآت',
      subtitleEn: 'Earn points on every order and unlock exclusive launches.',
      subtitleAr: 'اكسب نقاطاً مع كل طلب واحصل على إطلاقات حصرية.',
      ctaLabelEn: 'Subscribe',
      ctaLabelAr: 'اشترك',
      href: '/account',
    },
    update: {
      titleEn: 'Join our rewards program',
      titleAr: 'انضم لبرنامج المكافآت',
    },
  })
  console.log('  ✓ Seeded newsletter CTA')
}

async function seedPersonalization() {
  await prisma.cmsPersonalization.upsert({
    where: { id: 'personalization-main' },
    create: {
      id: 'personalization-main',
      enabled: true,
      mode: 'rule-based',
      recommendedTitleEn: 'Recommended for You',
      recommendedTitleAr: 'موصى بها لك',
    },
    update: {},
  })
  console.log('  ✓ Seeded personalization settings')
}

async function seedRailAutoplay() {
  const settings = [
    { railKey: 'hero', autoplayMs: 3200 },
    { railKey: 'categories', autoplayMs: 4400 },
    { railKey: 'newArrivals', autoplayMs: 4200 },
    { railKey: 'featured', autoplayMs: 4600 },
    { railKey: 'brandSpotlights', autoplayMs: 4800 },
  ]

  for (const s of settings) {
    await prisma.cmsRailAutoplay.upsert({
      where: { railKey: s.railKey },
      create: s,
      update: {},
    })
  }
  console.log(`  ✓ Seeded ${settings.length} rail autoplay settings`)
}

async function seedFeaturedSlot() {
  await prisma.cmsFeaturedSlot.upsert({
    where: { id: 'featured-main' },
    create: {
      id: 'featured-main',
      enabled: true,
      titleEn: 'Featured Campaign',
      titleAr: 'الحملة المميزة',
      subtitleEn: 'Sponsored spotlight with premium picks and editor curation.',
      subtitleAr: 'واجهة دعائية مميزة مع اختيارات فاخرة وتنسيق تحريري.',
      ctaLabelEn: 'Explore campaign',
      ctaLabelAr: 'استكشف الحملة',
      href: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
    },
    update: {
      titleEn: 'Featured Campaign',
      titleAr: 'الحملة المميزة',
    },
  })
  console.log('  ✓ Seeded featured slot')
}

async function seedCompleteSet() {
  await prisma.cmsCompleteSet.upsert({
    where: { id: 'complete-set-main' },
    create: {
      id: 'complete-set-main',
      enabled: true,
      titleEn: 'Complete the Set',
      titleAr: 'أكمل المجموعة',
      subtitleEn: 'Frequently bought together to complete your routine.',
      subtitleAr: 'منتجات تُشترى معاً لإكمال روتينك.',
      ctaLabelEn: 'Shop full routine',
      ctaLabelAr: 'تسوق الروتين الكامل',
      ctaHref: '/shop',
      querySource: 'bundle_only',
      queryLimit: 8,
      querySortBy: 'price_desc',
    },
    update: {
      titleEn: 'Complete the Set',
      titleAr: 'أكمل المجموعة',
    },
  })
  console.log('  ✓ Seeded complete set')
}

async function main() {
  console.log('🌱 Seeding CMS merchandising data...')

  await seedRails()
  await seedCampaigns()
  await seedHeroCards()
  await seedEditorialHotspot()
  await seedNewsletterCta()
  await seedPersonalization()
  await seedRailAutoplay()
  await seedFeaturedSlot()
  await seedCompleteSet()

  console.log('\n✅ CMS seed data complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
