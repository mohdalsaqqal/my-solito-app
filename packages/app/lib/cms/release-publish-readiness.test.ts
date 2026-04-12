import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const READINESS_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'cms', 'release-publish-readiness.ts')

test('release publish readiness delegates query rules to the shared query-reference helper', async () => {
  const source = await fs.readFile(READINESS_PATH, 'utf8')

  assert.match(source, /import \{ validateBlockQueryReference \} from '\.\/query-references'/)
  assert.match(source, /const queryIssues = validateBlockQueryReference\(parsed, activeQueries, \{/)
  assert.match(source, /issues\.push\(/)
  assert.match(source, /BLOCK_QUERY_REQUIRED/)
  assert.match(source, /BLOCK_QUERY_INACTIVE/)
  assert.doesNotMatch(source, /mode is "rule-based"/)
  assert.doesNotMatch(source, /references missing\/inactive query "\$\{parsed\.querySlug\}"/)
})
