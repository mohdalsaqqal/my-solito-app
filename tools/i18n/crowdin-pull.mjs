import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

async function run() {
  if (!process.env.CROWDIN_PROJECT_ID || !process.env.CROWDIN_TOKEN) {
    console.log('[i18n:crowdin:pull] skipped (missing CROWDIN_PROJECT_ID/CROWDIN_TOKEN)')
    return
  }

  await execFileAsync('npx', ['crowdin', 'download', '--config', 'crowdin.yml'])
  console.log('[i18n:crowdin:pull] completed')
}

run().catch((error) => {
  console.error('[i18n:crowdin:pull] failed', error)
  process.exit(1)
})
