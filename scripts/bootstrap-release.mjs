#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const VALID_TARGETS = new Set(['local-prod', 'preview', 'production'])

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  return process.argv[index + 1] ?? fallback
}

const target = argValue('--target', 'preview')
const apply = process.argv.includes('--apply')
let failed = 0

function pass(label) {
  console.log(`[bootstrap-release] PASS ${label}`)
}

function warn(label, detail = '') {
  console.warn(`[bootstrap-release] WARN ${label}${detail ? `: ${detail}` : ''}`)
}

function fail(label, detail = '') {
  failed += 1
  console.error(`[bootstrap-release] FAIL ${label}${detail ? `: ${detail}` : ''}`)
}

function hasEnv(name) {
  return Boolean(process.env[name]?.trim())
}

function requireEnv(name) {
  if (hasEnv(name)) pass(`${name} configured`)
  else fail(`${name} missing`)
}

function run(label, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: {
      ...process.env,
      DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
    },
    stdio: 'inherit',
    shell: false,
  })

  if (result.status === 0) pass(label)
  else fail(label, `exit ${result.status ?? 'unknown'}`)
}

if (!VALID_TARGETS.has(target)) {
  fail('target is valid', `expected one of ${Array.from(VALID_TARGETS).join(', ')}`)
} else {
  pass(`target ${target}`)
}

requireEnv('DATABASE_URL')
requireEnv('DIRECT_URL')
requireEnv('AUTH_SESSION_SECRET')
requireEnv('BETTER_AUTH_SECRET')

if (target === 'production') {
  if (hasEnv('NEXT_PUBLIC_APP_URL') || hasEnv('APP_BASE_URL')) {
    pass('production app URL configured')
  } else {
    fail('production app URL missing', 'set NEXT_PUBLIC_APP_URL or APP_BASE_URL')
  }
}

if (hasEnv('ADMIN_EMAIL') && hasEnv('ADMIN_PASSWORD')) {
  pass('admin seed credentials configured')
} else {
  warn('admin seed credentials not configured', 'ADMIN_EMAIL and ADMIN_PASSWORD are required only when seeding')
}

if (target === 'production' && process.env.USE_MOCK?.trim().toLowerCase() === 'true') {
  fail('production mock provider guard', 'USE_MOCK=true is not allowed for production bootstrap')
}

run(
  'Prisma schema validates',
  process.execPath,
  ['../../node_modules/prisma/build/index.js', 'validate', '--schema', 'prisma/schema.prisma'],
  { cwd: 'apps/next' },
)

if (apply) {
  run(
    'Prisma migrations applied',
    process.execPath,
    ['../../node_modules/prisma/build/index.js', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
    { cwd: 'apps/next' },
  )
  run(
    'Prisma client generated',
    process.execPath,
    ['../../node_modules/prisma/build/index.js', 'generate', '--schema', 'prisma/schema.prisma'],
    { cwd: 'apps/next' },
  )

  if (hasEnv('ADMIN_EMAIL') && hasEnv('ADMIN_PASSWORD')) {
    run('Admin seed applied', process.execPath, ['scripts/seed-admin.mjs'])
  } else {
    warn('admin seed skipped', 'missing ADMIN_EMAIL or ADMIN_PASSWORD')
  }
} else {
  pass('check-only mode')
  console.log('[bootstrap-release] rerun with --apply to apply migrations, generate Prisma client, and seed admin credentials when configured')
}

if (failed > 0) {
  console.error(`[bootstrap-release] ${failed} failed`)
  process.exit(1)
}

console.log('[bootstrap-release] all checks passed')
