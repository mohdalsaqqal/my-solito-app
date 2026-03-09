import { useState } from 'react'
import { colors, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Input, Text, Touchable } from '../../primitives'

type FooterNewsletterProps = {
  title: string
  subtitle: string
  firstNamePlaceholder: string
  emailPlaceholder: string
  submitLabel?: string
  successMessage?: string
  errorMessage?: string
  onSubmit?: (payload: { firstName: string; email: string }) => Promise<{ ok: boolean; message?: string }>
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export function FooterNewsletter({
  title,
  subtitle,
  firstNamePlaceholder,
  emailPlaceholder,
  submitLabel = 'Subscribe',
  successMessage = 'Subscribed successfully.',
  errorMessage = 'Unable to subscribe right now.',
  onSubmit,
  state = 'default',
}: FooterNewsletterProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null)

  if (state === 'empty') {
    return null
  }

  const disabled = state === 'disabled' || submitState === 'loading'

  const handleSubmit = async () => {
    if (disabled) {
      return
    }

    if (!email.includes('@')) {
      setSubmitState('error')
      setSubmitFeedback(errorMessage)
      return
    }

    setSubmitState('loading')
    setSubmitFeedback(null)

    try {
      if (onSubmit) {
        const result = await onSubmit({ firstName: firstName.trim(), email: email.trim() })
        if (!result.ok) {
          setSubmitState('error')
          setSubmitFeedback(result.message ?? errorMessage)
          return
        }
      }
      setSubmitState('success')
      setSubmitFeedback(successMessage)
      setEmail('')
      setFirstName('')
    } catch {
      setSubmitState('error')
      setSubmitFeedback(errorMessage)
    }
  }

  return (
    <Box style={{ gap: spacing.md }}>
      <Text variant='h2' tone='inverse' weight='700'>
        {title}
      </Text>
      <Text tone='inverse' variant='bodySm' style={{ opacity: 0.88 }}>
        {state === 'error' ? 'Newsletter unavailable right now.' : subtitle}
      </Text>
      <Box
        style={{
          flexDirection: 'row',
          gap: spacing['16'],
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Box style={{ flex: 1, minWidth: spacing['128'] }}>
          <Input
            value={firstName}
            onChangeText={setFirstName}
            placeholder={firstNamePlaceholder}
            readOnly={disabled}
            radiusKey='md'
            style={{
              flex: 1,
              backgroundColor: colors.surface,
            }}
          />
        </Box>
        <Box style={{ flex: 1.4, minWidth: spacing['128'] }}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder={emailPlaceholder}
            readOnly={disabled}
            radiusKey='md'
            style={{
              flex: 1.2,
              backgroundColor: colors.surface,
            }}
          />
        </Box>
        <Touchable disabled={disabled} onPress={handleSubmit}>
          {({ hovered, focused }) => (
            <Box
              style={{
                justifyContent: 'center',
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.md,
                backgroundColor: hovered || focused ? colors.brandPrimary : colors.white,
                minHeight: spacing['48'],
                transitionProperty: 'background-color',
                transitionDuration: `${motionDuration.microInteraction}ms`,
              }}
            >
              <Text variant='label' tone={hovered || focused ? 'inverse' : 'default'} weight='700'>
                {submitState === 'loading' ? 'Submitting...' : submitLabel}
              </Text>
            </Box>
          )}
        </Touchable>
      </Box>
      {submitFeedback ? (
        <Text variant='caption' tone='inverse' style={{ opacity: 0.9 }}>
          {submitFeedback}
        </Text>
      ) : null}
    </Box>
  )
}
