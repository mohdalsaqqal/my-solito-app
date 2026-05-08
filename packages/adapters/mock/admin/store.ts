import fs from 'node:fs/promises'
import path from 'node:path'
import { createAdminMockSeed, type AdminMockState } from './seed'

const stateFilePath = path.join(process.cwd(), '.data', 'admin-mock-state.json')

let writeChain = Promise.resolve()
let memoryState: AdminMockState | null = null
let fileStoreAvailable: boolean | null = null

function cloneState(state: AdminMockState): AdminMockState {
  return JSON.parse(JSON.stringify(state)) as AdminMockState
}

function getMemoryState() {
  if (!memoryState) {
    memoryState = createAdminMockSeed()
  }
  return cloneState(memoryState)
}

function setMemoryState(state: AdminMockState) {
  memoryState = cloneState(state)
}

function normalizeState(parsed: Partial<AdminMockState>): AdminMockState | null {
  if (
    !Array.isArray(parsed.products) ||
    !Array.isArray(parsed.orders) ||
    !Array.isArray(parsed.inventory) ||
    !Array.isArray(parsed.vendors) ||
    !Array.isArray(parsed.jobs)
  ) {
    return null
  }

  const state = parsed as AdminMockState
  const needsProductReseed = state.products.some((product) =>
    /^SKU-\d+$/.test(product.sku ?? '') || / Product \d+$/i.test(product.title)
  )

  if (!needsProductReseed) {
    return state
  }

  const seed = createAdminMockSeed()
  return {
    ...state,
    products: seed.products,
  }
}

async function ensureStoreFile() {
  if (fileStoreAvailable === false) return false
  const seed = createAdminMockSeed()
  try {
    await fs.mkdir(path.dirname(stateFilePath), { recursive: true })
    try {
      await fs.access(stateFilePath)
    } catch {
      await fs.writeFile(stateFilePath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8')
    }
    fileStoreAvailable = true
    return true
  } catch {
    fileStoreAvailable = false
    setMemoryState(seed)
    return false
  }
}

export async function readAdminMockState(): Promise<AdminMockState> {
  if (!(await ensureStoreFile())) {
    return getMemoryState()
  }

  try {
    const raw = await fs.readFile(stateFilePath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AdminMockState>
    const state = normalizeState(parsed) ?? createAdminMockSeed()
    await fs.writeFile(stateFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    setMemoryState(state)
    return state
  } catch {
    fileStoreAvailable = false
    return getMemoryState()
  }
}

export async function writeAdminMockState(state: AdminMockState) {
  setMemoryState(state)
  if (!(await ensureStoreFile())) return
  try {
    await fs.writeFile(stateFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  } catch {
    fileStoreAvailable = false
  }
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
