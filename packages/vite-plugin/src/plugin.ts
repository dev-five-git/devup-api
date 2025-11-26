import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import {
  createTmpDirAsync,
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
      const schema = await readOpenapiAsync(options?.openapiFile)
      await writeInterfaceAsync(
        join(tempDir, 'api.d.ts'),
        generateInterface(schema, options),
      )
    },
    async config() {
      const schema = await readOpenapiAsync(options?.openapiFile)
      const urlMap = createUrlMap(schema, options)
      const define: Record<string, string> = {}
      if (urlMap) {
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
