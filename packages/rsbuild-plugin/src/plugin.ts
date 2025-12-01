import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
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

      // Create urlMap and set environment variable
      const urlMap = createUrlMap(schemas, options)

      build.modifyRsbuildConfig((config) => {
        config.source ??= {}
        config.source.define ??= {}
        if (urlMap && Object.keys(urlMap).length > 0) {
          config.source.define['process.env.DEVUP_API_URL_MAP'] =
            JSON.stringify(JSON.stringify(urlMap))
        }
        return config
      })
    },
  }
}
