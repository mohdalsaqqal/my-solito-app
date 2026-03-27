import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const ROUTE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'api', 'cms', 'home', 'route.ts')
const RELEASE_ENV_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'api', '_lib', 'release-env.ts')
const TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'types.ts')
const RESPONSE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'api', '_lib', 'response.ts')

async function readSource(filePath: string) {
  return fs.readFile(filePath, 'utf8').catch(() => '')
}

test('homepage route resolves default store context into the shared payload contract', async () => {
  const [routeSource, releaseEnvSource, typesSource] = await Promise.all([
    readSource(ROUTE_PATH),
    readSource(RELEASE_ENV_PATH),
    readSource(TYPES_PATH),
  ])

  assert.match(releaseEnvSource, /export function resolveStoreId/)
  assert.match(releaseEnvSource, /DEFAULT_STORE_ID = ['"]default['"]/)
  assert.match(releaseEnvSource, /return DEFAULT_STORE_ID/)
  assert.match(routeSource, /const storeId = resolveStoreId\(request\)/)
  assert.match(routeSource, /storeId,/)
  assert.match(typesSource, /storeId: string/)
})

test('homepage route uses the normalized API envelope helpers for success and failure responses', async () => {
  const [routeSource, responseSource] = await Promise.all([
    readSource(ROUTE_PATH),
    readSource(RESPONSE_PATH),
  ])

  assert.match(responseSource, /export function ok/)
  assert.match(responseSource, /export function fail/)
  assert.match(routeSource, /return fail\(/)
  assert.match(routeSource, /const response = ok\(/)
  assert.match(routeSource, /return response/)
})
