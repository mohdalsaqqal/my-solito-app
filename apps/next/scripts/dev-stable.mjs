import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const env = {
  ...process.env,
  WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? 'true',
  CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
  CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? '300',
}

const require = createRequire(import.meta.url)
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
