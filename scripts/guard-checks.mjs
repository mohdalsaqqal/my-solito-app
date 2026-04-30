import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const EXCLUDED_DIRS = new Set(['node_modules', '.next', 'dist'])

function rel(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/')
}

function isExcluded(filePath) {
  return filePath.split(path.sep).some((segment) => EXCLUDED_DIRS.has(segment))
}

function walk(targetPath, files = []) {
  const absolutePath = path.resolve(ROOT_DIR, targetPath)
  if (!statExists(absolutePath) || isExcluded(absolutePath)) {
    return files
  }

  const stat = statSync(absolutePath)
  if (stat.isDirectory()) {
    for (const entry of readdirSync(absolutePath)) {
      walk(path.join(targetPath, entry), files)
    }
    return files
  }

  files.push(absolutePath)
  return files
}

function statExists(targetPath) {
  try {
    statSync(targetPath)
    return true
  } catch {
    return false
  }
}

function collectFiles(targets, exclude = () => false) {
  const seen = new Set()
  const files = []

  for (const target of targets) {
    for (const filePath of walk(target)) {
      const normalized = rel(filePath)
      if (exclude(normalized) || seen.has(normalized)) {
        continue
      }
      seen.add(normalized)
      files.push(filePath)
    }
  }

  return files
}

function searchInFiles({ targets, regex, exclude, pathOnly = false }) {
  const matches = []

  for (const filePath of collectFiles(targets, exclude)) {
    const relativePath = rel(filePath)

    if (pathOnly) {
      if (regex.test(relativePath)) {
        matches.push(`${relativePath}`)
      }
      continue
    }

    let source = ''
    try {
      source = readFileSync(filePath, 'utf8')
    } catch {
      continue
    }

    const lines = source.split(/\r?\n/)
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      regex.lastIndex = 0
      if (regex.test(line)) {
        matches.push(`${relativePath}:${index + 1}:${line.trim()}`)
      }
    }
  }

  return matches
}

function runCheck(label, options) {
  console.log(`[guard] ${label}`)
  const matches = searchInFiles(options)
  if (matches.length > 0) {
    console.error(`[guard] Violation: ${label}`)
    for (const match of matches.slice(0, 20)) {
      console.error(match)
    }
    if (matches.length > 20) {
      console.error(`[guard] …and ${matches.length - 20} more`)
    }
    process.exit(1)
  }
}

function runNodeScript(label, args) {
  console.log(`[guard] ${label}`)
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

runCheck('No className in packages/app', {
  targets: ['packages/app'],
  regex: /className=/,
})

runCheck('No inline style visual tokens bypass in shared packages', {
  targets: ['packages/app', 'packages/ui'],
  regex: /style=\{\{[^}]*\b(margin|padding|fontSize|lineHeight|fontWeight|borderRadius|color)\b/,
})

runCheck('No process.env in shared packages', {
  targets: ['packages/app', 'packages/ui'],
  regex: /process\.env/,
})

runCheck('No tests in forbidden package locations', {
  targets: ['packages/app', 'packages/ui'],
  regex: /__tests__/,
  pathOnly: true,
})

runCheck('No direct adapter imports in app/ui/expo/next app layer (except BFF)', {
  targets: ['packages/app', 'packages/ui', 'apps/expo', 'apps/next/app'],
  regex: /from '@real\/adapters/,
  exclude: (relativePath) => relativePath.startsWith('apps/next/app/api/'),
})

runCheck('No direct adapter imports in BFF routes', {
  targets: ['apps/next/app/api'],
  regex: /from '@real\/adapters/,
  exclude: (relativePath) => relativePath.includes('/admin/') && relativePath.includes('/sync/'),
})

runCheck('Search service delegates catalog discovery to SearchProvider', {
  targets: ['apps/next/server/services/search/search.service.ts'],
  regex: /public-discovery|getPublicCatalogCollections/,
})

runCheck('No Next.js Link imports in shared screens', {
  targets: ['packages/app/screens'],
  regex: /from ['"]next\/link['"]/,
})

runCheck('No moved pricing/referral API helper imports in server services', {
  targets: ['apps/next/server/services'],
  regex:
    /app\/api\/_lib\/(pricing-quote|referral-(profile|program|ledger)-store)|\.\.\/\.\.\/\.\.\/app\/api\/_lib\/(pricing-quote|referral-(profile|program|ledger)-store)|\.\.\/\.\.\/app\/api\/_lib\/(pricing-quote|referral-(profile|program|ledger)-store)/,
})

runCheck('No direct pharmacist provider orchestration in pharmacist API routes', {
  targets: ['apps/next/app/api/pharmacist'],
  regex: /pharmacistProvider|from '@real\/providers'/,
})

runCheck('No direct mock order persistence in order placement service', {
  targets: ['apps/next/server/services/orders/place-order.service.ts'],
  regex: /node:fs|mock-orders\.json|writeFile|persistPlacedOrder/,
})

runCheck('No provider imports inside packages/ui', {
  targets: ['packages/ui'],
  regex: /from '@real\/providers/,
})

runCheck('No raw hex colors in shared packages', {
  targets: ['packages/app', 'packages/ui'],
  regex: /#[0-9a-fA-F]{3,8}/,
})

runCheck('No deprecated Solito props', {
  targets: ['packages', 'apps'],
  regex: /viewProps=|textProps=/,
})

runCheck('No solito/router in App Router paths', {
  targets: ['apps/next/app', 'packages/app'],
  regex: /from ['"]solito\/router['"]/,
})

runCheck('No unsupported pseudo classes in shared/native code', {
  targets: ['packages/app', 'packages/ui', 'apps/expo'],
  regex: /visited:|before:|after:/,
})

runCheck('No reanimated side-effect import in Next app entries/layouts', {
  targets: ['apps/next'],
  regex: /import ['"]react-native-reanimated['"]/,
})

runNodeScript('CSS token bridge is up to date', ['scripts/generate-css-token-bridge.mjs', '--check'])
runNodeScript('No new hardcoded user-facing strings', ['tools/i18n/hardcoded-strings-check.mjs'])

console.log('[guard] All checks passed')
