'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

/**
 * Web default: div/span with className so Tailwind applies.
 * (react-native-web View/Text do not forward className to the DOM.)
 * Native uses uniwind-box.native.tsx (View/Text with Uniwind).
 */
export function Box({
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<'div'> & { className?: string }) {
  return <div className={className} style={style as React.CSSProperties} {...props} />
}

export function Text({
  className,
  style,
  children,
  ...props
}: ComponentPropsWithoutRef<'span'> & { className?: string; children?: ReactNode }) {
  return (
    <span className={className} style={style as React.CSSProperties} {...props}>
      {children}
    </span>
  )
}
