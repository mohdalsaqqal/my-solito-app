#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = process.cwd()
const RULES_PATH = path.join(ROOT, '.codex', 'rules.json')
const CONTEXT_PATH = path.join(ROOT, '.codex', 'context.md')

function loadRules() {
  return JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'))
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const out = { mode: null, runGuard: false, json: false, task: '' }
  const taskParts = []

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i]
    if (token === '--mode') {
      out.mode = args[i + 1] || null
      i += 1
      continue
    }
    if (token === '--run-guard') {
      out.runGuard = true
      continue
    }
    if (token === '--json') {
      out.json = true
      continue
    }
    taskParts.push(token)
  }

  out.task = taskParts.join(' ').trim()
  return out
}

function normalizeText(value) {
  return (value || '').toLowerCase()
}

function scoreCategory(taskText, category) {
  const task = normalizeText(taskText)
  return category.keywords.reduce((score, keyword) => {
    return task.includes(normalizeText(keyword)) ? score + 1 : score
  }, 0)
}

function detectCategory(taskText, rules) {
  let best = {
    key: 'workflow',
    score: scoreCategory(taskText, rules.categories.workflow)
  }
  for (const [key, category] of Object.entries(rules.categories)) {
    const score = scoreCategory(taskText, category)
    if (score > best.score) {
      best = { key, score }
    }
  }
  return best.key
}

function detectPauseTriggers(taskText, rules) {
  const task = normalizeText(taskText)
  return rules.pauseTriggers
    .filter((trigger) => trigger.keywords.some((keyword) => task.includes(normalizeText(keyword))))
    .map((trigger) => ({ id: trigger.id, description: trigger.description }))
}

function scopeFolders(taskText, categoryKey, rules) {
  const task = normalizeText(taskText)
  const scope = new Set(rules.categories[categoryKey].defaultScope || [])
  for (const hint of rules.scopeHints || []) {
    if (hint.keywords.some((keyword) => task.includes(normalizeText(keyword)))) {
      for (const folder of hint.folders || []) {
        scope.add(folder)
      }
    }
  }
  return Array.from(scope)
}

function pickPrompt(category, mode, rules) {
  if (mode && rules.modePromptMap[mode]) return rules.modePromptMap[mode]
  return category.promptTemplate
}

function shouldAutoRunGuard(taskText, category, runGuardFlag) {
  if (runGuardFlag) return true
  const task = normalizeText(taskText)
  const buildLike = /(build|ship|release|ready for pr|merge|finalize|verification)/.test(task)
  return Boolean(category.guardRequired && buildLike)
}

function runGuardChecks() {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/c', 'yarn guard:checks'], { stdio: 'inherit', cwd: ROOT })
    : spawnSync('yarn', ['guard:checks'], { stdio: 'inherit', cwd: ROOT })
  return result.status === 0
}

function printUsage() {
  console.log('Usage:')
  console.log('  node .codex/router.js "task text"')
  console.log('  node .codex/router.js --mode reviewer "review cart changes"')
  console.log('  node .codex/router.js --run-guard "finalize checkout task"')
}

function main() {
  const rules = loadRules()
  const args = parseArgs(process.argv)

  if (!args.task) {
    printUsage()
    process.exit(1)
  }

  const detectedCategoryKey = detectCategory(args.task, rules)
  const category = rules.categories[detectedCategoryKey]
  const pauseHits = detectPauseTriggers(args.task, rules)
  const promptTemplate = pickPrompt(category, args.mode, rules)
  const scopedFolders = scopeFolders(args.task, detectedCategoryKey, rules)
  const guardWillRun = shouldAutoRunGuard(args.task, category, args.runGuard)

  const result = {
    task: args.task,
    sourceOfTruth: 'AGENTS.md',
    contextPath: path.relative(ROOT, CONTEXT_PATH),
    detectedDomain: category.domain,
    selectedCategory: detectedCategoryKey,
    selectedWorkflow: promptTemplate,
    selectedModel: category.defaultModel,
    planningRequired: category.planningRequired,
    guardRequired: category.guardRequired,
    scopedFolders,
    header: {
      Domain: category.domain,
      Skills: category.skills.join(', ')
    },
    pauseTriggers: pauseHits
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log('=== Codex Task Route ===')
    console.log(`Task: ${result.task}`)
    console.log(`Domain: ${result.detectedDomain}`)
    console.log(`Skills: ${category.skills.join(', ')}`)
    console.log(`Workflow template: .codex/${result.selectedWorkflow}`)
    console.log(`Recommended model: ${result.selectedModel}`)
    console.log(`Planning required: ${result.planningRequired ? 'yes' : 'no'}`)
    console.log(`Guard required: ${result.guardRequired ? 'yes' : 'no'}`)
    console.log(`Scoped folders: ${result.scopedFolders.join(', ')}`)
    console.log('')
    console.log('Header to use:')
    console.log(`Domain: ${result.header.Domain}`)
    console.log(`Skills: ${result.header.Skills}`)
  }

  if (pauseHits.length > 0) {
    console.error('')
    console.error('PAUSE TRIGGER DETECTED')
    for (const hit of pauseHits) {
      console.error(`- ${hit.id}: ${hit.description}`)
    }
    console.error('Stop and request user guidance before implementation.')
    process.exit(2)
  }

  if (guardWillRun) {
    console.log('')
    console.log('Running guard checks: yarn guard:checks')
    const ok = runGuardChecks()
    if (!ok) {
      console.error('Guard checks failed. Use .codex/prompts/guard-fail.md workflow.')
      process.exit(3)
    }
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  loadRules,
  parseArgs,
  normalizeText,
  scoreCategory,
  detectCategory,
  detectPauseTriggers,
  scopeFolders,
  pickPrompt,
  shouldAutoRunGuard,
  runGuardChecks
}
