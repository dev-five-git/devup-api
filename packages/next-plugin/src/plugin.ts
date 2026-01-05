import { join, relative, resolve } from 'node:path'
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
  createTmpDir,
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

    // Generate CRUD configs file
    writeInterface(
      join(tempDir, 'crud-configs.jsx'),
      generateCrudConfigCode(schemas),
    )

    // Generate CRUD config type declarations
    writeInterface(join(tempDir, 'ui.d.ts'), generateCrudConfigTypes(schemas))

    // Create urlMap and set environment variable
    const urlMap = createUrlMap(schemas, options)
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
