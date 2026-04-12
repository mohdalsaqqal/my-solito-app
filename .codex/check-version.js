#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const AGENTS_PATH = path.join(ROOT, 'AGENTS.md')
const RULES_PATH = path.join(ROOT, '.codex', 'rules.json')

function readAgentsVersion() {
  const content = fs.readFileSync(AGENTS_PATH, 'utf8')
  const match = content.match(/- Version:\s*`([^`]+)`/)
  return match ? match[1] : null
}

function readRulesAgentsVersion() {
  const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'))
  return rules.agentsVersion || null
}

function main() {
  const agentsVersion = readAgentsVersion()
  const rulesAgentsVersion = readRulesAgentsVersion()

  if (!agentsVersion) {
    console.error('[codex:version-check] Could not read AGENTS.md version.')
    process.exit(1)
  }

  if (!rulesAgentsVersion) {
    console.error('[codex:version-check] Missing "agentsVersion" in .codex/rules.json.')
    process.exit(1)
  }

  if (agentsVersion !== rulesAgentsVersion) {
    console.error(`[codex:version-check] Version mismatch: AGENTS.md=${agentsVersion}, .codex/rules.json=${rulesAgentsVersion}`)
    console.error('Update .codex/rules.json "agentsVersion" when AGENTS.md version changes.')
    process.exit(1)
  }

  console.log(`[codex:version-check] OK (${agentsVersion})`)
}

main()
