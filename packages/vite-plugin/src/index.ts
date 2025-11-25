import type { DevupApiOptions } from '@devup-api/core'
import type { Plugin } from 'vite'

export default function devupApiVitePlugin(_options?: DevupApiOptions): Plugin {
  return {
    name: 'devup-api',
    // Vite plugin implementation
  }
}
