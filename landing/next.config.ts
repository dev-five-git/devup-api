import type { NextConfig } from 'next'
import DevupUI from '@devup-ui/next-plugin'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  output: 'export',
  reactCompiler: true,
}

export default DevupUI(nextConfig)
