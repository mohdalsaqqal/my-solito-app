import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const localesRoot = path.join(root, 'packages', 'app', 'lib', 'i18n', 'locales')
const locales = ['en', 'ar']

function flatten(obj, prefix = '') {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return prefix ? [prefix] : []
  }

  const entries = Object.entries(obj)
  if (entries.length === 0 && prefix) return [prefix]

  return entries.flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key
    return flatten(value, next)
  })
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function run() {
  const sourceDir = path.join(localesRoot, 'en')
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const namespaces = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)

  const violations = []

  for (const namespaceFile of namespaces) {
    const source = await readJson(path.join(localesRoot, 'en', namespaceFile))
    const sourceKeys = new Set(flatten(source))

    for (const locale of locales) {
      const targetPath = path.join(localesRoot, locale, namespaceFile)
      let target
      try {
        target = await readJson(targetPath)
      } catch {
        violations.push(`[${locale}] missing namespace file: ${namespaceFile}`)
        continue
      }

      const targetKeys = new Set(flatten(target))
      for (const key of sourceKeys) {
        if (!targetKeys.has(key)) {
          violations.push(`[${locale}] missing key ${namespaceFile.replace(/\.json$/, '')}.${key}`)
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('[i18n:check] failed')
    for (const violation of violations) {
      console.error(` - ${violation}`)
    }
    process.exit(1)
  }

  console.log('[i18n:check] passed')
}

run().catch((error) => {
  console.error('[i18n:check] failed', error)
  process.exit(1)
})
