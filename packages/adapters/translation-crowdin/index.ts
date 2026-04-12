import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import {
  PrefillResult,
  TranslationLocale,
  TranslationLocaleStatus,
  TranslationProvider,
  TranslationStatus,
} from '@real/providers/contracts'

const SOURCE_LOCALE: TranslationLocale = 'en'
const TARGET_LOCALE: TranslationLocale = 'ar'

function resolveLocalesDir() {
  const candidates = [
    path.join(process.cwd(), 'packages', 'app', 'lib', 'i18n', 'locales'),
    path.join(process.cwd(), '..', 'packages', 'app', 'lib', 'i18n', 'locales'),
    path.join(process.cwd(), '..', '..', 'packages', 'app', 'lib', 'i18n', 'locales'),
  ]

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]
}

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : []
  }

  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0 && prefix) return [prefix]

  return entries.flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key
    return flattenKeys(child, next)
  })
}

function getByPath(value: unknown, keyPath: string): unknown {
  const parts = keyPath.split('.')
  let cursor: unknown = value
  for (const part of parts) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined
    cursor = (cursor as Record<string, unknown>)[part]
  }
  return cursor
}

function setByPath(root: Record<string, unknown>, keyPath: string, value: unknown) {
  const parts = keyPath.split('.')
  let cursor: Record<string, unknown> = root

  for (let index = 0; index < parts.length; index += 1) {
    const key = parts[index]
    if (!key) return

    if (index === parts.length - 1) {
      cursor[key] = value
      return
    }

    const current = cursor[key]
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      cursor[key] = {}
    }

    cursor = cursor[key] as Record<string, unknown>
  }
}

async function listNamespaces(): Promise<string[]> {
  try {
    const sourceDir = path.join(resolveLocalesDir(), SOURCE_LOCALE)
    const entries = await fs.readdir(sourceDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name.replace(/\.json$/, ''))
      .sort()
  } catch {
    return []
  }
}

async function readLocaleNamespace(locale: TranslationLocale, namespace: string): Promise<Record<string, unknown>> {
  const filePath = path.join(resolveLocalesDir(), locale, `${namespace}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    return parsed as Record<string, unknown>
  } catch {
    return {}
  }
}

async function writeLocaleNamespace(locale: TranslationLocale, namespace: string, value: Record<string, unknown>) {
  const filePath = path.join(resolveLocalesDir(), locale, `${namespace}.json`)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function summarizeLocaleStatus(
  locale: TranslationLocale,
  namespaceStatus: Array<{ namespace: string; totalKeys: number; missingKeys: number }>
): TranslationLocaleStatus {
  const totals = namespaceStatus.reduce(
    (acc, row) => {
      acc.totalKeys += row.totalKeys
      acc.missingKeys += row.missingKeys
      return acc
    },
    { totalKeys: 0, missingKeys: 0 }
  )

  return {
    locale,
    totalKeys: totals.totalKeys,
    missingKeys: totals.missingKeys,
    namespaces: namespaceStatus,
  }
}

async function maybeSyncCrowdinStatus(): Promise<boolean> {
  const useMock = process.env.USE_TRANSLATION_MOCK === 'true'
  if (useMock) return false

  const token = process.env.CROWDIN_TOKEN
  const projectId = process.env.CROWDIN_PROJECT_ID
  if (!token || !projectId) return false

  try {
    const response = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    return response.ok
  } catch {
    return false
  }
}

export const crowdinTranslationAdapter: TranslationProvider = {
  async getStatus() {
    try {
      const namespaces = await listNamespaces()
      const sourceSummary: Array<{ namespace: string; totalKeys: number; missingKeys: number }> = []
      const targetSummary: Array<{ namespace: string; totalKeys: number; missingKeys: number }> = []

      for (const namespace of namespaces) {
        const sourceJson = await readLocaleNamespace(SOURCE_LOCALE, namespace)
        const targetJson = await readLocaleNamespace(TARGET_LOCALE, namespace)

        const sourceKeys = flattenKeys(sourceJson)
        const missing = sourceKeys.filter((keyPath) => {
          const value = getByPath(targetJson, keyPath)
          return typeof value !== 'string' || value.trim().length === 0
        }).length

        sourceSummary.push({ namespace, totalKeys: sourceKeys.length, missingKeys: 0 })
        targetSummary.push({ namespace, totalKeys: sourceKeys.length, missingKeys: missing })
      }

      const connected = await maybeSyncCrowdinStatus()
      const status: TranslationStatus = {
        provider: 'crowdin',
        connected,
        checkedAt: new Date().toISOString(),
        locales: [
          summarizeLocaleStatus(SOURCE_LOCALE, sourceSummary),
          summarizeLocaleStatus(TARGET_LOCALE, targetSummary),
        ],
      }

      return { ok: true, data: status }
    } catch (cause) {
      return {
        ok: false,
        error: {
          code: 'TRANSLATION_STATUS_UNEXPECTED',
          message: cause instanceof Error ? cause.message : 'Unexpected translation status failure.',
        },
      }
    }
  },

  async prefillMissingKeys(input) {
    try {
      const dryRun = input?.dryRun === true
      const namespaces = await listNamespaces()
      let missingBefore = 0
      let missingAfter = 0
      let filledKeys = 0

      for (const namespace of namespaces) {
        const sourceJson = await readLocaleNamespace(SOURCE_LOCALE, namespace)
        const targetJson = await readLocaleNamespace(TARGET_LOCALE, namespace)
        const sourceKeys = flattenKeys(sourceJson)

        for (const keyPath of sourceKeys) {
          const sourceValue = getByPath(sourceJson, keyPath)
          const targetValue = getByPath(targetJson, keyPath)
          const isTargetMissing = typeof targetValue !== 'string' || targetValue.trim().length === 0

          if (isTargetMissing) {
            missingBefore += 1
            if (!dryRun && typeof sourceValue === 'string') {
              setByPath(targetJson, keyPath, sourceValue)
              filledKeys += 1
            }
          }

          const valueAfter = dryRun ? targetValue : getByPath(targetJson, keyPath)
          const stillMissing = typeof valueAfter !== 'string' || valueAfter.trim().length === 0
          if (stillMissing) missingAfter += 1
        }

        if (!dryRun) {
          await writeLocaleNamespace(TARGET_LOCALE, namespace, targetJson)
        }
      }

      const result: PrefillResult = {
        provider: 'crowdin',
        runAt: new Date().toISOString(),
        sourceLocale: SOURCE_LOCALE,
        targetLocale: TARGET_LOCALE,
        filledKeys,
        missingBefore,
        missingAfter,
        dryRun,
      }

      return { ok: true, data: result }
    } catch (cause) {
      return {
        ok: false,
        error: {
          code: 'TRANSLATION_PREFILL_UNEXPECTED',
          message: cause instanceof Error ? cause.message : 'Unexpected translation prefill failure.',
        },
      }
    }
  },
}
