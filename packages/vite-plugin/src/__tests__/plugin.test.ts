import { beforeEach, expect, spyOn, test } from 'bun:test'
import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import * as generator from '@devup-api/generator'
import * as utils from '@devup-api/utils'
import { devupApi } from '../plugin'

let mockCreateTmpDirAsync: ReturnType<typeof spyOn>
let mockReadOpenapiAsync: ReturnType<typeof spyOn>
let mockWriteInterfaceAsync: ReturnType<typeof spyOn>
let mockCreateUrlMap: ReturnType<typeof spyOn>
let mockGenerateInterface: ReturnType<typeof spyOn>
let mockGenerateZodSchemas: ReturnType<typeof spyOn>
let mockGenerateZodTypeDeclarations: ReturnType<typeof spyOn>
let mockGenerateCrudConfigCode: ReturnType<typeof spyOn>
let mockGenerateCrudConfigTypes: ReturnType<typeof spyOn>

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
                schema: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
} as const

const mockUrlMap = {
  getUsers: {
    method: 'GET' as const,
    url: '/users',
  },
  '/users': {
    method: 'GET' as const,
    url: '/users',
  },
}

const mockInterfaceContent = 'export interface Test {}'

const mockZodSchemasContent = 'export const schemas = {}'
const mockZodTypeDeclarationsContent = 'declare module "@devup-api/zod" {}'
const mockCrudConfigCodeContent = 'export function UserCrud() {}'
const mockCrudConfigTypesContent = 'declare module "@devup-api/ui/crud" {}'

beforeEach(() => {
  mockCreateTmpDirAsync = spyOn(utils, 'createTmpDirAsync').mockResolvedValue(
    'df',
  )
  mockReadOpenapiAsync = spyOn(utils, 'readOpenapiAsync').mockResolvedValue(
    mockSchema as never,
  )
  mockWriteInterfaceAsync = spyOn(
    utils,
    'writeInterfaceAsync',
  ).mockResolvedValue(undefined)
  mockCreateUrlMap = spyOn(generator, 'createUrlMap').mockReturnValue(
    mockUrlMap as never,
  )
  mockGenerateInterface = spyOn(generator, 'generateInterface').mockReturnValue(
    mockInterfaceContent,
  )
  mockGenerateZodSchemas = spyOn(
    generator,
    'generateZodSchemas',
  ).mockReturnValue(mockZodSchemasContent)
  mockGenerateZodTypeDeclarations = spyOn(
    generator,
    'generateZodTypeDeclarations',
  ).mockReturnValue(mockZodTypeDeclarationsContent)
  mockGenerateCrudConfigCode = spyOn(
    generator,
    'generateCrudConfigCode',
  ).mockReturnValue(mockCrudConfigCodeContent)
  mockGenerateCrudConfigTypes = spyOn(
    generator,
    'generateCrudConfigTypes',
  ).mockReturnValue(mockCrudConfigTypesContent)
})

test('devupApi returns plugin with correct name', () => {
  const plugin = devupApi()
  expect(plugin.name).toBe('devup-api')
})

test.each([
  [undefined, ['openapi.json']],
  [{ tempDir: 'custom-dir' }, ['openapi.json']],
  [{ openapiFiles: 'custom-openapi.json' }, ['custom-openapi.json']],
  [
    {
      tempDir: 'custom-dir',
      openapiFiles: 'custom-openapi.json',
      convertCase: 'snake' as const,
    },
    ['custom-openapi.json'],
  ],
] as const)('devupApi returns plugin with config hook: %s', async (options:
  | DevupApiOptions
  | undefined, expectedFiles: string[]) => {
  const plugin = devupApi(options)
  expect(plugin.config).toBeDefined()
  expect(typeof plugin.config).toBe('function')

  const result = await (
    plugin as unknown as {
      config?: () => Promise<{ define: Record<string, string> }>
    }
  ).config?.()
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(expectedFiles)
  expect(mockCreateUrlMap).toHaveBeenCalledWith(mockSchema, options)
  expect(result).toEqual({
    define: {
      'process.env.DEVUP_API_URL_MAP': JSON.stringify(
        JSON.stringify(mockUrlMap),
      ),
    },
  })
})

test('devupApi config hook returns empty define when urlMap is null', async () => {
  mockCreateUrlMap.mockReturnValue(null as never)
  const plugin = devupApi()
  const result = await (
    plugin as unknown as {
      config?: () => Promise<{ define: Record<string, string> }>
    }
  ).config?.()
  expect(result).toEqual({
    define: {},
  })
})

test('devupApi config hook returns empty define when urlMap is undefined', async () => {
  mockCreateUrlMap.mockReturnValue(undefined as never)
  const plugin = devupApi()
  const result = await (
    plugin as unknown as {
      config?: () => Promise<{ define: Record<string, string> }>
    }
  ).config?.()
  expect(result).toEqual({
    define: {},
  })
})

test('devupApi config hook returns empty define when urlMap is empty object', async () => {
  mockCreateUrlMap.mockReturnValue({} as never)
  const plugin = devupApi()
  const result = await (
    plugin as unknown as {
      config?: () => Promise<{ define: Record<string, string> }>
    }
  ).config?.()
  expect(result).toEqual({
    define: {},
  })
})

test.each([
  [undefined, ['openapi.json']],
  [{ tempDir: 'custom-dir' }, ['openapi.json']],
  [{ openapiFiles: 'custom-openapi.json' }, ['custom-openapi.json']],
  [
    {
      tempDir: 'custom-dir',
      openapiFiles: 'custom-openapi.json',
      convertCase: 'pascal' as const,
    },
    ['custom-openapi.json'],
  ],
] as const)('devupApi returns plugin with configResolved hook: %s', async (options:
  | DevupApiOptions
  | undefined, expectedFiles: string[]) => {
  const plugin = devupApi(options)
  expect(plugin.configResolved).toBeDefined()
  expect(typeof plugin.configResolved).toBe('function')

  await (
    plugin as unknown as { configResolved?: () => Promise<void> }
  ).configResolved?.()
  expect(mockCreateTmpDirAsync).toHaveBeenCalledWith(options?.tempDir)
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(expectedFiles)
  expect(mockGenerateInterface).toHaveBeenCalledWith(mockSchema, options)
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'api.d.ts'),
    mockInterfaceContent,
  )
})

test('devupApi plugin has both config and configResolved hooks', () => {
  const plugin = devupApi()
  expect(plugin.config).toBeDefined()
  expect(plugin.configResolved).toBeDefined()
  expect(typeof plugin.config).toBe('function')
  expect(typeof plugin.configResolved).toBe('function')
})

test('devupApi resolveId returns resolved virtual module for @devup-api/zod', () => {
  const plugin = devupApi()
  const resolveId = plugin.resolveId as (id: string) => string | null
  expect(resolveId).toBeDefined()

  const result = resolveId('@devup-api/zod')
  expect(result).toBe('\0@devup-api/zod')
})

test('devupApi resolveId returns null for other modules', () => {
  const plugin = devupApi()
  const resolveId = plugin.resolveId as (id: string) => string | null

  expect(resolveId('other-module')).toBeNull()
  expect(resolveId('@devup-api/fetch')).toBeNull()
  expect(resolveId('zod')).toBeNull()
})

test('devupApi load returns zod schemas code for virtual module', async () => {
  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  const result = await load('\0@devup-api/zod')
  expect(result).toBe(mockZodSchemasContent)
  expect(mockGenerateZodSchemas).toHaveBeenCalled()
})

test('devupApi load returns null for other modules', async () => {
  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  expect(await load('other-module')).toBeNull()
  expect(await load('@devup-api/zod')).toBeNull() // Not the resolved virtual module
})

test('devupApi load caches zod schemas code', async () => {
  // Clear mocks for this specific test
  mockGenerateZodSchemas.mockClear()

  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  // First call
  await load('\0@devup-api/zod')
  expect(mockGenerateZodSchemas).toHaveBeenCalledTimes(1)

  // Second call should use cached value
  await load('\0@devup-api/zod')
  expect(mockGenerateZodSchemas).toHaveBeenCalledTimes(1)
})

test('devupApi configResolved writes zod type declarations', async () => {
  const plugin = devupApi()
  await (
    plugin as unknown as { configResolved?: () => Promise<void> }
  ).configResolved?.()

  expect(mockGenerateZodTypeDeclarations).toHaveBeenCalledWith(
    mockSchema,
    undefined,
  )
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'zod.d.ts'),
    mockZodTypeDeclarationsContent,
  )
})

// =============================================================================
// Virtual UI Module Tests
// =============================================================================

test('devupApi resolveId returns resolved virtual module for @devup-api/ui/crud', () => {
  const plugin = devupApi()
  const resolveId = plugin.resolveId as (id: string) => string | null

  const result = resolveId('@devup-api/ui/crud')
  expect(result).toBe('\0@devup-api/ui/crud')
})

test('devupApi resolveId returns null for partial ui module path', () => {
  const plugin = devupApi()
  const resolveId = plugin.resolveId as (id: string) => string | null

  expect(resolveId('@devup-api/ui')).toBeNull()
  expect(resolveId('@devup-api/ui/other')).toBeNull()
})

test('devupApi load returns crud config code for virtual ui module', async () => {
  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  const result = await load('\0@devup-api/ui/crud')
  expect(result).toBe(mockCrudConfigCodeContent)
  expect(mockGenerateCrudConfigCode).toHaveBeenCalled()
})

test('devupApi load returns null for non-resolved ui module', async () => {
  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  expect(await load('@devup-api/ui/crud')).toBeNull() // Not the resolved virtual module
})

test('devupApi load caches crud config code', async () => {
  // Clear mocks for this specific test
  mockGenerateCrudConfigCode.mockClear()

  const plugin = devupApi()
  const load = plugin.load as (id: string) => Promise<string | null>

  // First call
  await load('\0@devup-api/ui/crud')
  expect(mockGenerateCrudConfigCode).toHaveBeenCalledTimes(1)

  // Second call should use cached value
  await load('\0@devup-api/ui/crud')
  expect(mockGenerateCrudConfigCode).toHaveBeenCalledTimes(1)
})

test('devupApi configResolved writes crud config type declarations', async () => {
  const plugin = devupApi()
  await (
    plugin as unknown as { configResolved?: () => Promise<void> }
  ).configResolved?.()

  expect(mockGenerateCrudConfigTypes).toHaveBeenCalledWith(mockSchema)
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'ui.d.ts'),
    mockCrudConfigTypesContent,
  )
})
