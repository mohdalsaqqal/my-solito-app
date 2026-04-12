import React from 'react'
import { Platform } from 'react-native'
import { borderWidth, radius, shadows, spacing, boxShadowStrings } from '@real/tokens'
import { Box, Text } from '@real/ui/primitives'
import { useThemeColors } from '@real/ui/responsive'

type CheckoutStep = {
  id: string
  label: string
}

type CheckoutStepperProps = {
  steps: CheckoutStep[]
  currentStep: number
}

/**
 * Visual stepper for checkout flow.
 * Shows numbered circles with connecting lines instead of generic pill badges.
 * Current step is highlighted, completed steps show checkmark, future steps are muted.
 */
export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  const c = useThemeColors()
  const isWeb = Platform.OS === 'web'

  return (
    <Box
      style={{
        position: 'relative',
        paddingBottom: spacing['24'],
      }}
    >
      {/* Step circles with connecting lines */}
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: spacing.none,
        }}
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <Box
                style={{
                  width: spacing['32'],
                  height: spacing['32'],
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCurrent
                    ? c.brandPrimary
                    : isCompleted
                      ? c.brandPrimary
                      : c.surface,
                  borderWidth: borderWidth.thin,
                  borderColor: isCurrent || isCompleted ? c.brandPrimary : c.border,
                  // Subtle shadow for current step
                  ...(isCurrent && isWeb ? ({ boxShadow: boxShadowStrings.sm } as any) : null),
                  ...(isCurrent && !isWeb ? shadows.sm : null),
                }}
              >
                <Text
                  variant='caption'
                  weight='700'
                  tone={isCurrent || isCompleted ? 'inverse' : 'muted'}
                >
                  {isCompleted ? '✓' : stepNumber}
                </Text>
              </Box>

              {/* Connecting line (except for last step) */}
              {index < steps.length - 1 && (
                <Box
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: index < currentStep ? c.brandPrimary : c.border,
                    minWidth: spacing['12'],
                    maxWidth: spacing['24'],
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </Box>

      {/* Step labels below */}
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          gap: spacing.none,
          marginTop: spacing['8'],
        }}
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentStep
          const isCompleted = index < currentStep

          return (
            <React.Fragment key={step.id}>
              <Box
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <Text
                  variant='meta'
                  weight={isCurrent || isCompleted ? '700' : '400'}
                  tone={isCurrent ? 'default' : 'muted'}
                  style={{ textAlign: 'center' }}
                  numberOfLines={1}
                >
                  {step.label.replace(/^\d+\.\s*/, '')}
                </Text>
              </Box>
              {index < steps.length - 1 && (
                <Box
                  style={{
                    width: spacing['12'],
                    maxWidth: spacing['24'],
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </Box>
    </Box>
  )
}
