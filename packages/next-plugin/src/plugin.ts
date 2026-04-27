import { relative, resolve } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import {
  createUrlMap,
  generateCrudConfigCode,
  generateCrudConfigTypes,
  generateInterface,
  generateServerActionCode,
  generateServerActionTypes,
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '@devup-api/generator'
import {
  createTmpDir,
  type DevupGenerators,
  type DevupIOSync,
  generateDevupArtifacts,
  normalizeOpenapiFiles,
  readOpenapis,
  writeInterface,
} from '@devup-api/utils'
import { devupApiWebpackPlugin } from '@devup-api/webpack-plugin'
import type { NextConfig } from 'next'

/**
 * Convert absolute path to relative path with forward slashes
 */
function toRelativePath(absolutePath: string): string {
  return `./${relative(process.cwd(), absolutePath).replace(/\\/g, '/')}`
}

export function devupApi(
  config: NextConfig,
  options: DevupApiOptions = {},
): NextConfig {
  const isTurbo =
    process.env.TURBOPACK === '1' || process.env.TURBOPACK === 'auto'
  if (isTurbo) {
    const io: DevupIOSync = {
      createTmpDir,
      normalizeOpenapiFiles,
      readOpenapis,
      writeInterface,
    }

    const generators: DevupGenerators<DevupApiOptions> = {
      generateInterface,
      generateZodSchemas,
      generateZodTypeDeclarations,
      generateCrudConfigCode,
      generateCrudConfigTypes,
      generateServerActionCode,
      generateServerActionTypes,
      createUrlMap,
    }

    const { tempDir, urlMap } = generateDevupArtifacts(io, generators, options)

    // Set environment variable
    config.env ??= {}
    if (urlMap && Object.keys(urlMap).length > 0) {
      Object.assign(config.env, {
        DEVUP_API_URL_MAP: JSON.stringify(urlMap),
      })
    }

    // Add aliases for virtual modules in turbopack mode
    // Use relative paths with forward slashes for Turbopack compatibility
    config.turbopack ??= {}
    config.turbopack.resolveAlias ??= {}
    Object.assign(config.turbopack.resolveAlias, {
      '@devup-api/zod': toRelativePath(resolve(tempDir, 'zod-schemas.js')),
      '@devup-api/ui/crud': toRelativePath(
        resolve(tempDir, 'crud-configs.jsx'),
      ),
      '@devup-api/fetch/server': toRelativePath(resolve(tempDir, 'server.ts')),
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
