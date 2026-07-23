import { Poppins } from 'next/font/google'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import './globals.css'

// One global font across the entire app - display, body AND money/codes.
// Poppins reads engaging and approachable, not "backend". Weight carries the
// hierarchy: heavier for headings/stat values, lighter for body copy.
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
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
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
