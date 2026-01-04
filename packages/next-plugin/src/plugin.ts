import { join, resolve } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import {
  createUrlMap,
  generateInterface,
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '@devup-api/generator'
import {
  createTmpDir,
  normalizeOpenapiFiles,
  readOpenapis,
  writeInterface,
} from '@devup-api/utils'
import { devupApiWebpackPlugin } from '@devup-api/webpack-plugin'
import type { NextConfig } from 'next'

export function devupApi(
  config: NextConfig,
  options: DevupApiOptions = {},
): NextConfig {
  const isTurbo =
    process.env.TURBOPACK === '1' || process.env.TURBOPACK === 'auto'
  if (isTurbo) {
    const tempDir = createTmpDir(options?.tempDir)
    const openapiFiles = normalizeOpenapiFiles(options?.openapiFiles)
    const schemas = readOpenapis(openapiFiles)

    // Generate API interface file
    writeInterface(
      join(tempDir, 'api.d.ts'),
      generateInterface(schemas, options),
    )

    // Generate Zod schemas file
    writeInterface(
      join(tempDir, 'zod-schemas.js'),
      generateZodSchemas(schemas, options),
    )

    // Generate Zod type declarations
    writeInterface(
      join(tempDir, 'zod.d.ts'),
      generateZodTypeDeclarations(schemas, options),
    )

    // Create urlMap and set environment variable
    const urlMap = createUrlMap(schemas, options)
    config.env ??= {}
    if (urlMap && Object.keys(urlMap).length > 0) {
      Object.assign(config.env, {
        DEVUP_API_URL_MAP: JSON.stringify(urlMap),
      })
    }

    // Add alias for @devup-api/zod in turbopack mode
    const zodSchemasPath = resolve(tempDir, 'zod-schemas.js')
    config.experimental ??= {}
    // biome-ignore lint/suspicious/noExplicitAny: turbo config types may not be available in all Next.js versions
    const experimental = config.experimental as any
    experimental.turbo ??= {}
    experimental.turbo.resolveAlias ??= {}
    Object.assign(experimental.turbo.resolveAlias, {
      '@devup-api/zod': zodSchemasPath,
    })

    return config
  }

  const webpack = config.webpack
  config.webpack = (config, _options) => {
    config.plugins.push(new devupApiWebpackPlugin(options))
    if (typeof webpack === 'function') return webpack(config, _options)
    return config
  }
  return config
}
