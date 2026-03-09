// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveRequestLocale } from './request-locale'

test('resolveRequestLocale uses query locale first', () => {
  const locale = resolveRequestLocale(
    new Request('http://localhost/api/cms/home?locale=ar', {
      headers: {
        cookie: 'rc_locale=en',
        'accept-language': 'en-US,en;q=0.9',
      },
    })
  )

  assert.equal(locale, 'ar')
})

test('resolveRequestLocale uses cookie fallback', () => {
  const locale = resolveRequestLocale(
    new Request('http://localhost/api/cms/home', {
      headers: {
        cookie: 'rc_locale=ar',
        'accept-language': 'en-US,en;q=0.9',
      },
    })
  )

  assert.equal(locale, 'ar')
})

test('resolveRequestLocale uses accept-language when cookie missing', () => {
  const locale = resolveRequestLocale(
    new Request('http://localhost/api/cms/home', {
      headers: {
        'accept-language': 'ar-JO,ar;q=0.9,en;q=0.8',
      },
    })
  )

  assert.equal(locale, 'ar')
})

test('resolveRequestLocale defaults to en', () => {
  const locale = resolveRequestLocale(new Request('http://localhost/api/cms/home'))
  assert.equal(locale, 'en')
})
