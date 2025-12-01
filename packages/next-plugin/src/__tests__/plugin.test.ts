import { beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import * as generator from '@devup-api/generator'
import * as utils from '@devup-api/utils'
import { devupApiWebpackPlugin } from '@devup-api/webpack-plugin'
import type { NextConfig } from 'next'
import { devupApi } from '../plugin'

let mockCreateTmpDir: ReturnType<typeof spyOn>
let mockReadOpenapis: ReturnType<typeof spyOn>
let mockWriteInterface: ReturnType<typeof spyOn>
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
  mockCreateTmpDir = spyOn(utils, 'createTmpDir').mockReturnValue('df')
  mockReadOpenapis = spyOn(utils, 'readOpenapis').mockReturnValue({
    'openapi.json': mockSchema,
  } as never)
  mockWriteInterface = spyOn(utils, 'writeInterface').mockImplementation(
    () => {},
  )
  mockCreateTmpDirAsync = spyOn(utils, 'createTmpDirAsync').mockResolvedValue(
    'df',
  )
  mockReadOpenapiAsync = spyOn(utils, 'readOpenapiAsync').mockResolvedValue({
    'openapi.json': mockSchema,
  } as never)
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
  mockCreateTmpDir.mockClear()
  mockReadOpenapis.mockClear()
  mockWriteInterface.mockClear()
  mockCreateTmpDirAsync.mockClear()
  mockReadOpenapiAsync.mockClear()
  mockWriteInterfaceAsync.mockClear()
  mockCreateUrlMap.mockClear()
  mockGenerateInterface.mockClear()
})

test.each([
  [{}, undefined, ['openapi.json']],
  [{ env: {} }, undefined, ['openapi.json']],
  [{}, { tempDir: 'custom-dir' }, ['openapi.json']],
  [
    { env: {} },
    { openapiFiles: 'custom-openapi.json' },
    ['custom-openapi.json'],
  ],
] as const)('devupApi handles turbo mode: config=%s, options=%s', (config: NextConfig, options:
  | DevupApiOptions
  | undefined, expectedFiles: string[]) => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = '1'

  try {
    const result = devupApi(config, options)

    expect(mockCreateTmpDir).toHaveBeenCalledWith(options?.tempDir)
    expect(mockReadOpenapis).toHaveBeenCalledWith(expectedFiles)
    expect(mockGenerateInterface).toHaveBeenCalledWith(
      { 'openapi.json': mockSchema },
      options || {},
    )
    expect(mockWriteInterface).toHaveBeenCalledWith(
      join('df', 'api.d.ts'),
      mockInterfaceContent,
    )
    expect(mockCreateUrlMap).toHaveBeenCalledWith(
      { 'openapi.json': mockSchema },
      options || {},
    )
    expect(result.env).toEqual({
      DEVUP_API_URL_MAP: JSON.stringify(mockUrlMap),
    })
    expect(result).toBe(config)
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles turbo mode with existing env', () => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = '1'

  try {
    const config: NextConfig = {
      env: {
        EXISTING_VAR: 'value',
      },
    }
    const result = devupApi(config)

    expect(result.env).toEqual({
      EXISTING_VAR: 'value',
      DEVUP_API_URL_MAP: JSON.stringify(mockUrlMap),
    })
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles turbo mode with TURBOPACK=auto', () => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = 'auto'

  try {
    const config: NextConfig = {}
    const result = devupApi(config)

    expect(mockCreateTmpDir).toHaveBeenCalled()
    expect(result.env).toEqual({
      DEVUP_API_URL_MAP: JSON.stringify(mockUrlMap),
    })
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test.each([
  [{}, undefined],
  [{ webpack: undefined }, undefined],
  [{}, { tempDir: 'custom-dir' }],
  [{ webpack: undefined }, { openapiFile: 'custom-openapi.json' }],
] as const)('devupApi handles webpack mode: config=%s, options=%s', (config: NextConfig, options:
  | DevupApiOptions
  | undefined) => {
  const originalEnv = process.env.TURBOPACK
  delete process.env.TURBOPACK

  try {
    const result = devupApi(config, options)

    expect(result.webpack).toBeDefined()
    expect(typeof result.webpack).toBe('function')
    expect(result).toBe(config)
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles webpack mode with existing webpack function', () => {
  const originalEnv = process.env.TURBOPACK
  delete process.env.TURBOPACK

  try {
    const existingWebpack = mock(() => ({}))
    const config: NextConfig = {
      webpack: existingWebpack as never,
    }
    const result = devupApi(config)

    expect(result.webpack).toBeDefined()
    expect(typeof result.webpack).toBe('function')
    expect(result.webpack).not.toBe(existingWebpack)
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi webpack function adds plugin to config', () => {
  const originalEnv = process.env.TURBOPACK
  delete process.env.TURBOPACK

  try {
    const config: NextConfig = {}
    const result = devupApi(config)

    const webpackConfig = {
      plugins: [],
    }
    const webpackOptions = {}
    const webpackResult = result.webpack?.(
      webpackConfig as never,
      webpackOptions as never,
    )

    expect(webpackConfig.plugins).toHaveLength(1)
    expect(webpackConfig.plugins[0]).toBeInstanceOf(devupApiWebpackPlugin)
    expect(webpackResult).toBe(webpackConfig)
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi webpack function calls existing webpack function', () => {
  const originalEnv = process.env.TURBOPACK
  delete process.env.TURBOPACK

  try {
    const existingWebpack = mock(() => ({ modified: true }))
    const config: NextConfig = {
      webpack: existingWebpack as never,
    }
    const result = devupApi(config)

    const webpackConfig = {
      plugins: [],
    }
    const webpackOptions = {}
    const webpackResult = result.webpack?.(
      webpackConfig as never,
      webpackOptions as never,
    )

    expect(existingWebpack).toHaveBeenCalledWith(webpackConfig, webpackOptions)
    expect(webpackResult).toEqual({ modified: true })
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles null urlMap in turbo mode', () => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = '1'
  mockCreateUrlMap.mockReturnValueOnce(null as never)

  try {
    const config: NextConfig = {}
    const result = devupApi(config)

    // null urlMap should not add DEVUP_API_URL_MAP (same as undefined/empty)
    expect(result.env).toEqual({})
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles undefined urlMap in turbo mode', () => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = '1'
  mockCreateUrlMap.mockReturnValueOnce(undefined as never)

  try {
    const config: NextConfig = {}
    const result = devupApi(config)

    // undefined urlMap should not add DEVUP_API_URL_MAP (same as null/empty)
    expect(result.env).toEqual({})
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})

test('devupApi handles empty urlMap object in turbo mode', () => {
  const originalEnv = process.env.TURBOPACK
  process.env.TURBOPACK = '1'
  mockCreateUrlMap.mockReturnValueOnce({} as never)

  try {
    const config: NextConfig = {}
    const result = devupApi(config)

    // Empty object should not add DEVUP_API_URL_MAP
    expect(result.env).toEqual({})
  } finally {
    process.env.TURBOPACK = originalEnv
  }
})
