import type { DevupApiOptions } from '@devup-api/core'
import type { NextConfig } from 'next'

export default function devupApiPlugin(_options?: DevupApiOptions) {
  return (nextConfig: NextConfig): NextConfig => {
    return {
      ...nextConfig,
      // Extend Next.js configuration
    }
  }
}
