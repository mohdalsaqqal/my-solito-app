import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Platform, Pressable, TextInput } from 'react-native'
import { borderWidth, radius, shadows, spacing } from '@real/tokens'
import { useCurrentLocale } from '@real/app/lib/i18n/client'
import authEn from '@real/app/lib/i18n/locales/en/auth.json'
import authAr from '@real/app/lib/i18n/locales/ar/auth.json'
import { Box, Input, Text } from '@real/ui/primitives'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import { Button, Icon } from '@real/ui/components'

type AuthLoginScreenProps = {
  loading?: boolean
  error?: string | null
  onSubmit: (input: { email: string; password: string }) => void | Promise<void>
  onGoToRegister?: () => void
  onGoToForgotPassword?: () => void
}

const AUTH_HINTS: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  AUTH_LOGIN_INVALID: 'The email or password you entered is incorrect.',
  AUTH_UNTRUSTED_REQUEST: 'Your browser blocked a security check. Please refresh the page and try again.',
  AUTH_LOGIN_RATE_LIMITED: 'Too many attempts. Please wait a moment before trying again.',
  AUTH_SESSION_CONFIG_INVALID: 'Sign-in is temporarily unavailable. Please try again shortly.',
  AUTH_LOGIN_UNEXPECTED: 'Something went wrong on our side. Please try again.',
}

function humanizeError(raw: string): { userMessage: string; code?: string } {
  const cleaned = raw.replace(/\s*Error:\s*\/[^\n]+$/, '')
  const match = cleaned.match(/^\[([^\]]+)\]\s*(\w+):\s*(.+)$/)
  if (match) {
    const [, _path, code, _message] = match
    const hint = AUTH_HINTS[code]
    if (hint) return { userMessage: hint, code }
    return { userMessage: _message, code }
  }
  return { userMessage: raw }
}

export const AuthLoginScreen = React.memo(function AuthLoginScreen({
  loading = false,
  error = null,
  onSubmit,
  onGoToRegister,
  onGoToForgotPassword,
}: AuthLoginScreenProps) {
  const locale = useCurrentLocale()
  const copy = locale === 'ar' ? authAr : authEn
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isNative = Platform.OS !== 'web'
  const isDesktop = !isNative && profile.breakpoint === 'desktop'
  const passwordInputRef = useRef<TextInput | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
    ]).start()
  }

  useEffect(() => {
    if (error) {
      triggerShake()
    }
  }, [error])

  const handleSubmit = async () => {
    const normalizedIdentifier = email.trim()
    let hasValidationError = false

    if (!normalizedIdentifier) {
      setEmailError(copy.login.errors.identifierRequired)
      hasValidationError = true
    } else {
      setEmailError(null)
    }

    if (password.length < 4) {
      setPasswordError(copy.login.errors.passwordMin)
      hasValidationError = true
    } else {
      setPasswordError(null)
    }

    if (hasValidationError) return
    await onSubmit({ email: normalizedIdentifier, password })
  }

  const handleRetry = () => {
    passwordInputRef.current?.focus()
  }

  const parsedError = error ? humanizeError(error) : null
  const hasError = Boolean(error)

  // Web-only: subtle top brand bar
  const BrandBar = isDesktop ? (
    <Box style={{
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      paddingVertical: spacing['20'],
      paddingHorizontal: spacing['32'],
      alignItems: 'center',
    }}>
      <Text variant='overline' tone='muted' style={{ letterSpacing: 2 }}>
        REAL COSMETICS
      </Text>
    </Box>
  ) : null

  return (
    <Box style={{
      flex: 1,
      backgroundColor: c.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isDesktop ? spacing['32'] : spacing['16'],
      position: 'relative' as const,
    }}>
      {BrandBar}

      <Animated.View style={{
        transform: [{ translateX: shakeAnim }],
        width: '100%',
        maxWidth: isDesktop ? 420 : undefined,
      }}>
        {/* Header */}
        <Box style={{
          alignItems: isDesktop ? 'center' : 'flex-start',
          marginBottom: spacing['32'],
          gap: spacing['8'],
        }}>
          <Text variant={isDesktop ? 'h1' : 'headline'} weight='700'>
            {copy.login.title}
          </Text>
          <Text variant='body' tone='muted' style={{
            textAlign: isDesktop ? 'center' : 'left',
            maxWidth: 360,
          }}>
            {copy.login.intro}
          </Text>
        </Box>

        {/* Error — compact inline, above the form */}
        {hasError ? (
          <Box style={{
            marginBottom: spacing['20'],
            padding: spacing['16'],
            borderRadius: radius.md,
            backgroundColor: c.error + '12',
            borderLeftWidth: 3,
            borderLeftColor: c.error,
            gap: spacing['8'],
          }}>
            <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['10'] }}>
              <Icon name='unknown' color={c.error} size={18} />
              <Box style={{ flex: 1, gap: spacing['4'] }}>
                <Text variant='bodySm' weight='600' tone='danger'>
                  {copy.login.errors.genericTitle}
                </Text>
                <Text variant='bodySm' tone='muted'>
                  {parsedError?.userMessage ?? copy.login.errors.genericTitle}
                </Text>
              </Box>
              <Button size='sm' variant='ghost' onPress={handleRetry}>
                {copy.login.errors.retry}
              </Button>
            </Box>
          </Box>
        ) : null}

        {/* Form card */}
        <Box style={{
          backgroundColor: c.surface,
          borderRadius: radius.xl,
          borderWidth: borderWidth.thin,
          borderColor: hasError ? c.error + '40' : c.stroke,
          padding: isDesktop ? spacing['32'] : spacing['24'],
          gap: spacing['20'],
          ...shadows.card,
        }}>
          {/* Email */}
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='bodySm' weight='600'>
              {copy.login.identifierLabel}
              <Text tone='danger'> *</Text>
            </Text>
            <Input
              placeholder={copy.login.identifierPlaceholder}
              autoCapitalize='none'
              autoCorrect={false}
              autoComplete='username'
              textContentType='username'
              returnKeyType='next'
              accessibilityLabel={copy.login.identifierLabel}
              value={email}
              onChangeText={(value) => {
                setEmail(value)
                if (emailError) setEmailError(null)
              }}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              readOnly={loading}
              invalid={Boolean(emailError)}
              style={{
                borderRadius: radius.md,
                borderWidth: emailError ? 1.5 : 1,
                borderColor: emailError ? c.error : focusedField === 'email' ? c.brandPrimary : c.stroke,
                backgroundColor: emailError ? c.error + '08' : c.surface,
                paddingHorizontal: spacing['16'],
                paddingVertical: spacing['12'],
                fontSize: 15,
              }}
            />
            {emailError ? (
              <Text variant='caption' tone='danger'>{emailError}</Text>
            ) : (
              <Text variant='caption' tone='muted'>
                {copy.login.identifierHint}
              </Text>
            )}
          </Box>

          {/* Password */}
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='bodySm' weight='600'>
              {copy.login.passwordLabel}
              <Text tone='danger'> *</Text>
            </Text>
            <Input
              ref={passwordInputRef}
              placeholder={copy.login.passwordPlaceholder}
              autoCapitalize='none'
              autoCorrect={false}
              autoComplete='current-password'
              textContentType='password'
              secureTextEntry={!showPassword}
              returnKeyType='go'
              accessibilityLabel={copy.login.passwordLabel}
              value={password}
              onChangeText={(value) => {
                setPassword(value)
                if (passwordError) setPasswordError(null)
              }}
              onSubmitEditing={() => void handleSubmit()}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              readOnly={loading}
              invalid={Boolean(passwordError)}
              style={{
                borderRadius: radius.md,
                borderWidth: passwordError ? 1.5 : 1,
                borderColor: passwordError ? c.error : focusedField === 'password' ? c.brandPrimary : c.stroke,
                backgroundColor: passwordError ? c.error + '08' : c.surface,
                paddingHorizontal: spacing['16'],
                paddingVertical: spacing['12'],
                fontSize: 15,
              }}
            />
            {passwordError ? (
              <Text variant='caption' tone='danger'>{passwordError}</Text>
            ) : null}
          </Box>

          {/* Show password + Forgot password */}
          <Box style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={{ paddingHorizontal: spacing['4'], paddingVertical: spacing['4'] }}
            >
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['4'] }}>
                <Icon name='quickView' color={c.mutedText} size={16} />
                <Text variant='bodySm' tone='muted'>
                  {showPassword ? copy.login.hidePassword : copy.login.showPassword}
                </Text>
              </Box>
            </Pressable>
            <Button size='sm' variant='ghost' onPress={onGoToForgotPassword}>
              {copy.login.forgotPassword}
            </Button>
          </Box>

          {/* CTA */}
          <Button
            onPress={() => void handleSubmit()}
            disabled={loading}
            loading={loading}
            fullWidth
            size='lg'
            variant='premiumAccent'
            shape='pill'
          >
            {loading ? copy.login.signingIn : copy.login.submit}
          </Button>
        </Box>

        {/* Footer */}
        <Box style={{
          marginTop: spacing['24'],
          alignItems: 'center',
          gap: spacing['12'],
        }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['6'] }}>
            <Icon name='secure' color={c.mutedText} size={14} />
            <Text variant='caption' tone='muted'>
              {copy.login.secureCardBody}
            </Text>
          </Box>
          <Text variant='bodySm' tone='muted'>
            {copy.login.registerPrompt}{' '}
            <Text
              variant='bodySm'
              weight='600'
              tone='primary'
              onPress={onGoToRegister}
              style={{ textDecorationLine: 'underline' }}
            >
              {copy.login.registerLink}
            </Text>
          </Text>
        </Box>
      </Animated.View>
    </Box>
  )
})
