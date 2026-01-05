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
import type { RsbuildPlugin } from '@rsbuild/core'

export function devupApiRsbuildPlugin(
  options?: DevupApiOptions,
): RsbuildPlugin {
  return {
    name: 'devup-api',
    async setup(build) {
      const tempDir = await createTmpDirAsync(options?.tempDir)
      const openapiFiles = normalizeOpenapiFiles(options?.openapiFiles)
      const schemas = await readOpenapiAsync(openapiFiles)

      // Generate interface file
      await writeInterfaceAsync(
        join(tempDir, 'api.d.ts'),
        generateInterface(schemas, options),
      )

      // Generate Zod schemas file
      await writeInterfaceAsync(
        join(tempDir, 'zod-schemas.js'),
        generateZodSchemas(schemas, options),
      )

      // Generate Zod type declarations
      await writeInterfaceAsync(
        join(tempDir, 'zod.d.ts'),
        generateZodTypeDeclarations(schemas, options),
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
      const urlMap = createUrlMap(schemas, options)

      // Get absolute paths for virtual modules
      const zodSchemasPath = resolve(tempDir, 'zod-schemas.js')
      const crudConfigsPath = resolve(tempDir, 'crud-configs.jsx')

      build.modifyRsbuildConfig((config) => {
        config.source ??= {}
        config.resolve ??= {}
        config.source.define ??= {}
        config.resolve.alias ??= {}

        // Set URL map environment variable
        if (urlMap && Object.keys(urlMap).length > 0) {
          config.source.define['process.env.DEVUP_API_URL_MAP'] =
            JSON.stringify(JSON.stringify(urlMap))
        }
        // Add alias for @devup-api/zod
        ;(config.resolve.alias as Record<string, string>)['@devup-api/zod'] =
          zodSchemasPath

        // Add alias for @devup-api/ui/crud
        ;(config.resolve.alias as Record<string, string>)[
          '@devup-api/ui/crud'
        ] = crudConfigsPath

        return config
      })
    },
  }
}
