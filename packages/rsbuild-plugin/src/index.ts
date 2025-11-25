import type { DevupApiOptions } from '@devup-api/core'
import type { RsbuildPlugin } from '@rsbuild/core'

export default function devupApiRsbuildPlugin(
  _options?: DevupApiOptions,
): RsbuildPlugin {
  return {
    name: 'devup-api',
    setup: () => {},
    // Rsbuild plugin implementation
  }
}
