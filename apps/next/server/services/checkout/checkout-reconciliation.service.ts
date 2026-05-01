import fs from 'node:fs/promises'
import path from 'node:path'

export type CheckoutReconciliationKind =
  | 'loyalty_reversal_required'
  | 'order_write_back_failed'
  | 'referral_ledger_failed'

export type CheckoutReconciliationRecord = {
  id: string
  kind: CheckoutReconciliationKind
  orderId?: string
  pricingQuoteId: string
  userId: string
  paymentIntentId?: string
  loyaltyHistoryEntryIds?: string[]
  referralCode?: string
  errorCode?: string
  errorMessage: string
  createdAt: string
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'checkout-reconciliation-store.json')

async function readRecords(): Promise<CheckoutReconciliationRecord[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CheckoutReconciliationRecord[]) : []
  } catch {
    return []
  }
}

export async function listCheckoutReconciliationRecords() {
  return readRecords()
}

export async function clearCheckoutReconciliationRecords() {
  await fs.rm(STORAGE_FILE, { force: true })
}

export async function recordCheckoutReconciliation(
  input: Omit<CheckoutReconciliationRecord, 'id' | 'createdAt'>,
) {
  const records = await readRecords()
  const record: CheckoutReconciliationRecord = {
    ...input,
    id: `checkout-reconcile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }

  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify([record, ...records], null, 2), 'utf8')
  return record
}
