import type { NextConfig } from 'next'

// Proxy /api/* to the standalone Express backend so the browser stays
// same-origin (cookies just work, no CORS) while the frontend keeps calling
// relative /api/... URLs.
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
