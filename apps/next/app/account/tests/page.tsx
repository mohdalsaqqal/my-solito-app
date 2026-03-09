import { redirect } from 'next/navigation'

export default function AccountTestsPage() {
  redirect('/account?tab=tests')
}

