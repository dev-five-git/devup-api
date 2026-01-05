import { beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { join, resolve } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import * as generator from '@devup-api/generator'
import * as utils from '@devup-api/utils'
import { devupApiRsbuildPlugin } from '../plugin'

let mockCreateTmpDirAsync: ReturnType<typeof spyOn>
let mockReadOpenapiAsync: ReturnType<typeof spyOn>
let mockWriteInterfaceAsync: ReturnType<typeof spyOn>
let mockCreateUrlMap: ReturnType<typeof spyOn>
let mockGenerateInterface: ReturnType<typeof spyOn>
let mockGenerateZodSchemas: ReturnType<typeof spyOn>
let mockGenerateZodTypeDeclarations: ReturnType<typeof spyOn>

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

const createMockBuild = () => {
  const modifyRsbuildConfigMock = mock(
    (modifier: (config: unknown) => unknown) => {
      const config = { source: { define: {} } }
      return modifier(config)
    },
  )
  return {
    modifyRsbuildConfig: modifyRsbuildConfigMock,
  }
}

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
  mockCreateTmpDirAsync.mockClear()
  mockReadOpenapiAsync.mockClear()
  mockWriteInterfaceAsync.mockClear()
  mockCreateUrlMap.mockClear()
  mockGenerateInterface.mockClear()
  mockGenerateZodSchemas.mockClear()
  mockGenerateZodTypeDeclarations.mockClear()
})

test('devupApiRsbuildPlugin returns plugin with correct name', () => {
  const plugin = devupApiRsbuildPlugin()
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
] as const)('devupApiRsbuildPlugin returns plugin with setup hook: %s', async (options:
  | DevupApiOptions
  | undefined, expectedFiles: string[]) => {
  const plugin = devupApiRsbuildPlugin(options)
  expect(plugin.setup).toBeDefined()
  expect(typeof plugin.setup).toBe('function')

  const build = createMockBuild()
  await plugin.setup?.(build as never)

  expect(mockCreateTmpDirAsync).toHaveBeenCalledWith(options?.tempDir)
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(expectedFiles)
  expect(mockGenerateInterface).toHaveBeenCalledWith(mockSchema, options)
  expect(mockGenerateZodSchemas).toHaveBeenCalledWith(mockSchema, options)
  expect(mockGenerateZodTypeDeclarations).toHaveBeenCalledWith(
    mockSchema,
    options,
  )
  // 5 files written: api.d.ts, zod-schemas.js, zod.d.ts, crud-config.js, ui.d.ts
  expect(mockWriteInterfaceAsync).toHaveBeenCalledTimes(5)
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'api.d.ts'),
    mockInterfaceContent,
  )
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'zod-schemas.js'),
    mockZodSchemasContent,
  )
  expect(mockWriteInterfaceAsync).toHaveBeenCalledWith(
    join('df', 'zod.d.ts'),
    mockZodTypeDeclarationsContent,
  )
  expect(mockCreateUrlMap).toHaveBeenCalledWith(mockSchema, options)
  expect(build.modifyRsbuildConfig).toHaveBeenCalled()
})

test('devupApiRsbuildPlugin setup hook modifies config with urlMap and alias', async () => {
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: {
    source?: { define?: Record<string, string> }
  }) => unknown
  const config = { source: { define: {} } }
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {
        'process.env.DEVUP_API_URL_MAP': JSON.stringify(
          JSON.stringify(mockUrlMap),
        ),
      },
    },
  })
})

test('devupApiRsbuildPlugin setup hook handles config without source', async () => {
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: Record<string, unknown>) => unknown
  const config = {}
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {
        'process.env.DEVUP_API_URL_MAP': JSON.stringify(
          JSON.stringify(mockUrlMap),
        ),
      },
    },
  })
})

test('devupApiRsbuildPlugin setup hook handles config without define', async () => {
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: {
    source?: Record<string, unknown>
  }) => unknown
  const config = { source: {} }
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {
        'process.env.DEVUP_API_URL_MAP': JSON.stringify(
          JSON.stringify(mockUrlMap),
        ),
      },
    },
  })
})

test('devupApiRsbuildPlugin setup hook does not add urlMap when urlMap is null', async () => {
  mockCreateUrlMap.mockReturnValueOnce(null as never)
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: {
    source?: { define?: Record<string, string> }
  }) => unknown
  const config = { source: { define: {} } }
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {},
    },
  })
})

test('devupApiRsbuildPlugin setup hook does not add urlMap when urlMap is undefined', async () => {
  mockCreateUrlMap.mockReturnValueOnce(undefined as never)
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: {
    source?: { define?: Record<string, string> }
  }) => unknown
  const config = { source: { define: {} } }
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {},
    },
  })
})

test('devupApiRsbuildPlugin setup hook does not add urlMap when urlMap is empty object', async () => {
  mockCreateUrlMap.mockReturnValueOnce({} as never)
  const plugin = devupApiRsbuildPlugin()
  const build = createMockBuild()
  await plugin.setup?.(build as never)

  const configModifier = (build.modifyRsbuildConfig as ReturnType<typeof mock>)
    .mock.calls[0]?.[0] as (config: {
    source?: { define?: Record<string, string> }
  }) => unknown
  const config = { source: { define: {} } }
  const result = configModifier(config)

  expect(result).toEqual({
    resolve: {
      alias: {
        '@devup-api/zod': resolve('df', 'zod-schemas.js'),
        '@devup-api/ui/crud': resolve('df', 'crud-configs.jsx'),
      },
    },
    source: {
      define: {},
    },
  })
})
