import { StylesProvider } from './styles-provider'
import './globals.css'
import { Almarai, Cairo, Manrope, Tajawal } from 'next/font/google'
import { colors } from '@real/tokens'
import { ChunkErrorRecovery } from './_components/ChunkErrorRecovery'
import { Providers } from './_components/Providers'

// Phase 1 storefront typography: sans-led, campaign-first, high-scan commerce UI.
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
})

// Arabic / RTL support — Cairo
const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
})

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-tajawal',
  weight: ['400', '500', '700', '800', '900'],
})

const almarai = Almarai({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-almarai',
  weight: ['300', '400', '700', '800'],
})

export const metadata = {
  title: 'REAL Cosmetics | Endless Beauty Marketplace',
  description:
    'Discover premium skincare, makeup, haircare, and fragrance from trusted brands across a 15,000-product beauty marketplace.',
  applicationName: 'REAL Cosmetics',
}

export const viewport = {
  themeColor: colors.surface,
  colorScheme: 'light',
}

const DEFAULT_LOCALE = 'en'
const DEFAULT_DIRECTION = 'ltr'
const ROOT_LOCALE_SCRIPT = `
  (function () {
    function readCookie(name) {
      var prefix = name + '='
      var cookies = document.cookie ? document.cookie.split('; ') : []
      for (var index = 0; index < cookies.length; index += 1) {
        var entry = cookies[index]
        if (entry.indexOf(prefix) === 0) {
          return decodeURIComponent(entry.slice(prefix.length))
        }
      }
      return ''
    }

    var pathSegment = window.location.pathname.split('/').filter(Boolean)[0] || ''
    var cookieLocale = readCookie('rc_locale').toLowerCase()
    var locale = pathSegment === 'ar' || pathSegment === 'en' ? pathSegment : cookieLocale === 'ar' ? 'ar' : 'en'
    var direction = locale === 'ar' ? 'rtl' : 'ltr'
    var root = document.documentElement

    root.lang = locale
    root.dir = direction
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={DEFAULT_DIRECTION}
      suppressHydrationWarning
      className={`${manrope.variable} ${cairo.variable} ${tajawal.variable} ${almarai.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ROOT_LOCALE_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <a className='skip-link' href='#main-content'>
          Skip to main content
        </a>
        <ChunkErrorRecovery />
        <Providers>
          <StylesProvider>{children}</StylesProvider>
        </Providers>
      </body>
    </html>
  )
}
