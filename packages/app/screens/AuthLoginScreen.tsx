import React, { useRef, useState } from 'react'
import { Platform, TextInput } from 'react-native'
import { borderWidth, spacing } from '@real/tokens'
import { useCurrentLocale } from '@real/app/lib/i18n/client'
import authEn from '@real/app/lib/i18n/locales/en/auth.json'
import authAr from '@real/app/lib/i18n/locales/ar/auth.json'
import { PageScaffold, Section } from '@real/ui'
import { Alert, Button, Card, FormField, Icon } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'

type AuthLoginScreenProps = {
  loading?: boolean
  error?: string | null
  onSubmit: (input: { email: string; password: string }) => void | Promise<void>
  onGoToRegister?: () => void
  onGoToForgotPassword?: () => void
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

  const signInBenefits = [
    {
      id: 'orders',
      icon: 'order' as const,
      title: copy.login.benefits.ordersTitle,
      copy: copy.login.benefits.ordersCopy,
    },
    {
      id: 'checkout',
      icon: 'secure' as const,
      title: copy.login.benefits.checkoutTitle,
      copy: copy.login.benefits.checkoutCopy,
    },
    {
      id: 'support',
      icon: 'gift' as const,
      title: copy.login.benefits.offersTitle,
      copy: copy.login.benefits.offersCopy,
    },
  ]

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

    if (hasValidationError) {
      return
    }

    await onSubmit({ email: normalizedIdentifier, password })
  }

  return (
    <PageScaffold variant='account' density={isDesktop ? 'roomy' : 'standard'} scroll='auto' surface='subtle'>
      <PageScaffold.Body>
        <Section bleed='full' tone='subtle' y='roomy'>
          <Box
            style={{
              flexDirection: isDesktop ? 'row' : 'column',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: isDesktop ? spacing['24'] : spacing['16'],
            }}
          >
            <Card
              variant='raised'
              surfaceRole='campaign'
              style={{
                flex: isDesktop ? 0.82 : undefined,
                justifyContent: 'space-between',
                gap: spacing['20'],
                minHeight: isDesktop ? spacing['128'] * 3.6 : undefined,
                maxWidth: isDesktop ? 540 : undefined,
                padding: isDesktop ? spacing['24'] : spacing['24'],
                borderWidth: borderWidth.thin,
              }}
            >
              <Box style={{ gap: spacing['16'] }}>
                <Text variant='overline' tone='warning'>
                  {copy.login.heroEyebrow}
                </Text>
                <Text
                  variant={isDesktop ? 'banner' : 'headline'}
                  tone='inverse'
                  style={{ maxWidth: isDesktop ? 420 : undefined }}
                >
                  {copy.login.heroTitle}
                </Text>
                <Text
                  variant='body'
                  tone='inkFrost'
                  style={{ maxWidth: isDesktop ? 420 : undefined }}
                >
                  {copy.login.heroBody}
                </Text>
              </Box>

              <Box style={{ gap: spacing['10'] }}>
                {signInBenefits.map((item) => (
                  <Card
                    key={item.id}
                    surfaceRole='campaign'
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: spacing['10'],
                      padding: spacing['12'],
                      borderWidth: borderWidth.thin,
                      borderColor: c.stroke,
                      backgroundColor: c.inkDeep,
                    }}
                  >
                    <Box
                      style={{
                        width: spacing['32'],
                        height: spacing['32'],
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: spacing['16'],
                        backgroundColor: c.surface,
                      }}
                    >
                      <Icon name={item.icon} color={c.inkBlack} size={18} weight='bold' />
                    </Box>
                    <Box style={{ flex: 1, gap: spacing.xxs }}>
                      <Text variant='title' tone='inverse'>
                        {item.title}
                      </Text>
                      <Text variant='bodySm' tone='inkFrost'>
                        {item.copy}
                      </Text>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Card>

            <Card
              variant='raised'
              surfaceRole='trust'
              style={{
                flex: isDesktop ? 1.18 : undefined,
                justifyContent: 'center',
                gap: spacing['16'],
                minHeight: isDesktop ? spacing['128'] * 3.6 : undefined,
                maxWidth: isDesktop ? 620 : undefined,
                padding: isDesktop ? spacing['32'] : spacing['24'],
                borderWidth: borderWidth.thin,
                backgroundColor: c.surface,
              }}
            >
              <Box style={{ gap: spacing['10'] }}>
                <Text variant='overline' tone='primary'>
                  {copy.login.eyebrow}
                </Text>
                <Text variant={isDesktop ? 'h2' : 'headline'}>{copy.login.title}</Text>
                <Text tone='muted' style={{ maxWidth: isDesktop ? 500 : undefined }}>
                  {copy.login.intro}
                </Text>
              </Box>

              {error ? (
                <Alert tone='error' title={copy.login.errors.genericTitle}>
                  {error}
                </Alert>
              ) : null}

              <Box style={{ gap: spacing['12'] }}>
                <FormField
                  label={copy.login.identifierLabel}
                  hint={copy.login.identifierHint}
                  error={emailError ?? undefined}
                  tone='trust'
                  required
                >
                  <Input
                    placeholder={copy.login.identifierPlaceholder}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='username'
                    textContentType='username'
                    returnKeyType='next'
                    blurOnSubmit={false}
                    accessibilityLabel={copy.login.identifierLabel}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value)
                      if (emailError) {
                        setEmailError(null)
                      }
                    }}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    readOnly={loading}
                    invalid={Boolean(emailError)}
                    tone='trust'
                  />
                </FormField>

                <Box style={{ gap: spacing['8'] }}>
                  <FormField label={copy.login.passwordLabel} error={passwordError ?? undefined} tone='trust' required>
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
                        if (passwordError) {
                          setPasswordError(null)
                        }
                      }}
                      onSubmitEditing={() => void handleSubmit()}
                      readOnly={loading}
                      invalid={Boolean(passwordError)}
                      tone='trust'
                    />
                  </FormField>

                  <Box
                    style={{
                      flexDirection: isDesktop ? 'row' : 'column',
                      alignItems: isDesktop ? 'center' : 'flex-start',
                      justifyContent: 'space-between',
                      gap: spacing['8'],
                    }}
                  >
                    <Button
                      size='sm'
                      variant='ghost'
                      onPress={() => setShowPassword((current) => !current)}
                      leftIcon={<Icon name='quickView' color={c.brandPrimary} size={18} />}
                    >
                      {showPassword ? copy.login.hidePassword : copy.login.showPassword}
                    </Button>

                    <Box style={{ alignSelf: isDesktop ? 'auto' : 'flex-start' }}>
                      <Button size='sm' variant='ghost' onPress={onGoToForgotPassword}>
                        {copy.login.forgotPassword}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Button
                onPress={() => void handleSubmit()}
                disabled={loading}
                loading={loading}
                fullWidth
                size='lg'
                variant='premiumAccent'
              >
                {loading ? copy.login.signingIn : copy.login.submit}
              </Button>

              <Card
                surfaceRole='trust'
                style={{
                  gap: spacing['8'],
                  borderWidth: borderWidth.thin,
                  backgroundColor: c.background,
                }}
              >
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                  <Icon name='secure' color={c.brandPrimaryHover} size={18} weight='bold' />
                  <Text variant='title'>{copy.login.secureCardTitle}</Text>
                </Box>
                <Text variant='bodySm' tone='muted'>
                  {copy.login.secureCardBody}
                </Text>
              </Card>

              <Box
                style={{
                  flexDirection: isDesktop ? 'row' : 'column',
                  alignItems: isDesktop ? 'center' : 'flex-start',
                  justifyContent: 'space-between',
                  gap: spacing['10'],
                  paddingTop: spacing['4'],
                }}
              >
                <Text variant='bodySm' tone='muted'>
                  {copy.login.registerPrompt}
                </Text>
                <Box style={{ alignSelf: isDesktop ? 'auto' : 'flex-start' }}>
                  <Button size='sm' variant='ghost' onPress={onGoToRegister}>
                    {copy.login.registerLink}
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
