import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const expoDir = join(rootDir, 'apps', 'expo')

function log(message) {
  console.log(`[expo-functional] ${message}`)
}

function fail(message) {
  console.error(`[expo-functional] FAIL: ${message}`)
  process.exitCode = 1
}

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    fail(`missing ${relativePath}`)
    return ''
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    fail(label)
    return
  }
  log(`PASS ${label}`)
}

const appJson = read('apps/expo/app.json')
const packageJson = read('apps/expo/package.json')
const appEntry = read('apps/expo/App.tsx')
const routeEntry = read('apps/expo/app/index.tsx')
const router = read('apps/expo/app/_components/AppRouter.tsx')
const routerTypes = read('apps/expo/app/_components/AppRouter.types.ts')
const apiClient = read('apps/expo/app/apiClient.ts')
const pushRegistration = read('apps/expo/app/registerPushNotifications.ts')
const easJson = read('eas.json')

assert('Expo app config declares native platforms and scheme', /"platforms"\s*:\s*\[\s*"ios"\s*,\s*"android"\s*\]/s.test(appJson) && /"scheme"\s*:/.test(appJson))
assert('Expo app has start/android/ios scripts', /"start"\s*:\s*"expo start"/.test(packageJson) && /"android"\s*:/.test(packageJson) && /"ios"\s*:/.test(packageJson))
assert('Expo root wraps shared app with SafeArea and Toast providers', /SafeAreaProvider/.test(appEntry) && /ToastProvider/.test(appEntry))
assert('Expo root starts push registration', /registerPushNotifications/.test(appEntry))
assert('Expo API client points to Next server API bridge', /createApiClient/.test(apiClient) && /baseUrl/.test(apiClient))
assert('Expo API client does not expose trusted mutation bypass secret', !/x-rc-trusted-request/.test(apiClient))
assert('Expo API client sends same-origin provenance headers for native mutations', /origin:\s*baseUrl/.test(apiClient) && /referer:\s*`\$\{baseUrl\}\/`/.test(apiClient))

const expectedViews = [
  'home',
  'categories',
  'shop',
  'deals',
  'account',
  'product',
  'checkout',
  'cart',
  'auth-login',
  'auth-register',
  'auth-forgot',
  'search',
  'orders',
  'order-detail',
  'account-test-detail',
]

for (const view of expectedViews) {
  assert(`ExpoView includes ${view}`, new RegExp(`['"]${view}['"]`).test(routerTypes))
}

for (const view of expectedViews.filter((view) => view !== 'home')) {
  assert(`AppRouter renders ${view}`, new RegExp(`view\\s*===\\s*['"]${view}['"]`).test(router))
}

assert('AppRouter default route renders HomeScreen', /<HomeScreen/.test(router))
assert('Native checkout uses API quote and order placement', /apiClient\.checkout\.quote/.test(router) && /apiClient\.orders\.place/.test(router))
assert('Native checkout branches normalize stock count', /stockCount:\s*branch\.stockCount\s*\?\?\s*0/.test(routeEntry))
assert('Expo push registration uses expo-notifications', /expo-notifications/.test(pushRegistration))
assert('Expo push registration posts token through API client', /apiClient\.notifications\.registerDevice/.test(pushRegistration))
assert('Expo push registration skips until EAS project id exists', /Expo project id is not configured/.test(pushRegistration))
assert('EAS config defines development preview production profiles', /"development"\s*:/.test(easJson) && /"preview"\s*:/.test(easJson) && /"production"\s*:/.test(easJson))

const apiRouteProbe = spawnSync(
  process.platform === 'win32' ? 'powershell.exe' : 'sh',
  process.platform === 'win32'
    ? ['-NoProfile', '-Command', "Get-ChildItem -Path 'app' -Recurse -Filter '*+api.ts' -File | Select-Object -First 1"]
    : ['-lc', "find app -name '*+api.ts' -print -quit"],
  { cwd: expoDir, encoding: 'utf8' },
)
assert('Expo app does not define server API routes; Next owns server/data layer', apiRouteProbe.stdout.trim().length === 0)

const configProbe = spawnSync(
  process.platform === 'win32' ? 'cmd.exe' : 'yarn',
  process.platform === 'win32'
    ? ['/d', '/s', '/c', 'yarn expo config --json']
    : ['expo', 'config', '--json'],
  { cwd: expoDir, encoding: 'utf8', timeout: 60_000 },
)
assert('Expo config resolves locally', configProbe.status === 0 && configProbe.stdout.includes('"sdkVersion"'))
