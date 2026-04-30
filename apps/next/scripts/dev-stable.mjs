import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// ── Step 1: Generate Prisma client ──────────────────────────────────────────

console.log('\n Generating Prisma client…\n')

const prismaResult = spawnSync(
  process.execPath,
  [require.resolve('prisma/build/index.js'), 'generate', '--schema', 'prisma/schema.prisma'],
  { stdio: 'inherit', env: process.env },
)

if (prismaResult.status !== 0) {
  console.error('\n❌ Prisma generate failed. Fix the errors above, then retry.\n')
  process.exit(1)
}

console.log('✅ Prisma client ready.\n')

// ── Step 2: Start Next.js dev server ────────────────────────────────────────

const env = {
  ...process.env,
  WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? 'true',
  CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
  CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? '300',
}

const nextBin = require.resolve('next/dist/bin/next')
const args = [nextBin, 'dev', '--webpack', '--hostname', '0.0.0.0', '--port', process.env.PORT ?? '3000']

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
