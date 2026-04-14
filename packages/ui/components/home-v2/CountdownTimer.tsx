import React, { useEffect, useRef, useState } from 'react'
import { colors, fontWeights, letterSpacing, radius, spacing, typography } from '@real/tokens'
import { Box, Text } from '../../primitives'

type CountdownTimerProps = {
  /** ISO 8601 target date-time string, e.g. "2026-03-11T23:59:59Z" */
  targetIso: string
  loading?: boolean
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0')
}

function getRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, expired: diff === 0 }
}

const DigitPair = React.memo(function DigitPair({ value, label }: { value: string; label: string }) {
  return (
    <Box style={{ alignItems: 'center', gap: spacing['1'] }}>
      <Box key={value}>
        <Text
          style={{
            fontSize: typography.headline,
            fontWeight: fontWeights.black,
            color: colors.white,
            lineHeight: typography.headline * 1.1,
            letterSpacing: letterSpacing.campaignHeading,
          }}
        >
          {value}
        </Text>
      </Box>
      <Text
        style={{
          fontSize: typography.caption,
          fontWeight: fontWeights.ultra,
          color: colors.inkFrost,
          letterSpacing: letterSpacing.subHeaderCaps,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Box>
  )
})

const Separator = React.memo(function Separator() {
  return (
    <Text
      style={{
        fontSize: typography.headline,
        fontWeight: fontWeights.black,
        color: colors.inkFrost,
        opacity: 0.4,
        alignSelf: 'flex-start',
        lineHeight: typography.headline * 1.1,
      }}
    >
      :
    </Text>
  )
})

export const CountdownTimer = React.memo(function CountdownTimer({ targetIso, loading = false }: CountdownTimerProps) {
  const targetMs = useRef(new Date(targetIso).getTime())
  const [time, setTime] = useState(() => getRemaining(targetMs.current))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    targetMs.current = new Date(targetIso).getTime()
    setTime(getRemaining(targetMs.current))
    expiredRef.current = false
  }, [targetIso])

  useEffect(() => {
    if (expiredRef.current) return
    intervalRef.current = setInterval(() => {
      const next = getRemaining(targetMs.current)
      setTime(next)
      if (next.expired) {
        expiredRef.current = true
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (loading) {
    return (
      <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
            <Box
              style={{
                width: spacing['48'],
                height: spacing['48'],
                borderRadius: radius.sm,
                backgroundColor: colors.inkMid,
              }}
            />
            {i < 2 ? <Separator /> : null}
          </Box>
        ))}
      </Box>
    )
  }

  if (time.expired) {
    return null
  }

  return (
    <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
      <DigitPair value={pad(time.h)} label='hrs' />
      <Separator />
      <DigitPair value={pad(time.m)} label='min' />
      <Separator />
      <DigitPair value={pad(time.s)} label='sec' />
    </Box>
  )
})
