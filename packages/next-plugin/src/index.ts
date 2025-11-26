import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import { createUrlMap, generateInterface } from '@devup-api/generator'
import { createTmpDir, readOpenapi, writeInterface } from '@devup-api/utils'
import { devupApiWebpackPlugin } from '@devup-api/webpack-plugin'
import type { NextConfig } from 'next'
export function DevupUI(
  config: NextConfig,
  options: DevupApiOptions = {},
): NextConfig {
  const isTurbo =
    process.env.TURBOPACK === '1' || process.env.TURBOPACK === 'auto'
  if (isTurbo) {
    const tempDir = createTmpDir(options?.tempDir)
    const schema = readOpenapi(options?.openapiFile)

    writeInterface(
      join(tempDir, 'api.d.ts'),
      generateInterface(schema, options),
    )
    // Create urlMap and set environment variable
    const urlMap = createUrlMap(schema, options)
    config.env ??= {}
    Object.assign(config.env, {
      DEVUP_API_URL_MAP: JSON.stringify(urlMap),
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
