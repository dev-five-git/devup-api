import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
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

    writeInterface(
      join(tempDir, 'api.d.ts'),
      generateInterface(schemas, options),
    )
    // Create urlMap and set environment variable
    const urlMap = createUrlMap(schemas, options)
    config.env ??= {}
    if (urlMap && Object.keys(urlMap).length > 0) {
      Object.assign(config.env, {
        DEVUP_API_URL_MAP: JSON.stringify(urlMap),
      })
    }
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
