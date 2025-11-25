import type { DevupApiOptions } from '@devup-api/core'
import type { Compiler } from 'webpack'

export default class devupApiWebpackPlugin {
  options: DevupApiOptions

  constructor(options?: DevupApiOptions) {
    this.options = options || {}
  }

  apply(_compiler: Compiler): void {
    // Webpack plugin implementation
  }
}
