import './globals.css'
import { docs } from '@/lib/docs/docs'
import { docsLayoutOptions } from '@/lib/docs/docs-layout'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider'
import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import type { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Jags - Personal vault',
  description: 'My personal vault',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

const figtree = Figtree({
  subsets: ['latin'],
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'avenir next',
    'avenir',
    'segoe ui',
    'helvetica neue',
    'helvetica',
    'Cantarell',
    'Ubuntu',
    'roboto',
    'noto',
    'arial',
    'sans-serif'
  ]
})

export default async function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.className} bg-background antialiased flex flex-col min-h-screen`}>
        <RootProvider>
          <DocsLayout tree={docs.pageTree} {...docsLayoutOptions}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
