import path from 'path'
import { createRequire } from 'module'
import fs from 'fs'

const require = createRequire(import.meta.url)
const reactNativeWebEntry = require.resolve('react-native-web')

// Read webpack cache toggle from admin store (defaults to disabled for memory safety)
function readWebpackCacheEnabled() {
  try {
    const file = path.join(process.cwd(), '.data', 'admin-cache.json')
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed.enabled === true
  } catch {
    return false
  }
}
const webpackCacheEnabled = readWebpackCacheEnabled()

// Vercel preview deployments include a live feedback widget served from vercel.live.
const isVercelPreview = process.env.VERCEL_ENV === 'preview'
const vercelLiveSources = isVercelPreview ? ' https://vercel.live' : ''

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${vercelLiveSources}`,
  "style-src 'self' 'unsafe-inline'",
  process.env.NODE_ENV === 'production'
    ? `script-src 'self'${vercelLiveSources}`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

// HSTS enabled by default in production, opt-out with ENABLE_HSTS=false
const enableHsts = process.env.ENABLE_HSTS !== 'false'
  && process.env.NODE_ENV === 'production'
if (enableHsts) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  })
}

/**
 * @type {import('next').NextConfig}
 */
const withWebpack = {
  webpack(config) {
    config.cache = webpackCacheEnabled ? undefined : false

    if (!config.resolve) {
      config.resolve = {}
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native': reactNativeWebEntry,
      'react-native$': reactNativeWebEntry,
      '@rn-primitives/slot$': path.resolve(import.meta.dirname, '../../packages/ui/reusables/lib/rn-slot.tsx'),
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter',
    }

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...(config.resolve?.extensions ?? []),
    ]

    return config
  },
}

/**
 * @type {import('next').NextConfig}
 */
const withTurbopack = {
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
      '@rn-primitives/slot': path.resolve(import.meta.dirname, '../../packages/ui/reusables/lib/rn-slot.tsx'),
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter',
    },
    resolveExtensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.mjs',
      '.tsx',
      '.ts',
      '.jsx',
      '.json',
      '.wasm',
    ],
    root: path.resolve(import.meta.dirname, '../..'),
  },
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // TODO(security): remove once admin page @/components/ui/* imports are resolved
  typescript: { ignoreBuildErrors: true },
  transpilePackages: [
    '@real/app',
    '@real/ui',
    '@real/tokens',
    '@real/providers',
    '@real/adapters',
    'react-native',
    'react-native-web',
    'solito',
    'react-native-reanimated',
    'moti',
    'react-native-gesture-handler',
  ],
  compiler: {
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    },
  },
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  // ── Security Headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  ...withWebpack,
  ...withTurbopack,
}

// ── Bundle Analyzer (enabled via ANALYZE=true env var) ─────────────────
let finalConfig = nextConfig

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = await import('@next/bundle-analyzer')
  finalConfig = withBundleAnalyzer.default({
    enabled: true,
  })(nextConfig)
}

export default finalConfig
