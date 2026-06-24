import { Sora, DM_Sans, DM_Mono } from 'next/font/google'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['500', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
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
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
