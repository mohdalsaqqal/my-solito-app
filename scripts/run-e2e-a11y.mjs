import { spawnSync } from 'node:child_process'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const PORT = 3000
const baseUrl = process.env.A11Y_BASE_URL ?? process.env.FUNCTIONAL_BASE_URL ?? 'http://localhost:3000'
const useExternalServer = baseUrl !== 'http://localhost:3000'
const vercelProtectionBypass = process.env.VERCEL_PROTECTION_BYPASS

function run(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  })
}

function stopProcessTree(pid) {
  if (process.platform === 'win32') {
    const result = run('powershell.exe', [
      '-NoProfile',
      '-Command',
      `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`,
    ])
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout)
      process.exit(result.status ?? 1)
    }
    return
  }
}

function cleanupPortListener(port) {
  if (process.platform !== 'win32') {
    return
  }

  const netstat = run('cmd.exe', ['/c', `netstat -ano | findstr :${port}`])
  if (netstat.status !== 0 || !netstat.stdout) {
    return
  }

  const listener = netstat.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.includes('LISTENING'))

  if (!listener) {
    return
  }

  const pid = listener.split(/\s+/).at(-1)
  if (!pid || pid === String(process.pid)) {
    return
  }

  const processLookup = run('powershell.exe', [
    '-NoProfile',
    '-Command',
    `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName`,
  ])
  if (!processLookup.stdout.toLowerCase().includes('node')) {
    return
  }

  console.log(`[e2e:a11y] Stopping stale node listener on port ${port} (PID ${pid})`)
  stopProcessTree(pid)
}

if (!useExternalServer) {
  cleanupPortListener(PORT)
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForServer(url, timeoutMs) {
  const readyUrl = new URL(url)
  if (vercelProtectionBypass) {
    readyUrl.searchParams.set('x-vercel-protection-bypass', vercelProtectionBypass)
  }
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(readyUrl)
      if (response.ok) {
        return
      }
    } catch {}

    await wait(1_000)
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function main() {
  const server = useExternalServer
    ? null
    : process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', 'yarn web:dev'], {
        cwd: ROOT_DIR,
        stdio: 'inherit',
      })
    : spawn('yarn', ['web:dev'], {
        cwd: ROOT_DIR,
        stdio: 'inherit',
      })

  try {
    await waitForServer(baseUrl, 120_000)

    const result = spawnSync(
      process.execPath,
      ['node_modules/playwright/cli.js', 'test', 'e2e/accessibility.spec.ts', '--workers=1'],
      {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseUrl,
          PLAYWRIGHT_SKIP_WEBSERVER: 'true',
        },
      },
    )

    if (result.error) {
      console.error(result.error)
    }

    process.exit(result.status ?? 1)
  } finally {
    if (!server) {
      return
    }
    if (process.platform === 'win32' && server.pid) {
      stopProcessTree(server.pid)
    } else {
      server.kill('SIGTERM')
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
