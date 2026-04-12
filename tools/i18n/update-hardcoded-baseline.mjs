import fs from 'node:fs/promises'
import path from 'node:path'

const outPath = path.join(process.cwd(), 'tools', 'i18n', 'hardcoded-strings-baseline.json')
const scanTargets = ['packages/app', 'apps/next', 'apps/expo']
const allowedExtensions = new Set(['.tsx', '.jsx'])
const ignoredDirs = new Set(['node_modules', '.next', 'dist', '.git', '.expo'])
const ignoredFileSuffixes = ['.test.ts', '.test.tsx']
const textNodePattern = /<[A-Za-z][^>]*>([^\n<{]*[A-Za-z][^\n<{]*)</g
const fragmentTextPattern = /<>\s*([^\n<{]*[A-Za-z][^\n<{]*)\s*</g
const placeholderPattern = /placeholder=['"][A-Za-z][^'\"]*['"]/g

async function walk(dir, acc) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, acc)
      continue
    }
    const ext = path.extname(entry.name)
    if (!allowedExtensions.has(ext)) continue
    if (ignoredFileSuffixes.some((suffix) => entry.name.endsWith(suffix))) continue
    acc.push(fullPath)
  }
}

function toLine(content, offset) {
  let line = 1
  for (let i = 0; i < offset; i += 1) {
    if (content.charCodeAt(i) === 10) line += 1
  }
  return line
}

async function collectViolations() {
  const files = []
  for (const target of scanTargets) {
    const fullTarget = path.join(process.cwd(), target)
    await walk(fullTarget, files)
  }

  const violations = []
  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8')
    for (const pattern of [textNodePattern, fragmentTextPattern, placeholderPattern]) {
      pattern.lastIndex = 0
      let match = pattern.exec(content)
      while (match) {
        const line = toLine(content, match.index)
        const text = match[0].replace(/\s+/g, ' ').trim()
        violations.push(`${path.relative(process.cwd(), filePath)}:${line}:${text}`)
        match = pattern.exec(content)
      }
    }
  }

  return violations.sort()
}

async function run() {
  const violations = await collectViolations()
  await fs.writeFile(outPath, `${JSON.stringify({ violations }, null, 2)}\n`, 'utf8')
  console.log(`[i18n:guard:baseline] updated with ${violations.length} entries`)
}

run().catch((error) => {
  console.error('[i18n:guard:baseline] failed', error)
  process.exit(1)
})
