import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import {
  createTmpDirAsync,
  normalizeOpenapiFiles,
  readOpenapiAsync,
  writeInterfaceAsync,
} from '@devup-api/utils'
import type { Compiler } from 'webpack'

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
          const openapiFiles = normalizeOpenapiFiles(this.options?.openapiFiles)
          const schemas = await readOpenapiAsync(openapiFiles)

          // Generate interface file
          await writeInterfaceAsync(
            join(tempDir, 'api.d.ts'),
            generateInterface(schemas, this.options),
          )

          // Create urlMap and set environment variable
          const urlMap = createUrlMap(schemas, this.options)
          const define: Record<string, string> = {}
          if (urlMap && Object.keys(urlMap).length > 0) {
            define['process.env.DEVUP_API_URL_MAP'] = JSON.stringify(
              JSON.stringify(urlMap),
            )
          }

          // Add DefinePlugin to webpack configuration
          if (Object.keys(define).length > 0) {
            new compiler.webpack.DefinePlugin(define).apply(compiler)
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
