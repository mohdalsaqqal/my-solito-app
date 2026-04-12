'use client'

import {
  CSSProperties,
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
} from 'react'
import { LucideIcon } from 'lucide-react'
import {
  colors,
  elevation,
  layout,
  motionDuration,
  motionEasing,
  spacing,
  status,
  typography,
  fontWeights,
  radius,
} from '@real/tokens'

type Density = 'default' | 'dense'
type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger'
type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'
type SurfaceTone = 'default' | 'brand' | 'success' | 'warning' | 'danger'

const cardRadius = radius.xl + 4
const controlRadius = radius.xl
const adminType = {
  pageTitle: typography['2xl'],
  sectionTitle: typography.xl,
  body: typography.body2,
  helper: typography.caption,
  label: typography.caption,
} as const
const adminMotion = {
  quick: `${motionDuration.fast}ms ${motionEasing.standard}`,
} as const
const adminSurfaceTokens = {
  brandPanelBackground:
    'linear-gradient(180deg, rgba(44,97,83,0.04) 0%, rgba(255,255,255,1) 100%)',
  commandBarBackground:
    'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,247,244,1) 100%)',
  emptyStateBackground:
    'radial-gradient(circle at top right, rgba(44,97,83,0.06), transparent 44%), white',
} as const

const surfaceToneMap: Record<
  SurfaceTone,
  { border: string; background: string; accent: string; text: string }
> = {
  default: {
    border: colors.border,
    background: colors.surface,
    accent: colors.textPrimary,
    text: colors.textPrimary,
  },
  brand: {
    border: colors.brandPrimary + '24',
    background: adminSurfaceTokens.brandPanelBackground,
    accent: colors.brandPrimary,
    text: colors.textPrimary,
  },
  success: {
    border: status.success.base + '22',
    background: status.success.subtle,
    accent: status.success.base,
    text: colors.textPrimary,
  },
  warning: {
    border: status.warning.base + '22',
    background: status.warning.subtle,
    accent: status.warning.base,
    text: colors.textPrimary,
  },
  danger: {
    border: status.error.base + '22',
    background: status.error.subtle,
    accent: status.error.base,
    text: colors.textPrimary,
  },
}

export function PageContainer({
  children,
  dense = false,
  fullWidth = true,
}: PropsWithChildren<{ dense?: boolean; fullWidth?: boolean }>) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: fullWidth
          ? 'none'
          : dense
            ? layout.admin.containerDense
            : layout.admin.containerDefault,
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
        paddingBlock: `clamp(${spacing['20']}px, 2.4vw, ${spacing['32']}px)`,
        marginBottom: spacing['12'],
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: typography['3xl'],
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
              fontSize: typography.body2,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing['8'],
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function AdminCommandBar({
  eyebrow,
  title,
  subtitle,
  status,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  status?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: spacing['16'],
        marginBottom: spacing['24'],
      }}
    >
      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: cardRadius + 4,
          background: adminSurfaceTokens.commandBarBackground,
          padding: `clamp(${spacing['16']}px, 2.8vw, ${spacing['24']}px)`,
          boxShadow: elevation.sm,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: spacing['20'],
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: spacing['8'], minWidth: 0 }}>
          {eyebrow ? (
            <span
              style={{
                color: colors.brandPrimary,
                fontSize: typography.xs,
                fontWeight: Number(fontWeights.semibold),
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {eyebrow}
            </span>
          ) : null}
          <div style={{ display: 'grid', gap: spacing['6'] }}>
            <h1
              style={{
                margin: 0,
                color: colors.textPrimary,
                fontSize: typography['3xl'],
                fontWeight: Number(fontWeights.bold),
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                style={{
                  margin: 0,
                  color: colors.textSecondary,
                  fontSize: typography.body2,
                  lineHeight: 1.6,
                  maxWidth: 720,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {status ? <div>{status}</div> : null}
        </div>
        {actions ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Section({ children }: PropsWithChildren) {
  return <section style={{ marginBottom: spacing['24'] }}>{children}</section>
}

export function Panel({
  children,
  density = 'default',
  tone = 'default',
}: PropsWithChildren<{ density?: Density; tone?: SurfaceTone }>) {
  const surface = surfaceToneMap[tone]

  return (
    <div
      style={{
        border: `1px solid ${surface.border}`,
        borderRadius: cardRadius,
        background: surface.background,
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

export function AdminPanelHeader({
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
        alignItems: 'flex-start',
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
            fontSize: adminType.sectionTitle,
            fontWeight: Number(fontWeights.semibold),
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: 0,
              color: colors.textSecondary,
              fontSize: adminType.body,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function AdminKpiGrid({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'grid',
        gap: spacing['16'],
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        marginBottom: spacing['24'],
      }}
    >
      {children}
    </div>
  )
}

export function AdminKpiCard({
  label,
  value,
  meta,
  trend,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  meta?: string
  trend?: ReactNode
  icon?: LucideIcon
  tone?: SurfaceTone
}) {
  const surface = surfaceToneMap[tone]
  return (
    <div
      style={{
        border: `1px solid ${surface.border}`,
        borderRadius: cardRadius,
        background: surface.background,
        padding: spacing['16'],
        boxShadow: elevation.xs,
        display: 'grid',
        gap: spacing['12'],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing['10'],
        }}
      >
        <span
          style={{
            color: colors.textSecondary,
            fontSize: typography.sm,
            fontWeight: Number(fontWeights.medium),
          }}
        >
          {label}
        </span>
        {Icon ? (
          <div
            style={{
              width: spacing['32'],
              height: spacing['32'],
              borderRadius: radius.lg,
              backgroundColor: surface.accent + '16',
              display: 'grid',
              placeItems: 'center',
              color: surface.accent,
              flexShrink: 0,
            }}
          >
            <Icon size={17} />
          </div>
        ) : null}
      </div>
      <div
        style={{
          color: colors.textPrimary,
          fontSize: typography['3xl'],
          fontWeight: Number(fontWeights.bold),
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing['8'],
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            color: colors.textSecondary,
            fontSize: typography.xs,
          }}
        >
          {meta}
        </span>
        {trend ? <div>{trend}</div> : null}
      </div>
    </div>
  )
}

export function AdminTrendPill({
  value,
  tone = 'success',
}: {
  value: string
  tone?: 'success' | 'warning' | 'danger' | 'neutral'
}) {
  const styleMap: Record<string, CSSProperties> = {
    success: { backgroundColor: status.success.subtle, color: status.success.base },
    warning: { backgroundColor: status.warning.subtle, color: status.warning.base },
    danger: { backgroundColor: status.error.subtle, color: status.error.base },
    neutral: { backgroundColor: colors.surfaceMuted, color: colors.textSecondary },
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
        ...styleMap[tone],
      }}
    >
      {value}
    </span>
  )
}

export function WorkspaceLayout({
  main,
  rail,
}: {
  main: ReactNode
  rail?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: spacing['20'],
        gridTemplateColumns: rail
          ? 'minmax(0, 1.6fr) minmax(280px, 0.82fr)'
          : 'minmax(0, 1fr)',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'grid', gap: spacing['20'], minWidth: 0 }}>{main}</div>
      {rail ? <aside style={{ display: 'grid', gap: spacing['20'], minWidth: 0 }}>{rail}</aside> : null}
    </div>
  )
}

export function ActivityFeed({
  items,
  empty,
}: {
  items: Array<{
    id: string
    title: string
    detail?: string
    meta?: string
    tone?: StatusTone
  }>
  empty: string
}) {
  if (items.length === 0) {
    return (
      <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>
        {empty}
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gap: spacing['10'] }}>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'grid',
            gap: spacing['4'],
            paddingBottom: spacing['10'],
            borderBottom:
              index === items.length - 1 ? 'none' : `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: spacing['10'],
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                color: colors.textPrimary,
                fontSize: typography.sm,
                fontWeight: Number(fontWeights.medium),
              }}
            >
              {item.title}
            </span>
            {item.tone ? <StatusPill tone={item.tone}>{item.meta}</StatusPill> : null}
          </div>
          {item.detail ? (
            <span
              style={{
                color: colors.textSecondary,
                fontSize: typography.sm,
                lineHeight: 1.5,
              }}
            >
              {item.detail}
            </span>
          ) : null}
          {!item.tone && item.meta ? (
            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
              {item.meta}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function MetricList({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode; tone?: SurfaceTone }>
}) {
  return (
    <div style={{ display: 'grid', gap: spacing['10'] }}>
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['12'],
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            backgroundColor:
              row.tone && row.tone !== 'default'
                ? surfaceToneMap[row.tone].background
                : colors.surfaceMuted,
            padding: `${spacing['10']}px ${spacing['12']}px`,
          }}
        >
          <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
            {row.label}
          </span>
          <span
            style={{
              color: colors.textPrimary,
              fontSize: typography.sm,
              fontWeight: Number(fontWeights.semibold),
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing['8'],
            flexWrap: 'wrap',
          }}
        >
          {children}
        </div>
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
  fontSize: adminType.body,
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
          fontSize: adminType.label,
          fontWeight: Number(fontWeights.medium),
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {children}
      {hint ? <span style={{ color: colors.textSecondary, fontSize: adminType.helper }}>{hint}</span> : null}
    </label>
  )
}

export function TextInput(
  props: Omit<ComponentPropsWithoutRef<'input'>, 'style'> & {
    style?: CSSProperties
  },
) {
  const { className, style, ...rest } = props
  const nextClassName = ['admin-focus-ring', className].filter(Boolean).join(' ')
  return <input {...rest} className={nextClassName} style={{ ...controlStyle, ...style }} />
}

export function SelectInput(
  props: Omit<ComponentPropsWithoutRef<'select'>, 'style'> & {
    style?: CSSProperties
  },
) {
  const { className, style, ...rest } = props
  const nextClassName = ['admin-focus-ring', className].filter(Boolean).join(' ')
  return <select {...rest} className={nextClassName} style={{ ...controlStyle, ...style }} />
}

export function TextAreaInput(
  props: Omit<ComponentPropsWithoutRef<'textarea'>, 'style'> & {
    style?: CSSProperties
  },
) {
  const { className, style, ...rest } = props
  const nextClassName = ['admin-focus-ring', className].filter(Boolean).join(' ')
  return (
    <textarea
      {...rest}
      className={nextClassName}
      style={{ ...controlStyle, minHeight: 96, ...style }}
    />
  )
}

export function Button({
  children,
  tone = 'secondary',
  disabled,
  className,
  style,
  ...props
}: PropsWithChildren<
  {
    tone?: ButtonTone
    disabled?: boolean
    className?: string
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
      className={['admin-focus-ring', className].filter(Boolean).join(' ')}
      disabled={disabled}
      style={{
        ...toneStyle[tone],
        borderRadius: controlRadius,
        fontSize: adminType.helper,
        fontWeight: Number(fontWeights.semibold),
        padding: `${spacing['8']}px ${spacing['12']}px`,
        minHeight: spacing['40'],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: `background-color ${adminMotion.quick}, border-color ${adminMotion.quick}, color ${adminMotion.quick}, opacity ${adminMotion.quick}`,
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
    neutral: {
      backgroundColor: colors.surfaceMuted,
      color: colors.textSecondary,
    },
    success: {
      backgroundColor: status.success.subtle,
      color: status.success.base,
    },
    warning: {
      backgroundColor: status.warning.subtle,
      color: status.warning.base,
    },
    danger: { backgroundColor: status.error.subtle, color: status.error.base },
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: radius.full,
        padding: `${spacing['4']}px ${spacing['8']}px`,
        fontSize: adminType.helper,
        fontWeight: Number(fontWeights.semibold),
        ...toneMap[tone],
      }}
    >
      {children}
    </span>
  )
}

export function InlineLoading({
  label,
  size = 16,
}: {
  label: string
  size?: number
}) {
  const strokeWidth = Math.max(2, Math.round(size / 8))
  const spinnerSize = `${size}px`

  return (
    <span
      role='status'
      aria-live='polite'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing['8'],
        color: colors.textSecondary,
        fontSize: adminType.helper,
      }}
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox='0 0 24 24'
        aria-hidden='true'
        style={{ display: 'block', flexShrink: 0 }}
      >
        <circle
          cx='12'
          cy='12'
          r='9'
          fill='none'
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        <path
          d='M12 3a9 9 0 0 1 9 9'
          fill='none'
          stroke={colors.brandPrimary}
          strokeLinecap='round'
          strokeWidth={strokeWidth}
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            from='0 12 12'
            to='360 12 12'
            dur='0.85s'
            repeatCount='indefinite'
          />
        </path>
      </svg>
      <span>{label}</span>
    </span>
  )
}

export function TableShell({
  children,
  maxHeight,
  minHeight,
}: PropsWithChildren<{ maxHeight?: number | string; minHeight?: number | string }>) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight,
        minHeight,
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
        background: adminSurfaceTokens.emptyStateBackground,
        display: 'grid',
        gap: spacing['8'],
      }}
    >
      <p
        style={{
          margin: 0,
          color: colors.textPrimary,
          fontWeight: Number(fontWeights.semibold),
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          color: colors.textSecondary,
          fontSize: adminType.body,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
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
      <AdminPanelHeader title={title} subtitle={subtitle} actions={actions} />
      <div style={{ display: 'grid', gap: spacing['16'] }}>{children}</div>
    </Panel>
  )
}

export function AdminFormScaffold({
  title,
  subtitle,
  notice,
  actions,
  children,
}: PropsWithChildren<{
  title: string
  subtitle?: ReactNode
  notice?: { tone?: StatusTone; message: string }
  actions?: ReactNode
}>) {
  const noticeTone = notice?.tone ?? 'neutral'
  const statusStyle: Record<StatusTone, CSSProperties> = {
    neutral: {
      backgroundColor: colors.surfaceMuted,
      color: colors.textSecondary,
      borderColor: colors.border,
    },
    success: {
      backgroundColor: status.success.subtle,
      color: status.success.base,
      borderColor: status.success.base,
    },
    warning: {
      backgroundColor: status.warning.subtle,
      color: status.warning.base,
      borderColor: status.warning.base,
    },
    danger: {
      backgroundColor: status.error.subtle,
      color: status.error.base,
      borderColor: status.error.base,
    },
  }

  return (
    <Panel>
      <div style={{ display: 'grid', gap: spacing['16'] }}>
        <AdminPanelHeader
          title={title}
          subtitle={typeof subtitle === 'string' ? subtitle : undefined}
          actions={actions}
        />

        {subtitle && typeof subtitle !== 'string' ? subtitle : null}

        {notice ? (
          <div
            role={noticeTone === 'danger' ? 'alert' : 'status'}
            aria-live={noticeTone === 'danger' ? 'assertive' : 'polite'}
            style={{
              border: `1px solid ${statusStyle[noticeTone].borderColor}`,
              backgroundColor: statusStyle[noticeTone].backgroundColor,
              color: statusStyle[noticeTone].color,
              borderRadius: controlRadius,
              padding: `${spacing['8']}px ${spacing['12']}px`,
              fontSize: adminType.body,
            }}
          >
            {notice.message}
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: spacing['16'] }}>{children}</div>
      </div>
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
              fontSize: adminType.helper,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {row.label}
          </span>
          <div style={{ color: colors.textPrimary, fontSize: adminType.body }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  )
}
