/**
 * CMS UGC — canonical read/write service for user-generated content items.
 *
 * Owns Prisma-backed UGC persistence.
 */
import { prisma } from '../../lib/prisma'

export interface UGCItem {
  id: string
  imageUrl: string
  caption: string
  sourceHandle: string
  active: boolean
  order: number
}

export interface UGCState {
  items: UGCItem[]
}

function initialUGCState(): UGCState {
  return { items: [] }
}

export async function readUGCState(): Promise<UGCState> {
  try {
    const items = await prisma.cmsUgcItem.findMany({ orderBy: { order: 'asc' } })
    return {
      items: items.map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        caption: item.caption,
        sourceHandle: item.sourceHandle,
        active: item.active,
        order: item.order,
      })),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'production') {
      console.error('[cms-ugc] Prisma read failed, returning initial state:', message)
    }
    return initialUGCState()
  }
}

export async function writeUGCState(state: UGCState): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    await tx.cmsUgcItem.deleteMany()
    for (let i = 0; i < state.items.length; i++) {
      const item = state.items[i]
      await tx.cmsUgcItem.create({
        data: {
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption,
          sourceHandle: item.sourceHandle,
          active: item.active,
          order: i,
        },
      })
    }
  })
}
