"use client"

import React, { useEffect, useRef, useState } from 'react'
import { I18nManager, Platform, TextInput, View } from 'react-native'
import { borderWidth, motionDuration, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { useThemeColors } from '../../responsive'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'

type AuthDrawerProps = {
  open: boolean
  loading?: boolean
  error?: string | null
  onClose: () => void
  onLogin: (input: { email: string; password: string }) => void | Promise<void>
  onGoToRegister?: () => void
  onGoToForgotPassword?: () => void
  locale?: string
}

const AUTH_HINTS: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  AUTH_LOGIN_INVALID: 'The email or password you entered is incorrect.',
  AUTH_UNTRUSTED_REQUEST: 'Your browser blocked a security check. Please refresh and try again.',
  AUTH_LOGIN_RATE_LIMITED: 'Too many attempts. Please wait a moment before trying again.',
  AUTH_SESSION_CONFIG_INVALID: 'Sign-in is temporarily unavailable. Please try again shortly.',
  AUTH_LOGIN_UNEXPECTED: 'Something went wrong on our side. Please try again.',
}

function humanizeError(raw: string): { userMessage: string } {
  const cleaned = raw.replace(/\s*Error:\s*\/[^\n]+$/, '')
  const match = cleaned.match(/^\[([^\]]+)\]\s*(\w+):\s*(.+)$/)
  if (match) {
    const [, , code, message] = match
    if (!code || !message) {
      return { userMessage: raw }
    }
    const hint = AUTH_HINTS[code]
    return { userMessage: hint ?? message }
  }
  return { userMessage: raw }
}

const PANEL_WIDTH = 420

export const AuthDrawer = React.memo(function AuthDrawer({
  open,
  loading = false,
  error = null,
  onClose,
  onLogin,
  onGoToRegister,
  onGoToForgotPassword,
  locale = 'en',
}: AuthDrawerProps) {
  const c = useThemeColors()
  const passwordInputRef = useRef<TextInput | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  const isRtl =
    Platform.OS === 'web'
      ? (((globalThis as { document?: { documentElement?: { dir?: string } } }).document?.documentElement?.dir ??
          (I18nManager.isRTL ? 'rtl' : 'ltr')) === 'rtl')
      : I18nManager.isRTL

  const labels = locale === 'ar'
    ? {
        title: 'تسجيل الدخول',
        intro: 'ادخل إلى حسابك لمتابعة الطلبات والعروض.',
        identifierLabel: 'البريد الإلكتروني أو اسم المستخدم',
        identifierPlaceholder: 'you@example.com',
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: 'أدخل كلمة المرور',
        showPassword: 'إظهار',
        hidePassword: 'إخفاء',
        submit: 'تسجيل الدخول',
        signingIn: 'جاري تسجيل الدخول...',
        registerPrompt: 'جديد في REAL Cosmetics؟',
        registerLink: 'أنشئ حساباً',
        forgotPassword: 'نسيت كلمة المرور؟',
        genericTitle: 'تعذر تسجيل الدخول',
        retry: 'إعادة',
        secureText: 'اتصال آمن ومشفر.',
      }
    : {
        title: 'Sign In',
        intro: 'Sign in to access your orders, offers, and saved details.',
        identifierLabel: 'Email or username',
        identifierPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        showPassword: 'Show',
        hidePassword: 'Hide',
        submit: 'Sign In',
        signingIn: 'Signing in...',
        registerPrompt: 'New to REAL Cosmetics?',
        registerLink: 'Create account',
        forgotPassword: 'Forgot password?',
        genericTitle: 'Unable to sign in',
        retry: 'Retry',
        secureText: 'Your connection is secure and encrypted.',
      }

  const parsedError = error ? humanizeError(error) : null
  const hasError = Boolean(error)

  // Focus trap
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const doc = (globalThis as { document?: Document }).document
    if (!doc) return
    previousActiveRef.current = doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    setTimeout(() => {
      const emailInput = panelRef.current?.querySelector<HTMLInputElement>('input[autocomplete="username"]')
      emailInput?.focus()
    }, 200)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
      if (focusables.length === 0) { event.preventDefault(); return }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) { event.preventDefault(); return }
      const active = doc.activeElement
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) { event.preventDefault(); last.focus() }
        return
      }
      if (active === last || !panel.contains(active)) { event.preventDefault(); first.focus() }
    }
    doc.addEventListener('keydown', onKeyDown)
    return () => {
      doc.removeEventListener('keydown', onKeyDown)
      if (previousActiveRef.current) previousActiveRef.current.focus()
    }
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const doc = (globalThis as { document?: Document }).document
    const body = doc?.body
    const root = doc?.documentElement
    if (!body || !root) return
    const prevBody = body.style.overflow
    const prevRoot = root.style.overflow
    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    return () => { body.style.overflow = prevBody; root.style.overflow = prevRoot }
  }, [open])

  const handleSubmit = async () => {
    const normalized = email.trim()
    let valid = true
    if (!normalized) { setEmailError(labels.identifierLabel + ' is required.'); valid = false }
    else { setEmailError(null) }
    if (password.length < 4) { setPasswordError('Password must be at least 4 characters.'); valid = false }
    else { setPasswordError(null) }
    if (!valid) return
    await onLogin({ email: normalized, password })
  }

  const handleRetry = () => {
    passwordInputRef.current?.focus()
  }

  if (!open || Platform.OS !== 'web') return null

  const side = isRtl ? 'left' : 'right'
  const borderSide = isRtl ? 'borderRightWidth' : 'borderLeftWidth'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.searchTop + 4,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          cursor: 'pointer',
        }}
      />

      {/* Panel */}
      <div
        ref={(node) => { if (Platform.OS === 'web') panelRef.current = node }}
        style={{
          position: 'absolute',
          top: 0,
          [side]: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          maxWidth: '100%',
          backgroundColor: c.surface,
          [borderSide]: borderWidth.thin,
          borderColor: c.border,
          flexDirection: 'column',
          display: 'flex',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.space6 + ' ' + spacing.space6 + ' ' + spacing.space5,
            borderBottomWidth: borderWidth.thin,
            borderBottomColor: c.border,
          }}
        >
          <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton icon="close" label="Close sign in" onPress={onClose} tone="ghost" />
          </div>
          <Text variant="h2" weight="700">{labels.title}</Text>
          <div style={{ width: 44 }} />
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing.space6,
        }}>
          {/* Intro */}
          <Text variant="bodySm" tone="muted" style={{ marginBottom: spacing.space6 }}>
            {labels.intro}
          </Text>

          {/* Error banner */}
          {hasError ? (
            <div style={{
              marginBottom: spacing.space6,
              padding: spacing.space4 + ' ' + spacing.space4,
              borderRadius: radius.md,
              backgroundColor: c.error + '10',
              borderLeftWidth: 3,
              borderLeftColor: c.error,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.space2,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.space3 }}>
                <div style={{ paddingTop: 2 }}>
                  <Icon name="unknown" color={c.error} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text variant="bodySm" weight="600" tone="danger" style={{ marginBottom: 2 }}>
                    {labels.genericTitle}
                  </Text>
                  <Text variant="bodySm" tone="muted">
                    {parsedError?.userMessage}
                  </Text>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: spacing['6'] + ' ' + spacing.space4,
                    borderRadius: radius.full,
                    backgroundColor: c.error + '18',
                    color: c.error,
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${motionDuration.interactive}ms ease`,
                  }}
                >
                  {labels.retry}
                </button>
              </div>
            </div>
          ) : null}

          {/* Email */}
          <div style={{ marginBottom: spacing.space5 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: spacing.space2,
              color: c.text,
            }}>
              {labels.identifierLabel} *
            </label>
            <input
              type="text"
              placeholder={labels.identifierPlaceholder}
              autoComplete="username"
              autoCapitalize="none"
              value={email}
              readOnly={loading}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: spacing.space4 + ' ' + spacing.space4,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderStyle: 'solid',
                borderColor: emailError
                  ? c.error
                  : focusedField === 'email'
                    ? c.brandPrimary
                    : c.stroke,
                backgroundColor: emailError ? c.error + '08' : c.surface,
                fontSize: 14,
                outline: 'none',
                transition: `border-color ${motionDuration.interactive}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
                boxShadow: focusedField === 'email' && !emailError
                  ? `0 0 0 3px ${c.brandPrimary}18`
                  : 'none',
              }}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null) }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); passwordInputRef.current?.focus() }
              }}
            />
            {emailError && (
              <Text variant="caption" tone="danger" style={{ marginTop: spacing.space2 }}>
                {emailError}
              </Text>
            )}
          </div>

          {/* Password — wrapped in position:relative for absolute toggle */}
          <div style={{ marginBottom: spacing.space4 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: spacing.space2,
              color: c.text,
            }}>
              {labels.passwordLabel} *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordInputRef as any}
                type={showPassword ? 'text' : 'password'}
                placeholder={labels.passwordPlaceholder}
                autoComplete="current-password"
                autoCapitalize="none"
                value={password}
                readOnly={loading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: spacing.space4 + ' ' + spacing['56'] + ' ' + spacing.space4 + ' ' + spacing.space4,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderStyle: 'solid',
                  borderColor: passwordError
                    ? c.error
                    : focusedField === 'password'
                      ? c.brandPrimary
                      : c.stroke,
                  backgroundColor: passwordError ? c.error + '08' : c.surface,
                  fontSize: 14,
                  outline: 'none',
                  transition: `border-color ${motionDuration.interactive}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
                  boxShadow: focusedField === 'password' && !passwordError
                    ? `0 0 0 3px ${c.brandPrimary}18`
                    : 'none',
                }}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null) }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); void handleSubmit() }
                }}
              />
              {/* Show/hide toggle — positioned inside the relative parent */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: spacing.space3,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: spacing['4'],
                  fontSize: 12,
                  fontWeight: 500,
                  color: c.mutedText,
                  opacity: 0.7,
                  transition: `opacity ${motionDuration.interactive}ms ease`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
              >
                {showPassword ? labels.hidePassword : labels.showPassword}
              </button>
            </div>
            {passwordError && (
              <Text variant="caption" tone="danger" style={{ marginTop: spacing.space2 }}>
                {passwordError}
              </Text>
            )}
          </div>

          {/* Forgot password */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: spacing.space6,
          }}>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 13,
                fontWeight: 500,
                color: c.linkPrimary,
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: c.linkPrimary + '30',
                textUnderlineOffset: 3,
                transition: `opacity ${motionDuration.interactive}ms ease`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
            >
              {labels.forgotPassword}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={() => void handleSubmit()}
            disabled={loading}
            style={{
              width: '100%',
              padding: spacing.space4 + ' ' + spacing.space6,
              borderRadius: radius.full,
              backgroundColor: loading ? c.gray40 : c.primary,
              color: c.primaryText,
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: spacing.space5,
              transition: `background-color ${motionDuration.interactive}ms ease, transform ${motionDuration.hover}ms ease`,
            }}
            onMouseDown={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            }}
          >
            {loading ? labels.signingIn : labels.submit}
          </button>

          {/* Register */}
          <div style={{
            textAlign: 'center',
            marginBottom: spacing.space6,
          }}>
            <Text variant="bodySm" tone="muted">
              {labels.registerPrompt}{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: c.linkPrimary,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationColor: c.linkPrimary + '30',
                  textUnderlineOffset: 3,
                  transition: `opacity ${motionDuration.interactive}ms ease`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
              >
                {labels.registerLink}
              </button>
            </Text>
          </div>

          {/* Secure badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.space2,
            padding: spacing.space3,
            borderRadius: radius.sm,
            backgroundColor: c.surfaceMuted,
          }}>
            <Icon name="secure" color={c.mutedText} size={spacing.space3} />
            <Text variant="caption" tone="muted">{labels.secureText}</Text>
          </div>
        </div>
      </div>
    </div>
  )
})
