import { expect, mock, test } from 'bun:test'
import { join } from 'node:path'
import type { OpenAPIV3_1 } from 'openapi-types'
import type {
  DevupGenerators,
  DevupIOAsync,
  DevupIOSync,
} from '../generate-devup'
import {
  generateDevupArtifacts,
  generateDevupArtifactsAsync,
} from '../generate-devup'

const mockSchema = {
  openapi: '3.1.0',
  paths: {
    '/users': {
      get: {
        operationId: 'getUsers',
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  },
} as unknown as OpenAPIV3_1.Document

const mockSchemas: Record<string, OpenAPIV3_1.Document> = {
  'openapi.json': mockSchema,
}

const mockUrlMap = { getUsers: { method: 'GET', url: '/users' } }

function createMockGenerators(): DevupGenerators<{
  openapiFiles?: string | string[]
  tempDir?: string
}> {
  return {
    generateInterface: mock(() => 'interface-content'),
    generateZodSchemas: mock(() => 'zod-schemas-content'),
    generateZodTypeDeclarations: mock(() => 'zod-types-content'),
    generateCrudConfigCode: mock(() => 'crud-config-content'),
    generateCrudConfigTypes: mock(() => 'crud-types-content'),
    createUrlMap: mock(() => mockUrlMap),
  }
}

function createMockIOAsync(): DevupIOAsync {
  return {
    createTmpDirAsync: mock(async () => 'df'),
    normalizeOpenapiFiles: mock(() => ['openapi.json']),
    readOpenapiAsync: mock(async () => mockSchemas),
    writeInterfaceAsync: mock(async () => {}),
  }
}

function createMockIOSync(): DevupIOSync {
  return {
    createTmpDir: mock(() => 'df'),
    normalizeOpenapiFiles: mock(() => ['openapi.json']),
    readOpenapis: mock(() => mockSchemas),
    writeInterface: mock(() => {}),
  }
}

// =============================================================================
// generateDevupArtifactsAsync
// =============================================================================

test('generateDevupArtifactsAsync returns correct artifacts', async () => {
  const io = createMockIOAsync()
  const generators = createMockGenerators()

  const result = await generateDevupArtifactsAsync(io, generators)

  expect(result.tempDir).toBe('df')
  expect(result.schemas).toBe(mockSchemas)
  expect(result.files.interface).toBe('interface-content')
  expect(result.files.zodSchemas).toBe('zod-schemas-content')
  expect(result.files.zodTypes).toBe('zod-types-content')
  expect(result.files.crudConfig).toBe('crud-config-content')
  expect(result.files.crudTypes).toBe('crud-types-content')
  expect(result.urlMap).toBe(mockUrlMap)
})

test('generateDevupArtifactsAsync calls IO functions correctly', async () => {
  const io = createMockIOAsync()
  const generators = createMockGenerators()
  const options = { tempDir: 'custom-dir', openapiFiles: 'api.json' }

  await generateDevupArtifactsAsync(io, generators, options)

  expect(io.createTmpDirAsync).toHaveBeenCalledWith('custom-dir')
  expect(io.normalizeOpenapiFiles).toHaveBeenCalledWith('api.json')
  expect(io.readOpenapiAsync).toHaveBeenCalledWith(['openapi.json'])
})

test('generateDevupArtifactsAsync calls all generators with schemas and options', async () => {
  const io = createMockIOAsync()
  const generators = createMockGenerators()
  const options = { tempDir: 'df', openapiFiles: 'openapi.json' }

  await generateDevupArtifactsAsync(io, generators, options)

  expect(generators.generateInterface).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateZodSchemas).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateZodTypeDeclarations).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateCrudConfigCode).toHaveBeenCalledWith(mockSchemas)
  expect(generators.generateCrudConfigTypes).toHaveBeenCalledWith(mockSchemas)
  expect(generators.createUrlMap).toHaveBeenCalledWith(mockSchemas, options)
})

test('generateDevupArtifactsAsync writes all 5 files to tempDir', async () => {
  const io = createMockIOAsync()
  const generators = createMockGenerators()

  await generateDevupArtifactsAsync(io, generators)

  expect(io.writeInterfaceAsync).toHaveBeenCalledTimes(5)
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'api.d.ts'),
    'interface-content',
  )
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'zod-schemas.js'),
    'zod-schemas-content',
  )
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'zod.d.ts'),
    'zod-types-content',
  )
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'crud-configs.jsx'),
    'crud-config-content',
  )
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'ui.d.ts'),
    'crud-types-content',
  )
})

test('generateDevupArtifactsAsync passes undefined options when none provided', async () => {
  const io = createMockIOAsync()
  const generators = createMockGenerators()

  await generateDevupArtifactsAsync(io, generators)

  expect(io.createTmpDirAsync).toHaveBeenCalledWith(undefined)
  expect(io.normalizeOpenapiFiles).toHaveBeenCalledWith(undefined)
  expect(generators.generateInterface).toHaveBeenCalledWith(
    mockSchemas,
    undefined,
  )
  expect(generators.createUrlMap).toHaveBeenCalledWith(mockSchemas, undefined)
})

// =============================================================================
// generateDevupArtifacts (sync)
// =============================================================================

test('generateDevupArtifacts returns correct artifacts', () => {
  const io = createMockIOSync()
  const generators = createMockGenerators()

  const result = generateDevupArtifacts(io, generators)

  expect(result.tempDir).toBe('df')
  expect(result.schemas).toBe(mockSchemas)
  expect(result.files.interface).toBe('interface-content')
  expect(result.files.zodSchemas).toBe('zod-schemas-content')
  expect(result.files.zodTypes).toBe('zod-types-content')
  expect(result.files.crudConfig).toBe('crud-config-content')
  expect(result.files.crudTypes).toBe('crud-types-content')
  expect(result.urlMap).toBe(mockUrlMap)
})

test('generateDevupArtifacts calls IO functions correctly', () => {
  const io = createMockIOSync()
  const generators = createMockGenerators()
  const options = { tempDir: 'custom-dir', openapiFiles: 'api.json' }

  generateDevupArtifacts(io, generators, options)

  expect(io.createTmpDir).toHaveBeenCalledWith('custom-dir')
  expect(io.normalizeOpenapiFiles).toHaveBeenCalledWith('api.json')
  expect(io.readOpenapis).toHaveBeenCalledWith(['openapi.json'])
})

test('generateDevupArtifacts calls all generators with schemas and options', () => {
  const io = createMockIOSync()
  const generators = createMockGenerators()
  const options = { tempDir: 'df', openapiFiles: 'openapi.json' }

  generateDevupArtifacts(io, generators, options)

  expect(generators.generateInterface).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateZodSchemas).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateZodTypeDeclarations).toHaveBeenCalledWith(
    mockSchemas,
    options,
  )
  expect(generators.generateCrudConfigCode).toHaveBeenCalledWith(mockSchemas)
  expect(generators.generateCrudConfigTypes).toHaveBeenCalledWith(mockSchemas)
  expect(generators.createUrlMap).toHaveBeenCalledWith(mockSchemas, options)
})

test('generateDevupArtifacts writes all 5 files to tempDir', () => {
  const io = createMockIOSync()
  const generators = createMockGenerators()

  generateDevupArtifacts(io, generators)

  expect(io.writeInterface).toHaveBeenCalledTimes(5)
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('df', 'api.d.ts'),
    'interface-content',
  )
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('df', 'zod-schemas.js'),
    'zod-schemas-content',
  )
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('df', 'zod.d.ts'),
    'zod-types-content',
  )
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('df', 'crud-configs.jsx'),
    'crud-config-content',
  )
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('df', 'ui.d.ts'),
    'crud-types-content',
  )
})

test('generateDevupArtifacts passes undefined options when none provided', () => {
  const io = createMockIOSync()
  const generators = createMockGenerators()

  generateDevupArtifacts(io, generators)

  expect(io.createTmpDir).toHaveBeenCalledWith(undefined)
  expect(io.normalizeOpenapiFiles).toHaveBeenCalledWith(undefined)
  expect(generators.generateInterface).toHaveBeenCalledWith(
    mockSchemas,
    undefined,
  )
  expect(generators.createUrlMap).toHaveBeenCalledWith(mockSchemas, undefined)
})

test('generateDevupArtifacts uses custom tempDir in file paths', () => {
  const io = createMockIOSync()
  ;(io.createTmpDir as ReturnType<typeof mock>).mockReturnValue('custom-temp')
  const generators = createMockGenerators()

  const result = generateDevupArtifacts(io, generators, {
    tempDir: 'custom-temp',
  })

  expect(result.tempDir).toBe('custom-temp')
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('custom-temp', 'api.d.ts'),
    'interface-content',
  )
  expect(io.writeInterface).toHaveBeenCalledWith(
    join('custom-temp', 'zod-schemas.js'),
    'zod-schemas-content',
  )
})

test('generateDevupArtifactsAsync uses custom tempDir in file paths', async () => {
  const io = createMockIOAsync()
  ;(io.createTmpDirAsync as ReturnType<typeof mock>).mockResolvedValue(
    'custom-temp',
  )
  const generators = createMockGenerators()

  const result = await generateDevupArtifactsAsync(io, generators, {
    tempDir: 'custom-temp',
  })

  expect(result.tempDir).toBe('custom-temp')
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('custom-temp', 'api.d.ts'),
    'interface-content',
  )
  expect(io.writeInterfaceAsync).toHaveBeenCalledWith(
    join('custom-temp', 'zod-schemas.js'),
    'zod-schemas-content',
  )
})
