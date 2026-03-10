'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@real/ui'

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
