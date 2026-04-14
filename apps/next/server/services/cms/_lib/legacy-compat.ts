/**
 * Legacy-compat shim for ADMIN_DATA_DIR / ensureAdminDataDir.
 * These are used by page-version-store and page-config-store.
 * TODO: migrate those stores to use a dedicated config path helper.
 */
import path from 'node:path'

export const ADMIN_DATA_DIR = path.join(process.cwd(), '.data')

export function ensureAdminDataDir() {
  // No-op: Prisma doesn't need directory creation
}
