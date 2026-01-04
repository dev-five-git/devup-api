import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import {
  createUrlMap,
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
import type { OpenAPIV3_1 } from 'openapi-types'
import type { Plugin } from 'vite'

const VIRTUAL_ZOD_MODULE = '@devup-api/zod'
const RESOLVED_VIRTUAL_ZOD_MODULE = `\0${VIRTUAL_ZOD_MODULE}`

export function devupApi(options?: DevupApiOptions): Plugin {
  let cachedSchemas: Record<string, OpenAPIV3_1.Document> | null = null
  let zodSchemasCode: string | null = null

  const getSchemas = async (): Promise<
    Record<string, OpenAPIV3_1.Document>
  > => {
    if (!cachedSchemas) {
      const openapiFiles = normalizeOpenapiFiles(options?.openapiFiles)
      cachedSchemas = await readOpenapiAsync(openapiFiles)
    }
    return cachedSchemas
  }

  return {
    name: 'devup-api',

    // Resolve virtual module for @devup-api/zod
    resolveId(id) {
      if (id === VIRTUAL_ZOD_MODULE) {
        return RESOLVED_VIRTUAL_ZOD_MODULE
      }
      return null
    },

    // Load virtual module content
    async load(id) {
      if (id === RESOLVED_VIRTUAL_ZOD_MODULE) {
        if (!zodSchemasCode) {
          const schemas = await getSchemas()
          zodSchemasCode = generateZodSchemas(schemas, options)
        }
        return zodSchemasCode
      }
      return null
    },

    // Generate type definitions
    async configResolved() {
      const tempDir = await createTmpDirAsync(options?.tempDir)
      const schemas = await getSchemas()

      // Write API interface definitions
      await writeInterfaceAsync(
        join(tempDir, 'api.d.ts'),
        generateInterface(schemas, options),
      )

      // Write Zod type declarations
      await writeInterfaceAsync(
        join(tempDir, 'zod.d.ts'),
        generateZodTypeDeclarations(schemas, options),
      )
    },

    // Inject URL map as environment variable
    async config() {
      const schemas = await getSchemas()
      const urlMap = createUrlMap(schemas, options)
      const define: Record<string, string> = {}
      if (urlMap && Object.keys(urlMap).length > 0) {
        // json stringify twice to avoid JSON.parse error
        define['process.env.DEVUP_API_URL_MAP'] = JSON.stringify(
          JSON.stringify(urlMap),
        )
      }
      return {
        define,
      }
    },
  }
}
