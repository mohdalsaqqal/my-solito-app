"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { I18nManager, Platform } from 'react-native'
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
  onRegister?: (input: { name: string; email: string; password: string }) => void | Promise<void>
  onSignOut?: () => void | Promise<void>
  onGoToRegister?: () => void
  onGoToForgotPassword?: () => void
  user?: { name: string; email: string } | null
  locale?: string
}

function getAuthHints(locale: string): Record<string, string> {
  return locale === 'ar'
    ? {
        AUTH_INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        AUTH_LOGIN_INVALID: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        AUTH_UNTRUSTED_REQUEST: 'حظر المتصفح فحص الأمان. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
        AUTH_LOGIN_RATE_LIMITED: 'محاولات كثيرة. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.',
        AUTH_SESSION_CONFIG_INVALID: 'تسجيل الدخول غير متاح مؤقتاً. يرجى المحاولة بعد قليل.',
        AUTH_LOGIN_UNEXPECTED: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      }
    : {
        AUTH_INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
        AUTH_LOGIN_INVALID: 'The email or password you entered is incorrect.',
        AUTH_UNTRUSTED_REQUEST: 'Your browser blocked a security check. Please refresh and try again.',
        AUTH_LOGIN_RATE_LIMITED: 'Too many attempts. Please wait a moment before trying again.',
        AUTH_SESSION_CONFIG_INVALID: 'Sign-in is temporarily unavailable. Please try again shortly.',
        AUTH_LOGIN_UNEXPECTED: 'Something went wrong on our side. Please try again.',
      }
}

function humanizeError(raw: string, locale: string): { userMessage: string } {
  const cleaned = raw.replace(/\s*Error:\s*\/[^\n]+$/, '')
  const match = cleaned.match(/^\[([^\]]+)\]\s*(\w+):\s*(.+)$/)
  if (match) {
    const [, , code, message] = match
    if (!code || !message) return { userMessage: raw }
    const hints = getAuthHints(locale)
    const hint = hints[code]
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
  onRegister,
  onSignOut,
  onGoToRegister,
  onGoToForgotPassword,
  user = null,
  locale = 'en',
}: AuthDrawerProps) {
  const c = useThemeColors()
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
        signOut: 'تسجيل الخروج',
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
        signOut: 'Sign Out',
      }

  const registerLabels = locale === 'ar'
    ? {
        title: 'إنشاء حساب',
        intro: 'أنشئ حساباً جديداً للاستفادة من العروض وتتبع الطلبات.',
        nameLabel: 'الاسم الكامل',
        namePlaceholder: 'أدخل اسمك الكامل',
        submit: 'إنشاء حساب',
        creating: 'جاري إنشاء الحساب...',
        signinPrompt: 'لديك حساب بالفعل؟',
        signinLink: 'تسجيل الدخول',
      }
    : {
        title: 'Create Account',
        intro: 'Create a new account to access offers and track orders.',
        nameLabel: 'Full name',
        namePlaceholder: 'Enter your full name',
        submit: 'Create Account',
        creating: 'Creating account...',
        signinPrompt: 'Already have an account?',
        signinLink: 'Sign in',
      }

  const parsedError = error ? humanizeError(error, locale) : null
  const hasError = Boolean(error)
  const isRegister = mode === 'register' && Boolean(onRegister)

  // Animate in/out
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Reset state when closing
  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      onClose()
      setMode('signin')
      setEmail('')
      setName('')
      setPassword('')
      setEmailError(null)
      setNameError(null)
      setPasswordError(null)
      setShowPassword(false)
      setFocusedField(null)
    }, prefersReducedMotion ? 0 : 250)
  }, [onClose, prefersReducedMotion])

  // Focus trap + auto-focus
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const doc = (globalThis as { document?: Document }).document
    if (!doc) return
    previousActiveRef.current = doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    setTimeout(() => {
      const selector = isRegister ? 'input[autocomplete="name"]' : 'input[autocomplete="username"]'
      const target = panelRef.current?.querySelector<HTMLInputElement>(selector)
      target?.focus()
    }, prefersReducedMotion ? 0 : 200)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { handleClose(); return }
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
  }, [open, isRegister, handleClose, prefersReducedMotion])

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

  const valRequired = locale === 'ar' ? 'مطلوب' : 'is required.'
  const valPasswordShort = locale === 'ar' ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' : 'Password must be at least 4 characters.'

  const handleSubmit = async () => {
    const normalized = email.trim()
    let valid = true
    if (!normalized) { setEmailError(labels.identifierLabel + ' ' + valRequired); valid = false }
    else { setEmailError(null) }
    if (isRegister) {
      if (!name.trim()) { setNameError(registerLabels.nameLabel + ' ' + valRequired); valid = false }
      else { setNameError(null) }
    }
    if (password.length < 4) { setPasswordError(valPasswordShort); valid = false }
    else { setPasswordError(null) }
    if (!valid) return
    if (isRegister && onRegister) {
      await onRegister({ name: name.trim(), email: normalized, password })
    } else {
      await onLogin({ email: normalized, password })
    }
  }

  const handleRetry = () => {
    passwordInputRef.current?.focus()
  }

  const switchMode = (newMode: 'signin' | 'register') => {
    setMode(newMode)
    setEmailError(null)
    setNameError(null)
    setPasswordError(null)
    // Focus first field after mode switch
    setTimeout(() => {
      if (newMode === 'register') {
        nameInputRef.current?.focus()
      } else {
        panelRef.current?.querySelector<HTMLInputElement>('input[autocomplete="username"]')?.focus()
      }
    }, 50)
  }

  const dialogAriaLabel = user ? (locale === 'ar' ? 'الحساب' : 'Account') : isRegister ? registerLabels.title : labels.title

  if (!open || Platform.OS !== 'web') return null

  const side = isRtl ? 'left' : 'right'
  const borderSide = isRtl ? 'borderRightWidth' : 'borderLeftWidth'
  const errorBorderSide = isRtl ? 'borderRightWidth' : 'borderLeftWidth'
  const errorBorderColor = isRtl ? 'borderRightColor' : 'borderLeftColor'
  const animateIn = !prefersReducedMotion
  const panelTransform = visible
    ? 'translateX(0)'
    : isRtl ? 'translateX(-100%)' : 'translateX(100%)'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialogAriaLabel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.searchTop + 4,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          cursor: 'pointer',
          opacity: visible ? 1 : 0,
          transition: animateIn ? 'opacity 250ms ease' : 'none',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          [side]: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          maxWidth: '100%',
          backgroundColor: c.surface,
          borderLeftWidth: borderWidth.thin,
          borderLeftColor: c.border,
          flexDirection: 'column',
          display: 'flex',
          boxShadow: visible ? '-12px 0 40px rgba(0,0,0,0.1)' : 'none',
          transform: panelTransform,
          transition: animateIn ? 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.space6} ${spacing.space6} ${spacing.space5}`,
            borderBottomWidth: borderWidth.thin,
            borderBottomColor: c.border,
          }}
        >
          <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton icon="close" label={locale === 'ar' ? 'إغلاق' : 'Close sign in'} onPress={handleClose} tone="ghost" />
          </div>
          <Text variant="h2" weight="700">{isRegister ? registerLabels.title : labels.title}</Text>
          <div style={{ width: 44 }} />
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing.space6,
        }}>
          {/* Intro / Signed-in state */}
          {user ? (
            <div style={{ marginBottom: spacing.space6 }}>
              <div style={{
                padding: spacing.space4,
                marginBottom: spacing.space5,
                borderRadius: radius.md,
                backgroundColor: c.surfaceMuted,
              }}>
                <Text variant="bodySm" weight="600" style={{ marginBottom: 2 }}>
                  {user.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {user.email}
                </Text>
              </div>
              {onSignOut ? (
                <button
                  onClick={async () => {
                    await onSignOut()
                    handleClose()
                  }}
                  style={{
                    width: '100%',
                    padding: spacing.space4 + ' ' + spacing.space6,
                    borderRadius: radius.full,
                    backgroundColor: 'transparent',
                    color: c.textPrimary,
                    fontWeight: 600,
                    fontSize: 14,
                    border: `1.5px solid ${c.border}`,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: `background-color ${motionDuration.interactive}ms ease`,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = c.surfaceMuted }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent' }}
                  onFocus={(e) => { (e.target as HTMLElement).style.backgroundColor = c.surfaceMuted }}
                  onBlur={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  {labels.signOut}
                </button>
              ) : null}
            </div>
          ) : (
            <Text variant="bodySm" tone="muted" style={{ marginBottom: spacing.space6 }}>
              {isRegister ? registerLabels.intro : labels.intro}
            </Text>
          )}

          {/* Error banner */}
          {hasError ? (
            <div style={{
              marginBottom: spacing.space6,
              padding: spacing.space4,
              borderRadius: radius.md,
              backgroundColor: c.error + '10',
              [errorBorderSide]: 3,
              [errorBorderColor]: c.error,
              borderStyle: 'solid',
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
                    padding: `${spacing['6']} ${spacing.space4}`,
                    borderRadius: radius.full,
                    backgroundColor: c.error + '18',
                    color: c.error,
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: `background-color ${motionDuration.interactive}ms ease`,
                  }}
                >
                  {labels.retry}
                </button>
              </div>
            </div>
          ) : null}

          {/* Name field (register only) */}
          {isRegister ? (
            <div style={{ marginBottom: spacing.space5 }}>
              <label
                htmlFor="auth-drawer-name"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: spacing.space2, color: c.text }}
              >
                {registerLabels.nameLabel} *
              </label>
              <input
                id="auth-drawer-name"
                ref={nameInputRef}
                type="text"
                placeholder={registerLabels.namePlaceholder}
                autoComplete="name"
                autoCapitalize="words"
                value={name}
                readOnly={loading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: `${spacing.space4} ${spacing.space4}`,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderStyle: 'solid',
                  borderColor: nameError ? c.error : focusedField === 'name' ? c.brandPrimary : c.stroke,
                  backgroundColor: nameError ? c.error + '08' : c.surface,
                  fontSize: 14,
                  outline: 'none',
                  transition: `border-color ${motionDuration.interactive}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
                  boxShadow: focusedField === 'name' && !nameError ? `0 0 0 3px ${c.brandPrimary}18` : 'none',
                }}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null) }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
              {nameError && (
                <Text variant="caption" tone="danger" style={{ marginTop: spacing.space2 }}>
                  {nameError}
                </Text>
              )}
            </div>
          ) : null}

          {/* Email */}
          <div style={{ marginBottom: spacing.space5 }}>
            <label
              htmlFor="auth-drawer-email"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: spacing.space2, color: c.text }}
            >
              {labels.identifierLabel} *
            </label>
            <input
              id="auth-drawer-email"
              type="text"
              placeholder={labels.identifierPlaceholder}
              autoComplete={isRegister ? 'email' : 'username'}
              autoCapitalize="none"
              value={email}
              readOnly={loading}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: `${spacing.space4} ${spacing.space4}`,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderStyle: 'solid',
                borderColor: emailError ? c.error : focusedField === 'email' ? c.brandPrimary : c.stroke,
                backgroundColor: emailError ? c.error + '08' : c.surface,
                fontSize: 14,
                outline: 'none',
                transition: `border-color ${motionDuration.interactive}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
                boxShadow: focusedField === 'email' && !emailError ? `0 0 0 3px ${c.brandPrimary}18` : 'none',
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

          {/* Password */}
          <div style={{ marginBottom: spacing.space4 }}>
            <label
              htmlFor="auth-drawer-password"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: spacing.space2, color: c.text }}
            >
              {labels.passwordLabel} *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-drawer-password"
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder={labels.passwordPlaceholder}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                value={password}
                readOnly={loading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: `${spacing.space4} ${spacing['56']} ${spacing.space4} ${spacing.space4}`,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderStyle: 'solid',
                  borderColor: passwordError ? c.error : focusedField === 'password' ? c.brandPrimary : c.stroke,
                  backgroundColor: passwordError ? c.error + '08' : c.surface,
                  fontSize: 14,
                  outline: 'none',
                  transition: `border-color ${motionDuration.interactive}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
                  boxShadow: focusedField === 'password' && !passwordError ? `0 0 0 3px ${c.brandPrimary}18` : 'none',
                }}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null) }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); void handleSubmit() }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? labels.hidePassword : labels.showPassword}
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
                  outline: 'none',
                  transition: `opacity ${motionDuration.interactive}ms ease`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                onFocus={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                onBlur={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
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

          {/* Forgot password (sign-in mode only) */}
          {!isRegister ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.space6 }}>
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
                  outline: 'none',
                  transition: `opacity ${motionDuration.interactive}ms ease`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                onFocus={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                onBlur={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
              >
                {labels.forgotPassword}
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: spacing.space6 }} />
          )}

          {/* Submit */}
          <button
            onClick={() => void handleSubmit()}
            disabled={loading}
            style={{
              width: '100%',
              padding: `${spacing.space4} ${spacing.space6}`,
              borderRadius: radius.full,
              backgroundColor: loading ? c.gray40 : c.primary,
              color: c.primaryText,
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: spacing.space5,
              outline: 'none',
              transition: `background-color ${motionDuration.interactive}ms ease, transform ${motionDuration.hover}ms ease, box-shadow ${motionDuration.interactive}ms ease`,
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px ${c.primary}40`
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }
            }}
            onMouseDown={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            }}
            onFocus={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${c.primary}40`
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            {loading ? (isRegister ? registerLabels.creating : labels.signingIn) : (isRegister ? registerLabels.submit : labels.submit)}
          </button>

          {/* Register / Sign-in toggle */}
          <div style={{ textAlign: 'center', marginBottom: spacing.space6 }}>
            {isRegister ? (
              <Text variant="bodySm" tone="muted">
                {registerLabels.signinPrompt}{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
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
                    outline: 'none',
                  }}
                >
                  {registerLabels.signinLink}
                </button>
              </Text>
            ) : (
              <Text variant="bodySm" tone="muted">
                {labels.registerPrompt}{' '}
                <button
                  type="button"
                  onClick={onRegister ? () => switchMode('register') : onGoToRegister}
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
                    outline: 'none',
                    transition: `opacity ${motionDuration.interactive}ms ease`,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                  onFocus={(e) => { (e.target as HTMLElement).style.opacity = '0.7' }}
                  onBlur={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
                >
                  {labels.registerLink}
                </button>
              </Text>
            )}
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
