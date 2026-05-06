import { spawnSync } from 'node:child_process'

const gates = {
  'guard-checks': {
    command: 'node scripts/guard-checks.mjs',
    aspect: 'Architecture & Design System',
    required: true,
  },
  'next-typecheck': {
    command:
      'node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false',
    aspect: 'Architecture & Design System',
    required: true,
  },
  'expo-functional': {
    command: 'yarn verify:expo-functional',
    aspect: 'Storefront Web & Native',
    required: true,
  },
  'notifications-focused': {
    command: 'yarn verify:notifications',
    aspect: 'Notifications',
    required: true,
  },
  'retention-consultation-focused': {
    command: 'yarn verify:retention-consultation',
    aspect: 'User & Account Management',
    required: false,
  },
  'account-management': {
    command: 'yarn verify:account-management',
    aspect: 'User & Account Management',
    required: false,
  },
  'payments-checkout': {
    command: 'yarn verify:payments-checkout',
    aspect: 'Payments & Checkout',
    required: false,
  },
  'odoo-static': {
    command: 'node scripts/smoke-odoo-connection.mjs',
    aspect: 'Backend Integration',
    required: false,
  },
  'shopify-scope': {
    command: 'yarn verify:shopify-scope',
    aspect: 'Backend Integration',
    required: false,
  },
  'postgresql-mapping': {
    command: 'yarn verify:postgresql-mapping',
    aspect: 'Backend Integration',
    required: false,
  },
  'meilisearch-adapter': {
    command: 'yarn verify:meilisearch-adapter',
    aspect: 'Backend Integration',
    required: false,
  },
  'search-discovery': {
    command: 'yarn verify:search-discovery',
    aspect: 'Search & Discovery',
    required: false,
  },
  'storefront-static': {
    command: 'yarn verify:functional-storefront:static',
    aspect: 'Storefront Web & Native',
    required: true,
  },
  'storefront-live': {
    command: 'yarn verify:functional-storefront',
    aspect: 'Storefront Web & Native',
    required: false,
  },
  'cms-lifecycle': {
    command: 'yarn verify:cms-lifecycle',
    aspect: 'CMS & Content Management',
    required: false,
  },
  'pharmacist-browser': {
    command: 'yarn verify:pharmacist-browser',
    aspect: 'Storefront Web & Native',
    required: false,
  },
  'e2e-a11y': {
    command: 'yarn e2e:a11y',
    aspect: 'Quality & Testing',
    required: false,
  },
  'expo-typecheck': {
    command: 'yarn --cwd apps/expo tsc --noEmit --incremental false',
    aspect: 'Storefront Web & Native',
    required: true,
  },
  'next-api-full': {
    command: 'yarn --cwd apps/next test:api',
    aspect: 'Quality & Testing',
    required: true,
  },
  'next-build': {
    command: 'yarn workspace next-app build',
    aspect: 'DevOps & Deployment',
    required: false,
  },
  'devops-deployment': {
    command: 'yarn verify:devops-deployment',
    aspect: 'DevOps & Deployment',
    required: false,
  },
  'provider-readiness': {
    command: 'yarn verify:provider-readiness',
    aspect: 'DevOps & Deployment',
    required: false,
  },
  'operations-observability': {
    command: 'yarn verify:operations-observability',
    aspect: 'Operations & Observability',
    required: false,
  },
  'security-compliance': {
    command: 'yarn verify:security-compliance',
    aspect: 'Security & Compliance',
    required: false,
  },
  'platform-operations': {
    command: 'yarn verify:platform-operations',
    aspect: 'Platform Operations',
    required: false,
  },
  'documentation-knowledge': {
    command: 'yarn verify:documentation-knowledge',
    aspect: 'Documentation & Knowledge',
    required: false,
  },
  'ai-development-process': {
    command: 'yarn verify:ai-development-process',
    aspect: 'AI Development Process',
    required: false,
  },
  'launch-post-launch': {
    command: 'yarn verify:launch-post-launch',
    aspect: 'Launch & Post-Launch',
    required: false,
  },
}

const profiles = {
  current: [
    'guard-checks',
    'next-typecheck',
    'expo-functional',
    'expo-typecheck',
    'notifications-focused',
    'retention-consultation-focused',
    'next-api-full',
  ],
  quality: [
    'guard-checks',
    'next-typecheck',
    'expo-functional',
    'expo-typecheck',
    'notifications-focused',
    'retention-consultation-focused',
    'account-management',
    'payments-checkout',
    'search-discovery',
    'cms-lifecycle',
    'storefront-static',
    'next-api-full',
    'next-build',
  ],
  functional: [
    'guard-checks',
    'next-typecheck',
    'expo-functional',
    'expo-typecheck',
    'notifications-focused',
    'retention-consultation-focused',
    'storefront-static',
    'pharmacist-browser',
  ],
  backend: [
    'guard-checks',
    'next-typecheck',
    'odoo-static',
    'retention-consultation-focused',
    'shopify-scope',
    'postgresql-mapping',
    'meilisearch-adapter',
  ],
  account: [
    'guard-checks',
    'next-typecheck',
    'account-management',
    'retention-consultation-focused',
  ],
  payments: [
    'guard-checks',
    'next-typecheck',
    'payments-checkout',
    'retention-consultation-focused',
    'storefront-static',
  ],
  search: [
    'guard-checks',
    'next-typecheck',
    'meilisearch-adapter',
    'search-discovery',
    'storefront-static',
  ],
  notifications: [
    'guard-checks',
    'next-typecheck',
    'expo-functional',
    'notifications-focused',
  ],
  deploy: [
    'guard-checks',
    'next-typecheck',
    'devops-deployment',
    'provider-readiness',
    'next-build',
  ],
  operations: [
    'guard-checks',
    'next-typecheck',
    'operations-observability',
  ],
  security: [
    'guard-checks',
    'next-typecheck',
    'security-compliance',
  ],
  platform: [
    'guard-checks',
    'next-typecheck',
    'platform-operations',
  ],
  docs: [
    'documentation-knowledge',
  ],
  ai: [
    'ai-development-process',
  ],
  launch: [
    'launch-post-launch',
  ],
  full: [
    'guard-checks',
    'next-typecheck',
    'expo-functional',
    'notifications-focused',
    'account-management',
    'payments-checkout',
    'storefront-static',
    'storefront-live',
    'cms-lifecycle',
    'odoo-static',
    'shopify-scope',
    'postgresql-mapping',
    'meilisearch-adapter',
    'search-discovery',
    'devops-deployment',
    'operations-observability',
    'security-compliance',
    'platform-operations',
    'documentation-knowledge',
    'ai-development-process',
    'launch-post-launch',
    'pharmacist-browser',
    'e2e-a11y',
    'expo-typecheck',
    'next-api-full',
    'next-build',
  ],
  hardening: ['expo-typecheck', 'next-api-full', 'next-build'],
}

function printUsage() {
  console.log(`Delivery verifier

Usage:
  node scripts/verify-delivery.mjs
  node scripts/verify-delivery.mjs --profile full
  node scripts/verify-delivery.mjs --gate expo-typecheck
  node scripts/verify-delivery.mjs --list

Profiles:
${Object.entries(profiles)
  .map(([name, gateNames]) => `  ${name}: ${gateNames.join(', ')}`)
  .join('\n')}
`)
}

function printList() {
  console.log('Delivery gates:')
  for (const [name, gate] of Object.entries(gates)) {
    const marker = gate.required ? 'required' : 'hardening'
    const blocker = gate.blocker ? `, blocker: ${gate.blocker}` : ''
    console.log(`- ${name} (${marker}, aspect: ${gate.aspect}${blocker})`)
    console.log(`  ${gate.command}`)
  }
}

function parseArgs(argv) {
  const selected = {
    profile: 'current',
    gates: [],
    list: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      selected.help = true
    } else if (arg === '--list') {
      selected.list = true
    } else if (arg === '--profile') {
      selected.profile = argv[index + 1] ?? selected.profile
      index += 1
    } else if (arg === '--gate') {
      const gateName = argv[index + 1]
      if (gateName) selected.gates.push(gateName)
      index += 1
    } else {
      console.error(`[delivery] Unknown argument: ${arg}`)
      selected.help = true
    }
  }

  return selected
}

function runCommand(command) {
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', command]
      : ['-lc', command]

  return spawnSync(shell, args, {
    stdio: 'inherit',
    env: process.env,
  })
}

function resolveGateNames(selection) {
  if (selection.gates.length > 0) {
    return selection.gates
  }

  const gateNames = profiles[selection.profile]
  if (!gateNames) {
    throw new Error(`Unknown profile "${selection.profile}". Run --list for options.`)
  }
  return gateNames
}

const selection = parseArgs(process.argv.slice(2))

if (selection.help) {
  printUsage()
  process.exit(selection.list ? 0 : 1)
}

if (selection.list) {
  printList()
  process.exit(0)
}

let gateNames
try {
  gateNames = resolveGateNames(selection)
} catch (cause) {
  console.error(`[delivery] ${cause instanceof Error ? cause.message : String(cause)}`)
  printUsage()
  process.exit(1)
}

for (const gateName of gateNames) {
  const gate = gates[gateName]
  if (!gate) {
    console.error(`[delivery] Unknown gate: ${gateName}`)
    printList()
    process.exit(1)
  }

  console.log(`\n[delivery] RUN ${gateName}`)
  console.log(`[delivery] Aspect: ${gate.aspect}`)
  console.log(`[delivery] Command: ${gate.command}`)
  const result = runCommand(gate.command)

  if (result.status !== 0) {
    console.error(`\n[delivery] BLOCKER`)
    console.error(`[delivery] Gate: ${gateName}`)
    console.error(`[delivery] Aspect: ${gate.aspect}`)
    console.error(`[delivery] Command: ${gate.command}`)
    if (gate.blocker) {
      console.error(`[delivery] Known blocker: ${gate.blocker}`)
      console.error(`[delivery] See: docs/delivery/BLOCKERS.md`)
    } else {
      console.error(`[delivery] Add or update a blocker in docs/delivery/BLOCKERS.md`)
    }
    process.exit(result.status ?? 1)
  }

  console.log(`[delivery] PASS ${gateName}`)
}

console.log(`\n[delivery] PASS profile=${selection.gates.length > 0 ? 'custom' : selection.profile}`)
