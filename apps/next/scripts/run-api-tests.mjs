#!/usr/bin/env node
/**
 * Cross-platform wrapper for running the API test suite.
 *
 * Yarn 4's built-in shell treats `?` as a glob character, breaking
 * DATABASE_URL query strings on Windows. This script sets env vars
 * in-process and spawns the test runner directly.
 */
import { spawnSync } from 'node:child_process'
import * as path from 'node:path'

const env = {
  ...process.env,
  NODE_ENV: 'test',
  REQUIRE_PRODUCTION_AUTH: 'false',
  BETTER_AUTH_SECRET: 'test-better-auth-secret-32-characters-minimum',
  AUTH_SESSION_SECRET: 'test-auth-session-secret-32-characters-minimum',
  DATABASE_URL:
    'postgresql://postgres:postgres@localhost:5432/real_commerce?connect_timeout=2',
}

const tsxCli = path.resolve(process.cwd(), '../../node_modules/tsx/dist/cli.mjs')

const result = spawnSync(
  process.execPath,
  [
    '--max-old-space-size=4096',
    tsxCli,
    '--test',
    '--test-concurrency=1',
    '--test-timeout=30000',
    'app/api/**/*.test.ts',
    'server/services/**/*.test.ts',
  ],
  {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
    shell: false,
  }
)

process.exit(result.status ?? 1)
