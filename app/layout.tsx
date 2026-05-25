import type { Metadata } from 'next'
import { Commissioner, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MockFeedProductionProvider } from '@/providers/MockFeedProductionProvider'
import './globals.css'

const commissioner = Commissioner({ 
  subsets: ['latin'],
  variable: '--font-commissioner',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PROD_CORE | Production Management System',
  description: 'Multi-tenant industrial production management and inventory tracking system.',
  generator: 'Next.js',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${commissioner.variable} ${geistMono.variable} font-sans antialiased`}>
        <MockFeedProductionProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </MockFeedProductionProvider>
      </body>
    </html>
  )
}
