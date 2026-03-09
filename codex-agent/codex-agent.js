const TelegramBot = require('node-telegram-bot-api')
const { spawn, exec } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const axios = require('axios')
require('dotenv').config()

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ALLOWED_USER = Number(process.env.TELEGRAM_ALLOWED_USER_ID || '0')
const DEFAULT_REPO_PATH = path.resolve(__dirname, '..')
const REPO_PATH_WINDOWS = process.env.REPO_PATH_WINDOWS || DEFAULT_REPO_PATH
const REPO_PATH_WSL = process.env.REPO_PATH_WSL || DEFAULT_REPO_PATH
const CODEX_BIN_WINDOWS = process.env.CODEX_BIN_WINDOWS || 'codex'
const CODEX_BIN_WSL = process.env.CODEX_BIN_WSL || 'codex'
const OUTPUT_IDLE_MS = Number(process.env.CODEX_OUTPUT_IDLE_MS || '2500')
const OUTPUT_MAX_MS = Number(process.env.CODEX_OUTPUT_MAX_MS || '45000')

if (!TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN in environment.')
if (!ALLOWED_USER) throw new Error('Missing TELEGRAM_ALLOWED_USER_ID in environment.')

const TMP_DIR = path.join(__dirname, '.tmp')
const REGISTRY_PATH = path.join(TMP_DIR, 'session-registry.json')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

const bot = new TelegramBot(TOKEN, { polling: true })

let defaultEngine = process.env.CODEX_ENGINE_DEFAULT === 'win' ? 'win' : 'wsl'
let sessionCounter = 0
let activeSessionId = null
const sessions = new Map()
let taskMode = {
  enabled: false,
  sessionId: null,
  buffer: [],
}

function isAllowed(msg) {
  return msg?.from?.id === ALLOWED_USER
}

function nowIso() {
  return new Date().toISOString()
}

function chunkMessage(input, max = 3500) {
  const result = []
  let text = (input || '').trim()
  while (text.length > max) {
    result.push(text.slice(0, max))
    text = text.slice(max)
  }
  if (text.length > 0) result.push(text)
  return result.length ? result : ['(No output)']
}

function sanitizeTerminalOutput(input) {
  if (!input) return ''
  let text = String(input)
    .replace(/\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g, '')
    .replace(/[\u001B\u009B][[\]()#;?]*(?:(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><~])/g, '')
    .replace(/[\u0000-\u0008\u000B-\u001A\u001C-\u001F\u007F]/g, '')

  text = text.replace(/\[\?(?:\d{1,5})(?:;\d{1,5})*[hl]/g, '')
  text = text.replace(/\[\d{1,5}(?:;\d{1,5})*[A-Za-z]/g, '')

  return text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function sendChunked(chatId, text) {
  for (const part of chunkMessage(text)) {
    // eslint-disable-next-line no-await-in-loop
    await bot.sendMessage(chatId, part)
  }
}

function runExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
        return
      }
      resolve(stdout)
    })
  })
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function detectWslCodexCandidates() {
  const candidates = new Set([CODEX_BIN_WSL, 'codex'])
  const linuxUser = process.env.USER || path.basename(os.homedir() || '') || 'hamoo'
  const extRoot = `/mnt/c/Users/${linuxUser}/.vscode/extensions`
  if (fs.existsSync(extRoot)) {
    try {
      for (const entry of fs.readdirSync(extRoot)) {
        if (!entry.startsWith('openai.chatgpt-')) continue
        const candidate = path.posix.join(extRoot, entry, 'bin/linux-x86_64/codex')
        if (fs.existsSync(candidate)) {
          candidates.add(candidate)
        }
      }
    } catch {
      // ignore extension directory read errors
    }
  }
  return Array.from(candidates)
}

function resolveRepoPath(engine) {
  const configured = engine === 'win' ? REPO_PATH_WINDOWS : REPO_PATH_WSL
  if (configured && fs.existsSync(configured)) return configured
  return DEFAULT_REPO_PATH
}

async function validateEngineBinary(engine) {
  if (engine === 'wsl') {
    const candidates = detectWslCodexCandidates()
    let lastError = ''

    for (const bin of candidates) {
      try {
        const probe = `${shellQuote(bin)} --version`
        const cmd = process.platform === 'win32'
          ? `wsl bash -lc ${shellQuote(probe)}`
          : `bash -lc ${shellQuote(probe)}`
        await runExec(cmd)
        return bin
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }
    throw new Error(
      `No usable WSL Codex binary found. Tried: ${candidates.join(', ')}. Last error: ${lastError}`
    )
  }
  await runExec(`${CODEX_BIN_WINDOWS} --version`)
  return CODEX_BIN_WINDOWS
}

function spawnCodexProcess(engine, repoPath, codexBin) {
  const targetBin = codexBin || (engine === 'wsl' ? CODEX_BIN_WSL : CODEX_BIN_WINDOWS)
  const codexCommand = `env NO_COLOR=1 CLICOLOR=0 FORCE_COLOR=0 ${shellQuote(targetBin)} --no-alt-screen`
  const interactiveCommand = `cd ${shellQuote(repoPath)} && if command -v script >/dev/null 2>&1; then script -qfc ${shellQuote(codexCommand)} /dev/null; else ${codexCommand}; fi`

  if (engine === 'wsl') {
    if (process.platform === 'win32') {
      return spawn('wsl', ['bash', '-lc', interactiveCommand], {
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    }
    return spawn('bash', ['-lc', interactiveCommand], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  }

  return spawn(targetBin, [], {
    cwd: repoPath,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

function serializeRegistry() {
  const rows = Array.from(sessions.values()).map((session) => ({
    id: session.id,
    label: session.label,
    engine: session.engine,
    repoPath: session.repoPath,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    promptCount: session.promptCount,
  }))
  return {
    activeSessionId,
    defaultEngine,
    rows,
  }
}

function saveRegistry() {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(serializeRegistry(), null, 2), 'utf8')
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return
  try {
    const parsed = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
    defaultEngine = parsed.defaultEngine === 'win' ? 'win' : 'wsl'
    if (Array.isArray(parsed.rows)) {
      for (const row of parsed.rows) {
        sessionCounter += 1
        sessions.set(row.id, {
          id: row.id,
          label: row.label || row.id,
          engine: row.engine === 'win' ? 'win' : 'wsl',
          repoPath: row.repoPath || resolveRepoPath(defaultEngine),
          createdAt: row.createdAt || nowIso(),
          lastUsedAt: row.lastUsedAt || nowIso(),
          promptCount: Number(row.promptCount || 0),
          process: null,
          busy: false,
        })
      }
    }
    activeSessionId = parsed.activeSessionId && sessions.has(parsed.activeSessionId) ? parsed.activeSessionId : null
  } catch {
    // ignore malformed registry
  }
}

function createSessionId() {
  sessionCounter += 1
  return `s-${String(sessionCounter).padStart(3, '0')}`
}

function getSession(id) {
  if (!id) return null
  return sessions.get(id) || null
}

function getActiveSession() {
  return getSession(activeSessionId)
}

async function stopSessionProcess(session) {
  if (!session?.process) return
  const proc = session.process
  session.process = null
  session.busy = false

  await new Promise((resolve) => {
    let doneCalled = false
    const done = () => {
      if (!doneCalled) {
        doneCalled = true
        resolve()
      }
    }
    proc.once('exit', done)
    proc.kill('SIGTERM')
    setTimeout(() => {
      try {
        proc.kill('SIGKILL')
      } catch {
        // ignore
      }
      done()
    }, 1000)
  })
}

async function ensureSessionProcess(chatId, session) {
  if (session.process) return true

  try {
    session.codexBin = await validateEngineBinary(session.engine)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (session.engine === 'win') {
      session.engine = 'wsl'
      await bot.sendMessage(
        chatId,
        `⚠️ Session ${session.id}: Windows preflight failed, switched to WSL.\n${message.slice(0, 900)}`
      )
      try {
        session.codexBin = await validateEngineBinary(session.engine)
      } catch (fallbackError) {
        const fallbackMessage =
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        await bot.sendMessage(
          chatId,
          `⚠️ Session ${session.id}: WSL preflight failed.\n${fallbackMessage.slice(0, 1200)}`
        )
        return false
      }
    } else {
      await bot.sendMessage(chatId, `⚠️ Session ${session.id}: WSL preflight failed.\n${message.slice(0, 1200)}`)
      return false
    }
  }

  session.repoPath = resolveRepoPath(session.engine)
  session.process = spawnCodexProcess(session.engine, session.repoPath, session.codexBin)
  session.busy = false

  session.process.on('error', async (error) => {
    session.process = null
    session.busy = false
    await bot.sendMessage(chatId, `⚠️ Session ${session.id} start failed: ${error.message}`)
  })

  session.process.on('exit', () => {
    session.process = null
    session.busy = false
  })

  session.process.stderr.on('data', async (data) => {
    const text = data.toString().trim()
    if (text) {
      await sendChunked(chatId, `⚠️ ${text.slice(0, 3000)}`)
    }
  })

  saveRegistry()
  return true
}

async function createSession(chatId, engine = defaultEngine) {
  const id = createSessionId()
  const session = {
    id,
    label: `${engine.toUpperCase()} ${id}`,
    engine,
    repoPath: resolveRepoPath(engine),
    createdAt: nowIso(),
    lastUsedAt: nowIso(),
    promptCount: 0,
    process: null,
    busy: false,
  }

  sessions.set(id, session)
  activeSessionId = id
  saveRegistry()

  const ok = await ensureSessionProcess(chatId, session)
  if (!ok) return null

  await bot.sendMessage(chatId, `🧠 New session ${id} started (${session.engine})`)
  return session
}

function sessionListText() {
  if (sessions.size === 0) return 'No sessions. Send /new to start one.'
  const lines = ['Sessions:']
  for (const session of sessions.values()) {
    lines.push(
      `${activeSessionId === session.id ? '• *' : '• '} ${session.id} | ${session.engine} | prompts=${session.promptCount} | busy=${session.busy ? 'yes' : 'no'} | last=${session.lastUsedAt}`
    )
  }
  return lines.join('\n')
}

async function selectSession(chatId, id) {
  const session = getSession(id)
  if (!session) {
    await bot.sendMessage(chatId, `Session not found: ${id}`)
    return null
  }
  activeSessionId = session.id
  session.lastUsedAt = nowIso()
  saveRegistry()
  await bot.sendMessage(chatId, `✅ Active session: ${session.id} (${session.engine})`)
  return session
}

async function deleteSession(chatId, id) {
  const session = getSession(id)
  if (!session) {
    await bot.sendMessage(chatId, `Session not found: ${id}`)
    return
  }
  await stopSessionProcess(session)
  sessions.delete(id)
  if (activeSessionId === id) {
    activeSessionId = sessions.size ? Array.from(sessions.keys())[0] : null
  }
  saveRegistry()
  await bot.sendMessage(chatId, `🗑 Session removed: ${id}`)
}

async function sendPrompt(chatId, prompt, sessionId = activeSessionId) {
  if (!prompt || !prompt.trim()) {
    await bot.sendMessage(chatId, 'No prompt text provided.')
    return
  }

  let session = getSession(sessionId)
  if (!session) {
    session = await createSession(chatId, defaultEngine)
    if (!session) return
  }

  if (session.busy) {
    await bot.sendMessage(chatId, `⏳ Session ${session.id} is busy.`)
    return
  }

  const ready = await ensureSessionProcess(chatId, session)
  if (!ready || !session.process) {
    await bot.sendMessage(chatId, `⚠️ Unable to start session ${session.id}.`)
    return
  }
  const proc = session.process

  activeSessionId = session.id
  session.lastUsedAt = nowIso()
  session.promptCount += 1
  session.busy = true
  saveRegistry()

  await bot.sendMessage(chatId, `🧠 Running on ${session.id}...`)

  let output = ''
  let idleHandle = null
  let maxHandle = null
  let finalized = false

  const finalize = async () => {
    if (finalized) return
    finalized = true
    if (idleHandle) clearTimeout(idleHandle)
    if (maxHandle) clearTimeout(maxHandle)
    proc.stdout.off('data', onStdout)
    session.busy = false
    session.lastUsedAt = nowIso()
    saveRegistry()
    await bot.sendMessage(chatId, `✅ ${session.id} finished`)
    const cleanOutput = sanitizeTerminalOutput(output)
    await sendChunked(chatId, cleanOutput || '(No output captured. Increase CODEX_OUTPUT_MAX_MS if needed.)')
  }

  const armIdle = () => {
    if (idleHandle) clearTimeout(idleHandle)
    idleHandle = setTimeout(() => {
      void finalize()
    }, OUTPUT_IDLE_MS)
  }

  const onStdout = (data) => {
    output += data.toString()
    armIdle()
  }

  proc.stdout.on('data', onStdout)
  proc.once('exit', () => {
    void finalize()
  })
  maxHandle = setTimeout(() => {
    void finalize()
  }, OUTPUT_MAX_MS)

  if (!proc.stdin || proc.killed) {
    session.busy = false
    saveRegistry()
    await bot.sendMessage(chatId, `⚠️ Session ${session.id} is not writable. Start /new and retry.`)
    return
  }
  proc.stdin.write(`${prompt.trim()}\n`)
  armIdle()
}

async function processVoice(chatId, voice) {
  await bot.sendMessage(chatId, '🎤 Processing voice...')
  const file = await bot.getFile(voice.file_id)
  const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`
  const oggPath = path.join(TMP_DIR, `voice-${Date.now()}.ogg`)
  const wavPath = oggPath.replace(/\.ogg$/, '.wav')

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    fs.writeFileSync(oggPath, response.data)
    await runExec(`ffmpeg -y -i "${oggPath}" "${wavPath}"`)
    await runExec(`whisper "${wavPath}" --model base --language en --output_format txt --output_dir "${TMP_DIR}"`)
    const transcriptPath = wavPath.replace(/\.wav$/, '.txt')
    const transcript = fs.existsSync(transcriptPath) ? fs.readFileSync(transcriptPath, 'utf8').trim() : ''
    if (!transcript) {
      await bot.sendMessage(chatId, '⚠️ Voice transcript was empty.')
      return
    }
    await sendChunked(chatId, `📝 ${transcript}`)
    await sendPrompt(chatId, transcript)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Voice processing failed.'
    await bot.sendMessage(chatId, `⚠️ ${message}`)
  } finally {
    for (const filePath of [oggPath, wavPath, wavPath.replace(/\.wav$/, '.txt')]) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      } catch {
        // ignore
      }
    }
  }
}

function outputModeText() {
  return [
    'Output handling:',
    '- mode: final-only (buffered)',
    `- idle cutoff: ${OUTPUT_IDLE_MS}ms`,
    `- max cutoff: ${OUTPUT_MAX_MS}ms`,
  ].join('\n')
}

function helpText() {
  return [
    'Commands:',
    '/new -> create and select new persistent session',
    '/sessions -> session listing',
    '/use <id> -> session selection',
    '/close <id> -> close session',
    '/engine win | /engine wsl -> set default engine for new sessions',
    '/starttask -> begin long prompt mode',
    '/run -> execute buffered prompt',
    '/output -> output handling details',
  ].join('\n')
}

loadRegistry()

bot.on('polling_error', (error) => {
  // Keep agent alive on Telegram transport glitches.
  console.error('[polling_error]', error?.message || error)
})

bot.on('webhook_error', (error) => {
  console.error('[webhook_error]', error?.message || error)
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = (msg.text || '').trim()
  if (!isAllowed(msg)) return
  if (!text) return

  const lower = text.toLowerCase()

  if (lower === '/help') {
    await bot.sendMessage(chatId, helpText())
    return
  }

  if (lower === '/new') {
    await createSession(chatId, defaultEngine)
    return
  }

  if (lower === '/sessions' || lower === 'session listing') {
    await bot.sendMessage(chatId, sessionListText())
    return
  }

  if (lower === '/output' || lower === 'output handling') {
    await bot.sendMessage(chatId, outputModeText())
    return
  }

  if (lower === '/engine win' || lower === 'windows + wsl engine switching') {
    defaultEngine = 'win'
    saveRegistry()
    await bot.sendMessage(chatId, 'Default engine set to Windows.')
    return
  }

  if (lower === '/engine wsl') {
    defaultEngine = 'wsl'
    saveRegistry()
    await bot.sendMessage(chatId, 'Default engine set to WSL.')
    return
  }

  if (lower === '/starttask' || lower === 'long prompt mode') {
    const active = getActiveSession() || (await createSession(chatId, defaultEngine))
    if (!active) return
    taskMode = {
      enabled: true,
      sessionId: active.id,
      buffer: [],
    }
    await bot.sendMessage(chatId, `Long prompt mode started on ${active.id}. Send lines then /run.`)
    return
  }

  if (lower === '/run') {
    if (!taskMode.enabled || !taskMode.buffer.length) {
      await bot.sendMessage(chatId, 'No buffered long prompt. Use /starttask first.')
      return
    }
    const prompt = taskMode.buffer.join('\n')
    const targetSessionId = taskMode.sessionId
    taskMode = { enabled: false, sessionId: null, buffer: [] }
    await sendPrompt(chatId, prompt, targetSessionId)
    return
  }

  if (lower === 'session selection') {
    await bot.sendMessage(chatId, 'Use /use <sessionId> (example: /use s-001)')
    return
  }

  if (lower === 'persistent sessions') {
    await bot.sendMessage(chatId, 'Enabled. Sessions remain alive in this agent process and are selectable with /use.')
    return
  }

  if (lower === 'voice prompts') {
    await bot.sendMessage(chatId, 'Enabled. Send Telegram voice note and it will be transcribed with Whisper.')
    return
  }

  if (lower.startsWith('/use ')) {
    const id = text.split(' ')[1]?.trim()
    if (!id) {
      await bot.sendMessage(chatId, 'Usage: /use <sessionId>')
      return
    }
    await selectSession(chatId, id)
    return
  }

  if (lower.startsWith('/close ')) {
    const id = text.split(' ')[1]?.trim()
    if (!id) {
      await bot.sendMessage(chatId, 'Usage: /close <sessionId>')
      return
    }
    await deleteSession(chatId, id)
    return
  }

  if (taskMode.enabled) {
    taskMode.buffer.push(text)
    await bot.sendMessage(chatId, `Captured line ${taskMode.buffer.length}. Send /run when ready.`)
    return
  }

  await sendPrompt(chatId, text)
})

bot.on('voice', async (msg) => {
  if (!isAllowed(msg)) return
  if (!msg.voice) return
  await processVoice(msg.chat.id, msg.voice)
})
