import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import {
  createTmpDirAsync,
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
      const schema = await readOpenapiAsync(options?.openapiFile)

      // Generate interface file
      await writeInterfaceAsync(
        join(tempDir, 'api.d.ts'),
        generateInterface(schema, options),
      )

      // Create urlMap and set environment variable
      const urlMap = createUrlMap(schema, options)

      build.modifyRsbuildConfig((config) => {
        config.source ??= {}
        config.source.define ??= {}
        if (urlMap) {
          config.source.define['process.env.DEVUP_API_URL_MAP'] =
            JSON.stringify(urlMap)
        }
        return config
      })
    },
  }
}
