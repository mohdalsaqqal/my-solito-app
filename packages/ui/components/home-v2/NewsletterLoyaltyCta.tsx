"use client"

import React, { useState } from 'react'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Input, Text } from '../../primitives'
import { Button } from '../Button'
import { useBreakpoint, useThemeColors } from '../../responsive'

/**
 * Newsletter/loyalty signup CTA block.
 *
 * NOTE: This component duplicates the footer newsletter signup.
 * CMS should only enable ONE of these per page to avoid redundant email forms.
 * Recommended: Keep footer newsletter, disable this block in CMS.
 */
type NewsletterLoyaltyCtaProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
  onSubmit?: (email: string) => Promise<{ ok: boolean; message?: string }>
}

export const NewsletterLoyaltyCta = React.memo(function NewsletterLoyaltyCta({
  title,
  subtitle,
  ctaLabel = 'Subscribe',
  state = 'default',
  onSubmit,
}: NewsletterLoyaltyCtaProps) {
  const c = useThemeColors()
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (state === 'empty') {
    return null
  }

  const disabled = state === 'disabled' || submitting

  const handleSubmit = async () => {
    if (disabled) return
    const normalized = email.trim()
    if (!normalized || !normalized.includes('@')) {
      setFeedback('Please enter a valid email.')
      return
    }

    setSubmitting(true)
    setFeedback(null)
    try {
      if (onSubmit) {
        const result = await onSubmit(normalized)
        setFeedback(result.ok ? result.message ?? 'Subscribed successfully.' : result.message ?? 'Subscription failed.')
      } else {
        setFeedback('Subscribed successfully.')
      }
      setEmail('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      data-ect-node="NewsletterLoyaltyCta"
      role="region"
      aria-label={title}
      style={{
        borderWidth: borderWidth.thin,
        borderColor: c.border,
        borderRadius: radius.xs,
        backgroundColor: c.surface,
        padding: spacing.space6,
        gap: spacing.space4,
      }}
    >
      <Box style={{ gap: spacing.space2 }}>
        <Text variant='h2'>{title}</Text>
        {subtitle ? (
          <Text variant='bodySm' tone={state === 'error' ? 'danger' : 'muted'}>
            {subtitle}
          </Text>
        ) : null}
      </Box>

      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: spacing.space3,
          flexWrap: 'wrap',
          alignItems: isDesktop ? 'center' : 'stretch',
        }}
      >
        <Box style={{ flex: 1, minWidth: isDesktop ? spacing['128'] + spacing['64'] : undefined, width: isDesktop ? undefined : '100%' }}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder='Email address'
            label='Email address'
            hideLabel
            readOnly={disabled}
            radiusKey='xs'
            style={{
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              backgroundColor: c.surface,
            }}
          />
        </Box>
        <Box style={{ width: isDesktop ? undefined : '100%' }}>
          <Button onPress={handleSubmit} disabled={disabled} size='lg' variant='premiumAccent' fullWidth={!isDesktop}>
          {submitting ? 'Submitting...' : ctaLabel}
          </Button>
        </Box>
      </Box>

      {feedback ? (
        <Text variant='caption' tone={feedback.toLowerCase().includes('success') ? 'success' : 'muted'}>
          {feedback}
        </Text>
      ) : null}
    </Box>
  )
})
