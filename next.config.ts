import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: process.env.PROFILE !== 'prod',
  poweredByHeader: false,
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/introduction',
        permanent: true
      }
    ]
  }
}

const withMDX = createMDX()

export default withMDX(nextConfig)
