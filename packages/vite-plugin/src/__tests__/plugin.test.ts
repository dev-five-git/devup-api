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
})

test('devupApi returns plugin with correct name', () => {
  const plugin = devupApi()
  expect(plugin.name).toBe('devup-api')
})

test.each([
  [undefined],
  [{ tempDir: 'custom-dir' }],
  [{ openapiFile: 'custom-openapi.json' }],
  [
    {
      tempDir: 'custom-dir',
      openapiFile: 'custom-openapi.json',
      convertCase: 'snake' as const,
    },
  ],
] as const)('devupApi returns plugin with config hook: %s', async (options:
  | DevupApiOptions
  | undefined) => {
  const plugin = devupApi(options)
  expect(plugin.config).toBeDefined()
  expect(typeof plugin.config).toBe('function')

  const result = await plugin.config?.()
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(options?.openapiFile)
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
  const result = await plugin.config?.()
  expect(result).toEqual({
    define: {},
  })
})

test('devupApi config hook returns empty define when urlMap is undefined', async () => {
  mockCreateUrlMap.mockReturnValue(undefined as never)
  const plugin = devupApi()
  const result = await plugin.config?.()
  expect(result).toEqual({
    define: {},
  })
})

test.each([
  [undefined],
  [{ tempDir: 'custom-dir' }],
  [{ openapiFile: 'custom-openapi.json' }],
  [
    {
      tempDir: 'custom-dir',
      openapiFile: 'custom-openapi.json',
      convertCase: 'pascal' as const,
    },
  ],
] as const)('devupApi returns plugin with configResolved hook: %s', async (options:
  | DevupApiOptions
  | undefined) => {
  const plugin = devupApi(options)
  expect(plugin.configResolved).toBeDefined()
  expect(typeof plugin.configResolved).toBe('function')

  await plugin.configResolved?.()
  expect(mockCreateTmpDirAsync).toHaveBeenCalledWith(options?.tempDir)
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(options?.openapiFile)
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
