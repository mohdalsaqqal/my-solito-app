import { prisma } from '../../../server/lib/prisma'

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

function initialState(): UGCState {
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
  } catch {
    return initialState()
  }
}

export async function writeUGCState(state: UGCState): Promise<void> {
  await prisma.$transaction(async (tx) => {
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
