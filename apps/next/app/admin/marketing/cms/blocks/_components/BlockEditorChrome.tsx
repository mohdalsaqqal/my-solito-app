'use client'

import { colors, radius, spacing, typography, fontWeights } from '@real/tokens'

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
      {children}
      {required ? <span style={{ color: colors.danger, marginLeft: 2 }}>*</span> : null}
    </span>
  )
}

export function ErrorHint({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <span style={{ color: colors.danger, fontSize: typography.xs, marginTop: 2 }}>{message}</span>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 36,
  borderRadius: radius.lg,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  paddingInline: spacing['12'],
  paddingBlock: spacing['8'],
  outline: 'none',
  boxSizing: 'border-box',
}

export function LocalizedPair({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  required,
  errorEn,
  errorAr,
}: {
  labelEn: string
  labelAr: string
  valueEn: string
  valueAr: string
  onChangeEn: (v: string) => void
  onChangeAr: (v: string) => void
  required?: boolean
  errorEn?: string | null
  errorAr?: string | null
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
      <label style={{ display: 'grid', gap: spacing['4'] }}>
        <FieldLabel required={required}>{labelEn}</FieldLabel>
        <input className='admin-focus-ring' value={valueEn} onChange={(e) => onChangeEn(e.target.value)} style={inputStyle} />
        <ErrorHint message={errorEn ?? null} />
      </label>
      <label style={{ display: 'grid', gap: spacing['4'] }}>
        <FieldLabel>{labelAr}</FieldLabel>
        <input className='admin-focus-ring' value={valueAr} onChange={(e) => onChangeAr(e.target.value)} dir="rtl" lang="ar" style={inputStyle} />
        <ErrorHint message={errorAr ?? null} />
      </label>
    </div>
  )
}

export function FullWidthField({
  label,
  value,
  onChange,
  placeholder,
  required,
  errorMsg,
  type: inputType,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  errorMsg?: string | null
  type?: string
}) {
  return (
    <label style={{ display: 'grid', gap: spacing['4'] }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input className='admin-focus-ring' type={inputType} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      <ErrorHint message={errorMsg ?? null} />
    </label>
  )
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginTop: spacing['4'] }}>
      <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </div>
  )
}
