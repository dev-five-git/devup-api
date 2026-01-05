import { beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { join } from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import * as generator from '@devup-api/generator'
import * as utils from '@devup-api/utils'
import type { Compiler } from 'webpack'
import { devupApiWebpackPlugin } from '../plugin'

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

const createMockCompiler = (): Compiler & {
  _storedCallback?: (params: unknown, cb: (error?: Error) => void) => void
} => {
  const storedCallback: {
    callback?: (params: unknown, cb: (error?: Error) => void) => void
  } = {}
  const tapAsyncMock = mock(
    (
      _name: string,
      callback: (params: unknown, cb: (error?: Error) => void) => void,
    ) => {
      storedCallback.callback = callback
    },
  )
  const hooks = {
    beforeCompile: {
      tapAsync: tapAsyncMock,
    },
  }
  const DefinePlugin = function (
    this: unknown,
    _define: Record<string, string>,
  ) {
    // Constructor
  } as unknown as new (
    define: Record<string, string>,
  ) => { apply: (compiler: Compiler) => void }
  DefinePlugin.prototype.apply = mock(() => {})

  const NormalModuleReplacementPlugin = function (
    this: unknown,
    _pattern: RegExp,
    _newResource: string,
  ) {
    // Constructor
  } as unknown as new (
    pattern: RegExp,
    newResource: string,
  ) => { apply: (compiler: Compiler) => void }
  NormalModuleReplacementPlugin.prototype.apply = mock(() => {})

  const compiler = {
    hooks,
    webpack: {
      DefinePlugin,
      NormalModuleReplacementPlugin,
    },
  } as unknown as Compiler & {
    _storedCallback?: (params: unknown, cb: (error?: Error) => void) => void
  }
  Object.defineProperty(compiler, '_storedCallback', {
    get() {
      return storedCallback.callback
    },
    enumerable: true,
    configurable: true,
  })
  return compiler
}

const mockZodSchemasContent = 'export const schemas = {}'
const mockZodTypeDeclarationsContent = 'declare module "@devup-api/zod" {}'

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

test('devupApiWebpackPlugin constructor initializes with default options', () => {
  const plugin = new devupApiWebpackPlugin()
  expect(plugin.options).toEqual({})
  expect(plugin.initialized).toBe(false)
})

test.each([
  [{ tempDir: 'custom-dir' }],
  [{ openapiFiles: 'custom-openapi.json' }],
  [
    {
      tempDir: 'custom-dir',
      openapiFiles: 'custom-openapi.json',
      convertCase: 'snake' as const,
    },
  ],
] as const)('devupApiWebpackPlugin constructor initializes with options: %s', (options: DevupApiOptions) => {
  const plugin = new devupApiWebpackPlugin(options)
  expect(plugin.options).toEqual(options)
  expect(plugin.initialized).toBe(false)
})

test('devupApiWebpackPlugin apply method registers beforeCompile hook', () => {
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  plugin.apply(compiler)
  expect(compiler.hooks.beforeCompile.tapAsync).toHaveBeenCalledWith(
    'devup-api',
    expect.any(Function),
  )
  expect(compiler._storedCallback).toBeDefined()
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
] as const)('devupApiWebpackPlugin beforeCompile hook executes correctly: %s', async (options:
  | DevupApiOptions
  | undefined, expectedFiles: string[]) => {
  const plugin = new devupApiWebpackPlugin(options)
  const compiler = createMockCompiler()
  const definePluginApplySpy = spyOn(
    compiler.webpack.DefinePlugin.prototype,
    'apply',
  ).mockImplementation(() => {})
  const normalModuleReplacementPluginApplySpy = spyOn(
    compiler.webpack.NormalModuleReplacementPlugin.prototype,
    'apply',
  ).mockImplementation(() => {})
  plugin.apply(compiler)

  const callback = compiler._storedCallback
  expect(callback).toBeDefined()

  const mockCallback = mock(() => {})
  await callback?.(null, mockCallback)

  expect(mockCreateTmpDirAsync).toHaveBeenCalledWith(options?.tempDir)
  expect(mockReadOpenapiAsync).toHaveBeenCalledWith(expectedFiles)
  expect(mockGenerateInterface).toHaveBeenCalledWith(mockSchema, options || {})
  expect(mockGenerateZodSchemas).toHaveBeenCalledWith(mockSchema, options || {})
  expect(mockGenerateZodTypeDeclarations).toHaveBeenCalledWith(
    mockSchema,
    options || {},
  )
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
  // 5 files written: api.d.ts, zod-schemas.js, zod.d.ts, crud-config.js, ui.d.ts
  expect(mockWriteInterfaceAsync).toHaveBeenCalledTimes(5)
  expect(mockCreateUrlMap).toHaveBeenCalledWith(mockSchema, options || {})
  expect(definePluginApplySpy).toHaveBeenCalled()
  expect(normalModuleReplacementPluginApplySpy).toHaveBeenCalled()
  expect(mockCallback).toHaveBeenCalled()
  expect(plugin.initialized).toBe(true)
  definePluginApplySpy.mockRestore()
  normalModuleReplacementPluginApplySpy.mockRestore()
})

test('devupApiWebpackPlugin beforeCompile hook does not add DefinePlugin when urlMap is null', async () => {
  mockCreateUrlMap.mockReturnValueOnce(null as never)
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  const definePluginApplySpy = spyOn(
    compiler.webpack.DefinePlugin.prototype,
    'apply',
  ).mockImplementation(() => {})
  plugin.apply(compiler)

  const callback = compiler._storedCallback

  const mockCallback = mock(() => {})
  await callback?.(null, mockCallback)

  expect(definePluginApplySpy).not.toHaveBeenCalled()
  expect(mockCallback).toHaveBeenCalled()
  definePluginApplySpy.mockRestore()
})

test('devupApiWebpackPlugin beforeCompile hook does not add DefinePlugin when urlMap is undefined', async () => {
  mockCreateUrlMap.mockReturnValueOnce(undefined as never)
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  const definePluginApplySpy = spyOn(
    compiler.webpack.DefinePlugin.prototype,
    'apply',
  ).mockImplementation(() => {})
  plugin.apply(compiler)

  const callback = compiler._storedCallback

  const mockCallback = mock(() => {})
  await callback?.(null, mockCallback)

  expect(definePluginApplySpy).not.toHaveBeenCalled()
  expect(mockCallback).toHaveBeenCalled()
  definePluginApplySpy.mockRestore()
})

test('devupApiWebpackPlugin beforeCompile hook does not add DefinePlugin when urlMap is empty object', async () => {
  mockCreateUrlMap.mockReturnValueOnce({} as never)
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  const definePluginApplySpy = spyOn(
    compiler.webpack.DefinePlugin.prototype,
    'apply',
  ).mockImplementation(() => {})
  plugin.apply(compiler)

  const callback = compiler._storedCallback

  const mockCallback = mock(() => {})
  await callback?.(null, mockCallback)

  expect(definePluginApplySpy).not.toHaveBeenCalled()
  expect(mockCallback).toHaveBeenCalled()
  definePluginApplySpy.mockRestore()
})

test('devupApiWebpackPlugin beforeCompile hook only runs once when called multiple times', async () => {
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  plugin.apply(compiler)

  const callback = compiler._storedCallback

  const mockCallback1 = mock(() => {})
  const mockCallback2 = mock(() => {})

  await Promise.all([
    callback?.(null, mockCallback1),
    callback?.(null, mockCallback2),
  ])

  expect(mockCreateTmpDirAsync).toHaveBeenCalledTimes(1)
  expect(mockReadOpenapiAsync).toHaveBeenCalledTimes(1)
  expect(mockGenerateInterface).toHaveBeenCalledTimes(1)
  expect(mockGenerateZodSchemas).toHaveBeenCalledTimes(1)
  expect(mockGenerateZodTypeDeclarations).toHaveBeenCalledTimes(1)
  // 5 files written: api.d.ts, zod-schemas.js, zod.d.ts, crud-config.js, ui.d.ts
  expect(mockWriteInterfaceAsync).toHaveBeenCalledTimes(5)
  expect(mockCreateUrlMap).toHaveBeenCalledTimes(1)
  expect(mockCallback1).toHaveBeenCalled()
  expect(mockCallback2).toHaveBeenCalled()
})

test('devupApiWebpackPlugin beforeCompile hook handles errors correctly', async () => {
  const error = new Error('Test error')
  mockCreateTmpDirAsync.mockRejectedValueOnce(error)
  const plugin = new devupApiWebpackPlugin()
  const compiler = createMockCompiler()
  plugin.apply(compiler)

  const callback = compiler._storedCallback

  const mockCallback = mock(() => {})
  await callback?.(null, mockCallback)

  expect(mockCallback).toHaveBeenCalledWith(error)
  expect(plugin.initialized).toBe(false)
})
