import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import {
  createTmpDirAsync,
  readOpenapiAsync,
  writeInterfaceAsync,
} from '@devup-api/utils'
import type { Compiler } from 'webpack'
import { DefinePlugin } from 'webpack'

export class devupApiWebpackPlugin {
  options: DevupApiOptions
  initialized = false

  constructor(options?: DevupApiOptions) {
    this.options = options || {}
  }

  apply(compiler: Compiler): void {
    // Perform async operations before compilation
    compiler.hooks.beforeCompile.tapAsync(
      'devup-api',
      async (_params, callback) => {
        // Guard: only run once
        if (this.initialized) {
          callback()
          return
        }

        try {
          this.initialized = true

          const tempDir = await createTmpDirAsync(this.options?.tempDir)
          const schema = await readOpenapiAsync(this.options?.openapiFile)

          // Generate interface file
          await writeInterfaceAsync(
            join(tempDir, 'api.d.ts'),
            generateInterface(schema, this.options),
          )

          // Create urlMap and set environment variable
          const urlMap = createUrlMap(schema, this.options)
          const define: Record<string, string> = {}
          if (urlMap) {
            define['process.env.DEVUP_API_URL_MAP'] = JSON.stringify(
              JSON.stringify(urlMap),
            )
          }

          // Add DefinePlugin to webpack configuration
          if (Object.keys(define).length > 0) {
            new DefinePlugin(define).apply(compiler)
          }

          callback()
        } catch (error) {
          this.initialized = false
          callback(error as Error)
        }
      },
    )
  }
}
