'use client'

import { CSSProperties, ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react'
import {
  colors,
  elevation,
  layout,
  spacing,
  status,
  typography,
  fontWeights,
  radius,
} from '@real/tokens'

type Density = 'default' | 'dense'
type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger'
type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'

const cardRadius = radius.xl + 4
const controlRadius = radius.xl

export function PageContainer({
  children,
  dense = false,
  fullWidth = true,
}: PropsWithChildren<{ dense?: boolean; fullWidth?: boolean }>) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: fullWidth ? 'none' : dense ? layout.admin.containerDense : layout.admin.containerDefault,
        marginInline: 'auto',
        paddingInline: `clamp(${spacing['12']}px, 2vw, ${layout.gutterX.md}px)`,
      }}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing['16'],
        flexWrap: 'wrap',
        paddingBlock: `clamp(${spacing['24']}px, 3vw, ${spacing['32']}px)`,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: typography.xxl,
            fontWeight: Number(fontWeights.semibold),
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              margin: `${spacing['4']}px 0 0`,
              color: colors.textSecondary,
              fontSize: typography.sm,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function Section({ children }: PropsWithChildren) {
  return <section style={{ marginBottom: spacing['24'] }}>{children}</section>
}

export function Panel({
  children,
  density = 'default',
}: PropsWithChildren<{ density?: Density }>) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: cardRadius,
        backgroundColor: colors.surface,
        padding:
          density === 'dense'
            ? spacing['16']
            : `clamp(${spacing['16']}px, 2.4vw, ${spacing['24']}px)`,
        boxShadow: elevation.xs,
      }}
    >
      {children}
    </div>
  )
}

export function ActionRow({
  children,
  search,
}: PropsWithChildren<{ search?: ReactNode }>) {
  return (
    <div
      style={{
        marginBottom: spacing['24'],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['12'],
      }}
      >
      {search ? <div style={{ width: '100%', maxWidth: 320 }}>{search}</div> : null}
      {children ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>{children}</div>
      ) : null}
    </div>
  )
}

const controlStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${colors.border}`,
  borderRadius: controlRadius,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  lineHeight: 1.4,
  padding: `${spacing['8']}px ${spacing['12']}px`,
  minHeight: spacing['40'],
  outline: 'none',
}

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{
  label: string
  hint?: string
}>) {
  return (
    <label style={{ display: 'grid', gap: spacing['4'] }}>
      <span
        style={{
          color: colors.textSecondary,
          fontSize: typography.xs,
          fontWeight: Number(fontWeights.medium),
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {children}
      {hint ? (
        <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}

export function TextInput(
  props: Omit<ComponentPropsWithoutRef<'input'>, 'style'> & { style?: CSSProperties }
) {
  const { style, ...rest } = props
  return <input {...rest} style={{ ...controlStyle, ...style }} />
}

export function SelectInput(
  props: Omit<ComponentPropsWithoutRef<'select'>, 'style'> & { style?: CSSProperties }
) {
  const { style, ...rest } = props
  return <select {...rest} style={{ ...controlStyle, ...style }} />
}

export function TextAreaInput(
  props: Omit<ComponentPropsWithoutRef<'textarea'>, 'style'> & { style?: CSSProperties }
) {
  const { style, ...rest } = props
  return <textarea {...rest} style={{ ...controlStyle, minHeight: 96, ...style }} />
}

export function Button({
  children,
  tone = 'secondary',
  disabled,
  style,
  ...props
}: PropsWithChildren<
  {
    tone?: ButtonTone
    disabled?: boolean
    style?: CSSProperties
  } & Omit<ComponentPropsWithoutRef<'button'>, 'style'>
>) {
  const toneStyle: Record<ButtonTone, CSSProperties> = {
    primary: {
      border: `1px solid ${colors.textPrimary}`,
      backgroundColor: colors.textPrimary,
      color: colors.textInverted,
    },
    secondary: {
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surfaceMuted,
      color: colors.textPrimary,
    },
    ghost: {
      border: '1px solid transparent',
      backgroundColor: 'transparent',
      color: colors.textSecondary,
    },
    danger: {
      border: `1px solid ${colors.danger}`,
      backgroundColor: colors.danger,
      color: colors.textInverted,
    },
  }

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        ...toneStyle[tone],
        borderRadius: controlRadius,
        fontSize: typography.xs,
        fontWeight: Number(fontWeights.semibold),
        padding: `${spacing['8']}px ${spacing['12']}px`,
        minHeight: spacing['40'],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 160ms ease',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function StatusPill({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: StatusTone }>) {
  const toneMap: Record<StatusTone, CSSProperties> = {
    neutral: { backgroundColor: colors.surfaceMuted, color: colors.textSecondary },
    success: { backgroundColor: status.success.subtle, color: status.success.base },
    warning: { backgroundColor: status.warning.subtle, color: status.warning.base },
    danger: { backgroundColor: status.error.subtle, color: status.error.base },
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: radius.full,
        padding: `${spacing['4']}px ${spacing['8']}px`,
        fontSize: typography.xs,
        fontWeight: Number(fontWeights.semibold),
        ...toneMap[tone],
      }}
    >
      {children}
    </span>
  )
}

export function TableShell({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        border: `1px solid ${colors.border}`,
        borderRadius: cardRadius,
        backgroundColor: colors.surface,
      }}
    >
      {children}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div
      style={{
        padding: spacing['24'],
        border: `1px solid ${colors.border}`,
        borderRadius: cardRadius,
        backgroundColor: colors.surface,
        display: 'grid',
        gap: spacing['8'],
      }}
    >
      <p style={{ margin: 0, color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{title}</p>
      <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>{description}</p>
      {action}
    </div>
  )
}

export function EditorShell({
  title,
  subtitle,
  actions,
  children,
}: PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: ReactNode
}>) {
  return (
    <Panel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing['12'],
          flexWrap: 'wrap',
          marginBottom: spacing['16'],
        }}
      >
        <div style={{ display: 'grid', gap: spacing['4'] }}>
          <h2
            style={{
              margin: 0,
              color: colors.textPrimary,
              fontSize: typography.lg,
              fontWeight: Number(fontWeights.semibold),
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>{actions}</div> : null}
      </div>
      <div style={{ display: 'grid', gap: spacing['16'] }}>{children}</div>
    </Panel>
  )
}

export function InfoGrid({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: spacing['12'],
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: cardRadius,
            padding: spacing['12'],
            backgroundColor: colors.surfaceMuted,
            display: 'grid',
            gap: spacing['4'],
          }}
        >
          <span
            style={{
              color: colors.textSecondary,
              fontSize: typography.xs,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {row.label}
          </span>
          <div style={{ color: colors.textPrimary, fontSize: typography.sm }}>{row.value}</div>
        </div>
      ))}
    </div>
  )
}
