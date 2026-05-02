import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`

function run(command, args) {
  return spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
  })
}

function stopProcessTree(pid) {
  if (process.platform === 'win32') {
    const result = run('taskkill.exe', ['/pid', String(pid), '/t', '/f'])
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout)
      process.exit(result.status ?? 1)
    }
    return
  }

  try {
    process.kill(-pid, 'SIGTERM')
  } catch {
    // The process may have already exited.
  }
}

function cleanupPortListener(targetPort) {
  if (process.platform !== 'win32') return

  const netstat = run('cmd.exe', ['/c', `netstat -ano | findstr :${targetPort}`])
  if (netstat.status !== 0 || !netstat.stdout) return

  const listener = netstat.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.includes('LISTENING'))

  if (!listener) return

  const pid = listener.split(/\s+/).at(-1)
  if (!pid || pid === String(process.pid)) return

  const processLookup = run('powershell.exe', [
    '-NoProfile',
    '-Command',
    `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName`,
  ])
  if (!processLookup.stdout.toLowerCase().includes('node')) return

  console.log(`[e2e:pharmacist] Stopping stale node listener on port ${targetPort} (PID ${pid})`)
  stopProcessTree(Number(pid))
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}

    await wait(1_000)
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function main() {
  cleanupPortListener(port)
  let exitStatus = 1

  const server =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', 'yarn web:dev'], {
          cwd: rootDir,
          stdio: 'inherit',
          env: {
            ...process.env,
            PORT: String(port),
            BETTER_AUTH_SECRET:
              process.env.BETTER_AUTH_SECRET ?? 'pharmacist-browser-local-secret-0000000000',
            REQUIRE_PRODUCTION_AUTH: 'false',
          },
        })
      : spawn('yarn', ['web:dev'], {
          cwd: rootDir,
          stdio: 'inherit',
          detached: true,
          env: {
            ...process.env,
            PORT: String(port),
            BETTER_AUTH_SECRET:
              process.env.BETTER_AUTH_SECRET ?? 'pharmacist-browser-local-secret-0000000000',
            REQUIRE_PRODUCTION_AUTH: 'false',
          },
        })

  try {
    await waitForServer(baseUrl, 120_000)

    const result = spawnSync(
      process.execPath,
      ['node_modules/playwright/cli.js', 'test', 'e2e/pharmacist.spec.ts', '--workers=1'],
      {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_WEBSERVER: 'true',
          PLAYWRIGHT_BASE_URL: baseUrl,
        },
      },
    )

    if (result.error) {
      console.error(result.error)
    }

    exitStatus = result.status ?? 1
  } finally {
    if (server.pid) {
      stopProcessTree(server.pid)
    }
    cleanupPortListener(port)
  }

  process.exit(exitStatus)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
