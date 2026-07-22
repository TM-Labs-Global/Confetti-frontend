import { Bricolage_Grotesque, Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import './globals.css'

// Display: Bricolage Grotesque - an expressive, warm grotesque for headings,
// stat values and card titles. Reads engaging, not "backend".
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display-family',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

// Body: Plus Jakarta Sans - friendly, modern, highly legible at small sizes.
const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body-family',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Money / codes only. Unchanged - the right call for tabular figures.
const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono-family',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata = {
  title: 'Confette · Event Planning & Vendor Marketplace',
  description: 'Create your event and connect with verified vendors across Nigeria.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly, dark-mode tools,
    // wallets, etc.) commonly inject attributes onto <html>/<body> before React
    // hydrates, which otherwise trips a hydration attribute-mismatch warning.
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
