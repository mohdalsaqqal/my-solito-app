'use client'

import { AuthRegisterPageClient } from './RegisterPageClient'

export default function RegisterPageIsland({ nextPath }: { nextPath: string | null }) {
  if (typeof window === 'undefined') {
    return null
  }

  return <AuthRegisterPageClient nextPath={nextPath} />
}
