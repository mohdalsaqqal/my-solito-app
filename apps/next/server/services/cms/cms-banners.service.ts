/**
 * CMS Banners — canonical read/write service for ticker and education banners.
 *
 * Owns Prisma-backed ticker and education banner persistence.
 */
import { prisma } from '../../lib/prisma'

export interface TickerItem {
  id: string
  messageEn: string
  messageAr: string
  active: boolean
}

export interface EducationBanner {
  id: string
  titleEn: string
  titleAr: string
  bodyEn: string
  bodyAr: string
  targetPage: string
  active: boolean
}

export interface BannersState {
  ticker: {
    items: TickerItem[]
    speedMs: number
  }
  educationBanners: EducationBanner[]
}

function initialBannersState(): BannersState {
  return {
    ticker: { items: [], speedMs: 4000 },
    educationBanners: [],
  }
}

export async function readBannersState(): Promise<BannersState> {
  try {
    const [tickerItems, settings, eduBanners] = await Promise.all([
      prisma.cmsTickerItem.findMany({ orderBy: { order: 'asc' } }),
      prisma.cmsTickerSettings.findUnique({ where: { id: 'default' } }),
      prisma.cmsEducationBanner.findMany({ orderBy: { order: 'asc' } }),
    ])

    const items: TickerItem[] = tickerItems.map((item) => ({
      id: item.id,
      messageEn: item.messageEn,
      messageAr: item.messageAr,
      active: item.active,
    }))

    const educationBanners: EducationBanner[] = eduBanners.map((b) => ({
      id: b.id,
      titleEn: b.titleEn,
      titleAr: b.titleAr,
      bodyEn: b.bodyEn,
      bodyAr: b.bodyAr,
      targetPage: b.targetPage,
      active: b.active,
    }))

    return {
      ticker: {
        items,
        speedMs: settings?.speedMs ?? 4000,
      },
      educationBanners,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'production') {
      console.error('[cms-banners] Prisma read failed, returning initial state:', message)
    }
    return initialBannersState()
  }
}

export async function writeBannersState(state: BannersState): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    await tx.cmsTickerSettings.upsert({
      where: { id: 'default' },
      create: { speedMs: state.ticker.speedMs },
      update: { speedMs: state.ticker.speedMs },
    })

    await tx.cmsTickerItem.deleteMany()
    for (let i = 0; i < state.ticker.items.length; i++) {
      const item = state.ticker.items[i]
      await tx.cmsTickerItem.create({
        data: {
          id: item.id,
          messageEn: item.messageEn,
          messageAr: item.messageAr,
          active: item.active,
          order: i,
        },
      })
    }

    await tx.cmsEducationBanner.deleteMany()
    for (let i = 0; i < state.educationBanners.length; i++) {
      const b = state.educationBanners[i]
      await tx.cmsEducationBanner.create({
        data: {
          id: b.id,
          titleEn: b.titleEn,
          titleAr: b.titleAr,
          bodyEn: b.bodyEn,
          bodyAr: b.bodyAr,
          targetPage: b.targetPage,
          active: b.active,
          order: i,
        },
      })
    }
  })
}
