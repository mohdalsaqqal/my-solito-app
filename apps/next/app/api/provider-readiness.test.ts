// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  accountProvider,
  cartProvider,
  orderProvider,
  productProvider,
  referralProvider,
} from '@real/providers'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../../..')

test('provider registry exposes referral provider and integration-ready seams', async () => {
  assert.ok(referralProvider)
  assert.equal(typeof referralProvider.getProgram, 'function')
  assert.equal(typeof referralProvider.validate, 'function')

  assert.equal(typeof cartProvider.get, 'function')
  assert.equal(typeof orderProvider.get, 'function')
  assert.equal(typeof productProvider.get, 'function')
  assert.equal(typeof accountProvider.getOverview, 'function')
})

test('mock referral provider returns a deployable program mode and reward preview', async () => {
  const program = await referralProvider.getProgram()
  assert.equal(program.ok, true)
  if (!program.ok) {
    return
  }

  assert.match(program.data.mode, /^(off|influencers_only|all_users)$/)

  const validation = await referralProvider.validate({
    code: 'GLOWWITHU1',
    cartSubtotal: 100,
    currency: 'USD',
  })

  assert.equal(validation.ok, true)
  if (!validation.ok) {
    return
  }

  assert.equal(validation.data.eligible, true)
  assert.equal(validation.data.rewardPreview?.type, 'percentage_discount')
})

test('.env.example includes required Odoo and payment readiness placeholders', async () => {
  const envPath = path.join(REPO_ROOT, '.env.example')
  const envSource = await fs.readFile(envPath, 'utf8')

  assert.match(envSource, /^ODOO_BASE_URL=/m)
  assert.match(envSource, /^ODOO_DB=/m)
  assert.match(envSource, /^ODOO_API_KEY=/m)
  assert.match(envSource, /^NETWORKS_BASE_URL=/m)
  assert.match(envSource, /^NETWORKS_API_KEY=/m)
  assert.match(envSource, /^NETWORKS_WEBHOOK_SECRET=/m)
  assert.match(envSource, /^NETWORKS_MERCHANT_ID=/m)
  assert.match(envSource, /^STRICT_PROVIDER_READINESS=/m)
})
