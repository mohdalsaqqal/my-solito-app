#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'

let failed = 0

function pass(label) {
  console.log(`[security-compliance] PASS ${label}`)
}

function fail(label, detail = '') {
  failed += 1
  console.error(`[security-compliance] FAIL ${label}${detail ? `: ${detail}` : ''}`)
}

function read(path) {
  if (!existsSync(path)) {
    fail(`missing ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function expectIncludes(label, content, needle) {
  if (content.includes(needle)) {
    pass(label)
  } else {
    fail(label, `missing ${needle}`)
  }
}

function expectMatch(label, content, pattern) {
  if (pattern.test(content)) {
    pass(label)
  } else {
    fail(label, `missing ${pattern}`)
  }
}

const nextConfig = read('apps/next/next.config.mjs')
const securityPolicy = read('apps/next/app/api/_lib/security-policy.ts')
const requestAuth = read('apps/next/app/api/_lib/request-auth.ts')
const validationSchemas = read('apps/next/app/api/_lib/validation-schemas.ts')
const securityWorkflow = read('.github/workflows/security.yml')
const securityRunbook = read('docs/delivery/runbooks/security-compliance.md')
const packageJson = read('package.json')
const deliveryVerifier = read('scripts/verify-delivery.mjs')

expectIncludes('CSP header configured', nextConfig, 'Content-Security-Policy')
expectIncludes('CSP blocks object embedding', nextConfig, "object-src 'none'")
expectIncludes('CSP blocks framing', nextConfig, "frame-ancestors 'none'")
expectIncludes('nosniff header configured', nextConfig, 'X-Content-Type-Options')
expectIncludes('clickjacking header configured', nextConfig, 'X-Frame-Options')
expectIncludes('referrer policy configured', nextConfig, 'Referrer-Policy')
expectIncludes('permissions policy configured', nextConfig, 'Permissions-Policy')
expectIncludes('HSTS is explicitly opt-in', nextConfig, "ENABLE_HSTS === 'true'")

expectIncludes('release-like env rejects missing auth secret', securityPolicy, 'isReleaseLikeEnvironment()')
expectIncludes('secure cookie can be forced for production', securityPolicy, 'AUTH_COOKIE_SECURE')
expectIncludes('trusted mutation bypass uses explicit header', securityPolicy, 'TRUSTED_REQUEST_BYPASS_HEADER')
expectIncludes('browser mutations require trusted context', requestAuth, 'requireTrustedMutationRequest')
expectIncludes('same-origin fetch metadata allowed', requestAuth, "fetchSite === 'same-origin'")

expectIncludes('Zod validation schemas exist', validationSchemas, "import { z } from 'zod'")
expectIncludes('auth login schema exists', validationSchemas, 'LoginBodySchema')
expectIncludes('checkout order schema exists', validationSchemas, 'PlaceOrderBodySchema')
expectIncludes('pharmacist consultation schema exists', validationSchemas, 'PharmacistConsultationBodySchema')

expectIncludes('CodeQL workflow configured', securityWorkflow, 'github/codeql-action/analyze')
expectIncludes('dependency review configured', securityWorkflow, 'actions/dependency-review-action')
expectIncludes('secret scan configured', securityWorkflow, 'gitleaks/gitleaks-action')
expectMatch('security workflow has least-privilege permissions', securityWorkflow, /permissions:\s+[\s\S]*contents: read[\s\S]*security-events: write/)

expectIncludes('security runbook documents HSTS caution', securityRunbook, 'Enable HSTS only after')
expectIncludes('security runbook documents penetration test scope', securityRunbook, 'Penetration Test Scope')
expectIncludes('security runbook documents NEXT_PUBLIC publicness', securityRunbook, 'NEXT_PUBLIC_*')
expectIncludes('package exposes security verifier', packageJson, '"verify:security-compliance"')
expectIncludes('delivery verifier has security gate', deliveryVerifier, "'security-compliance'")

if (failed > 0) {
  console.error(`[security-compliance] ${failed} failed`)
  process.exit(1)
}

console.log('[security-compliance] all checks passed')
