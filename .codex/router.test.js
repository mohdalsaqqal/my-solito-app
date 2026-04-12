const test = require('node:test')
const assert = require('node:assert/strict')

const {
  parseArgs,
  detectCategory,
  detectPauseTriggers,
  pickPrompt,
  shouldAutoRunGuard,
  loadRules
} = require('./router')

const rules = loadRules()

test('parseArgs reads mode/run-guard/json/task correctly', () => {
  const parsed = parseArgs([
    'node',
    '.codex/router.js',
    '--mode',
    'reviewer',
    '--run-guard',
    '--json',
    'review',
    'cart',
    'drawer'
  ])

  assert.equal(parsed.mode, 'reviewer')
  assert.equal(parsed.runGuard, true)
  assert.equal(parsed.json, true)
  assert.equal(parsed.task, 'review cart drawer')
})

test('detectCategory routes clear UI task to ui category', () => {
  const category = detectCategory('implement product card hover animation', rules)
  assert.equal(category, 'ui')
})

test('detectCategory falls back to workflow when no keywords match', () => {
  const category = detectCategory('xqzv random unmatched text', rules)
  assert.equal(category, 'workflow')
})

test('detectPauseTriggers catches top-level folder and runtime plugin triggers', () => {
  const hits = detectPauseTriggers('create new top-level folder for runtime plugin engine', rules)
  const ids = hits.map((hit) => hit.id).sort()
  assert.deepEqual(ids, ['new_top_level_folder', 'runtime_plugin_system'])
})

test('pickPrompt honors explicit mode override', () => {
  const category = rules.categories.ui
  const prompt = pickPrompt(category, 'reviewer', rules)
  assert.equal(prompt, 'prompts/reviewer.md')
})

test('shouldAutoRunGuard enables auto guard for build-like tasks', () => {
  const category = rules.categories.architecture
  assert.equal(shouldAutoRunGuard('finalize release build verification', category, false), true)
  assert.equal(shouldAutoRunGuard('small refactor', category, false), false)
  assert.equal(shouldAutoRunGuard('small refactor', category, true), true)
})
