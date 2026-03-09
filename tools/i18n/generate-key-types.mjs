import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const enDir = path.join(root, 'packages', 'app', 'lib', 'i18n', 'locales', 'en')
const outFile = path.join(root, 'packages', 'app', 'lib', 'i18n', 'generated', 'translation-keys.ts')
const dtsFile = path.join(root, 'packages', 'app', 'lib', 'i18n', 'generated', 'i18next.d.ts')

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

async function run() {
  const entries = await fs.readdir(enDir, { withFileTypes: true })
  const namespaces = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name.replace(/\.json$/, ''))
    .sort()

  const keys = []
  for (const ns of namespaces) {
    const file = path.join(enDir, `${ns}.json`)
    const raw = await fs.readFile(file, 'utf8')
    const json = JSON.parse(raw)
    const namespaceKeys = flatten(json).map((key) => `${ns}.${key}`)
    keys.push(...namespaceKeys)
  }

  const uniqueKeys = Array.from(new Set(keys)).sort()
  const union = uniqueKeys.length > 0 ? uniqueKeys.map((key) => `  | '${key}'`).join('\n') : "  | never"
  const output = `export type TranslationKey =\n${union}\n`

  await fs.mkdir(path.dirname(outFile), { recursive: true })
  await fs.writeFile(outFile, output, 'utf8')

  const moduleAugmentation = `import 'i18next'\nimport type common from '../locales/en/common.json'\n\ndeclare module 'i18next' {\n  interface CustomTypeOptions {\n    defaultNS: 'common'\n    resources: {\n      common: typeof common\n    }\n  }\n}\n`
  await fs.writeFile(dtsFile, moduleAugmentation, 'utf8')

  console.log(`[i18n:types] generated ${uniqueKeys.length} keys`) 
}

run().catch((error) => {
  console.error('[i18n:types] failed', error)
  process.exit(1)
})
