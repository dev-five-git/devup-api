import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import {
  createTmpDirAsync,
  normalizeOpenapiFiles,
  readOpenapiAsync,
  writeInterfaceAsync,
} from '@devup-api/utils'
import type { Plugin } from 'vite'

export function devupApi(options?: DevupApiOptions): Plugin {
  return {
    name: 'devup-api',
    // Vite plugin implementation
    async configResolved() {
      const tempDir = await createTmpDirAsync(options?.tempDir)
      const openapiFiles = normalizeOpenapiFiles(options?.openapiFiles)
      const schemas = await readOpenapiAsync(openapiFiles)
      await writeInterfaceAsync(
        join(tempDir, 'api.d.ts'),
        generateInterface(schemas, options),
      )
    },
    async config() {
      const openapiFiles = normalizeOpenapiFiles(options?.openapiFiles)
      const schemas = await readOpenapiAsync(openapiFiles)
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
