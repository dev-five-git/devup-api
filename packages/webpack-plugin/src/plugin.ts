import { join, resolve } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import {
  createUrlMap,
  generateCrudConfigCode,
  generateCrudConfigTypes,
  generateInterface,
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '@devup-api/generator'
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

          // Generate Zod schemas file
          await writeInterfaceAsync(
            join(tempDir, 'zod-schemas.js'),
            generateZodSchemas(schemas, this.options),
          )

          // Generate Zod type declarations
          await writeInterfaceAsync(
            join(tempDir, 'zod.d.ts'),
            generateZodTypeDeclarations(schemas, this.options),
          )

          // Generate CRUD configs file
          await writeInterfaceAsync(
            join(tempDir, 'crud-configs.jsx'),
            generateCrudConfigCode(schemas),
          )

          // Generate CRUD config type declarations
          await writeInterfaceAsync(
            join(tempDir, 'ui.d.ts'),
            generateCrudConfigTypes(schemas),
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

          // Add alias for @devup-api/zod to resolve to the generated file
          const zodSchemasPath = resolve(tempDir, 'zod-schemas.js')
          new compiler.webpack.NormalModuleReplacementPlugin(
            /^@devup-api\/zod$/,
            zodSchemasPath,
          ).apply(compiler)

          // Add alias for @devup-api/ui/crud to resolve to the generated file
          const crudConfigPath = resolve(tempDir, 'crud-configs.jsx')
          new compiler.webpack.NormalModuleReplacementPlugin(
            /^@devup-api\/ui\/crud$/,
            crudConfigPath,
          ).apply(compiler)

          callback()
        } catch (error) {
          this.initialized = false
          callback(error as Error)
        }
      },
    )
  }
}
