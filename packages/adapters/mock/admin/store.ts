import fs from 'node:fs/promises'
import path from 'node:path'
import { createAdminMockSeed, type AdminMockState } from './seed'

const stateFilePath = path.join(process.cwd(), '.data', 'admin-mock-state.json')

let writeChain = Promise.resolve()

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(stateFilePath), { recursive: true })
  try {
    await fs.access(stateFilePath)
  } catch {
    await fs.writeFile(stateFilePath, `${JSON.stringify(createAdminMockSeed(), null, 2)}\n`, 'utf8')
  }
}

export async function readAdminMockState(): Promise<AdminMockState> {
  await ensureStoreFile()
  const raw = await fs.readFile(stateFilePath, 'utf8')
  const parsed = JSON.parse(raw) as Partial<AdminMockState>
  if (
    !Array.isArray(parsed.products) ||
    !Array.isArray(parsed.orders) ||
    !Array.isArray(parsed.inventory) ||
    !Array.isArray(parsed.vendors) ||
    !Array.isArray(parsed.jobs)
  ) {
    const seed = createAdminMockSeed()
    await fs.writeFile(stateFilePath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8')
    return seed
  }

  const state = parsed as AdminMockState
  const needsProductReseed = state.products.some((product) =>
    /^SKU-\d+$/.test(product.sku ?? '') || / Product \d+$/i.test(product.title)
  )

  if (needsProductReseed) {
    const seed = createAdminMockSeed()
    const migratedState: AdminMockState = {
      ...state,
      products: seed.products,
    }
    await fs.writeFile(stateFilePath, `${JSON.stringify(migratedState, null, 2)}\n`, 'utf8')
    return migratedState
  }

  return state
}

export async function writeAdminMockState(state: AdminMockState) {
  await ensureStoreFile()
  await fs.writeFile(stateFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export async function updateAdminMockState(
  updater: (state: AdminMockState) => void | AdminMockState
): Promise<AdminMockState> {
  writeChain = writeChain.then(async () => {
    const state = await readAdminMockState()
    const nextState = updater(state) ?? state
    await writeAdminMockState(nextState)
  })
  await writeChain
  return readAdminMockState()
}
