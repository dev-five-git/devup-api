import { join } from 'node:path'
import type { OpenAPIV3_1 } from 'openapi-types'

/**
 * Minimal options interface for the generation pipeline.
 * Defined locally to avoid depending on @devup-api/core.
 */
interface GenerateDevupOptions {
  openapiFiles?: string | string[]
  tempDir?: string
}

/**
 * Generator functions injected by the caller.
 * This decouples @devup-api/utils from @devup-api/generator.
 */
export interface DevupGenerators<TOptions = unknown> {
  generateInterface: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => string
  generateZodSchemas: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => string
  generateZodTypeDeclarations: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => string
  generateCrudConfigCode: (
    schemas: Record<string, OpenAPIV3_1.Document>,
  ) => string
  generateCrudConfigTypes: (
    schemas: Record<string, OpenAPIV3_1.Document>,
  ) => string
  generateServerActionCode: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => string
  generateServerActionTypes: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => string
  createUrlMap: (
    schemas: Record<string, OpenAPIV3_1.Document>,
    options?: TOptions,
  ) => Record<string, unknown>
}

/**
 * IO functions for the async pipeline.
 */
export interface DevupIOAsync {
  createTmpDirAsync: (tempDir?: string) => Promise<string>
  normalizeOpenapiFiles: (openapiFiles?: string[] | string) => string[]
  readOpenapiAsync: (
    openapiFiles: string[],
  ) => Promise<Record<string, OpenAPIV3_1.Document>>
  writeInterfaceAsync: (filePath: string, content: string) => Promise<void>
}

/**
 * IO functions for the sync pipeline.
 */
export interface DevupIOSync {
  createTmpDir: (tempDir?: string) => string
  normalizeOpenapiFiles: (openapiFiles?: string[] | string) => string[]
  readOpenapis: (openapiFiles: string[]) => Record<string, OpenAPIV3_1.Document>
  writeInterface: (filePath: string, content: string) => void
}

/**
 * Generated file contents from the pipeline.
 */
export interface DevupGeneratedFiles {
  interface: string
  zodSchemas: string
  zodTypes: string
  crudConfig: string
  crudTypes: string
  serverActions: string
  serverActionTypes: string
}

/**
 * Result of the generation pipeline.
 */
export interface DevupArtifacts {
  tempDir: string
  schemas: Record<string, OpenAPIV3_1.Document>
  files: DevupGeneratedFiles
  urlMap: Record<string, unknown>
}

/**
 * Async generation pipeline: read schemas → generate all outputs → write files → create URL map.
 * Used by Vite, Webpack, and Rsbuild plugins.
 */
export async function generateDevupArtifactsAsync<
  TOptions extends GenerateDevupOptions,
>(
  io: DevupIOAsync,
  generators: DevupGenerators<TOptions>,
  options?: TOptions,
): Promise<DevupArtifacts> {
  const tempDir = await io.createTmpDirAsync(options?.tempDir)
  const openapiFiles = io.normalizeOpenapiFiles(options?.openapiFiles)
  const schemas = await io.readOpenapiAsync(openapiFiles)

  const files: DevupGeneratedFiles = {
    interface: generators.generateInterface(schemas, options),
    zodSchemas: generators.generateZodSchemas(schemas, options),
    zodTypes: generators.generateZodTypeDeclarations(schemas, options),
    crudConfig: generators.generateCrudConfigCode(schemas),
    crudTypes: generators.generateCrudConfigTypes(schemas),
    serverActions: generators.generateServerActionCode(schemas, options),
    serverActionTypes: generators.generateServerActionTypes(schemas, options),
  }

  await Promise.all([
    io.writeInterfaceAsync(join(tempDir, 'api.d.ts'), files.interface),
    io.writeInterfaceAsync(join(tempDir, 'zod-schemas.js'), files.zodSchemas),
    io.writeInterfaceAsync(join(tempDir, 'zod.d.ts'), files.zodTypes),
    io.writeInterfaceAsync(join(tempDir, 'crud-configs.jsx'), files.crudConfig),
    io.writeInterfaceAsync(join(tempDir, 'ui.d.ts'), files.crudTypes),
    io.writeInterfaceAsync(join(tempDir, 'server.ts'), files.serverActions),
    io.writeInterfaceAsync(
      join(tempDir, 'server-module.d.ts'),
      files.serverActionTypes,
    ),
  ])

  const urlMap = generators.createUrlMap(schemas, options)
  return { tempDir, schemas, files, urlMap }
}

/**
 * Sync generation pipeline: read schemas → generate all outputs → write files → create URL map.
 * Used by Next.js Turbopack plugin.
 */
export function generateDevupArtifacts<TOptions extends GenerateDevupOptions>(
  io: DevupIOSync,
  generators: DevupGenerators<TOptions>,
  options?: TOptions,
): DevupArtifacts {
  const tempDir = io.createTmpDir(options?.tempDir)
  const openapiFiles = io.normalizeOpenapiFiles(options?.openapiFiles)
  const schemas = io.readOpenapis(openapiFiles)

  const files: DevupGeneratedFiles = {
    interface: generators.generateInterface(schemas, options),
    zodSchemas: generators.generateZodSchemas(schemas, options),
    zodTypes: generators.generateZodTypeDeclarations(schemas, options),
    crudConfig: generators.generateCrudConfigCode(schemas),
    crudTypes: generators.generateCrudConfigTypes(schemas),
    serverActions: generators.generateServerActionCode(schemas, options),
    serverActionTypes: generators.generateServerActionTypes(schemas, options),
  }

  io.writeInterface(join(tempDir, 'api.d.ts'), files.interface)
  io.writeInterface(join(tempDir, 'zod-schemas.js'), files.zodSchemas)
  io.writeInterface(join(tempDir, 'zod.d.ts'), files.zodTypes)
  io.writeInterface(join(tempDir, 'crud-configs.jsx'), files.crudConfig)
  io.writeInterface(join(tempDir, 'ui.d.ts'), files.crudTypes)
  io.writeInterface(join(tempDir, 'server.ts'), files.serverActions)
  io.writeInterface(
    join(tempDir, 'server-module.d.ts'),
    files.serverActionTypes,
  )

  const urlMap = generators.createUrlMap(schemas, options)
  return { tempDir, schemas, files, urlMap }
}
