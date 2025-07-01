import './globals.css'
import { docs } from '@/lib/docs/docs'
import { docsLayoutOptions } from '@/lib/docs/docs-layout'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider'
import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import type { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Jags - Personal diary',
  description: 'My personal diary',
}

const figtree = Figtree({
  subsets: [ 'latin' ],
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
