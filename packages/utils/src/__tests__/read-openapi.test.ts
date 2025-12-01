/** biome-ignore-all lint/suspicious/noExplicitAny: test */
import { beforeEach, expect, spyOn, test } from 'bun:test'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import type { OpenAPIV3_1 } from 'openapi-types'
import { readOpenapi, readOpenapiAsync } from '../read-openapi'

let mockReadFileSync: ReturnType<typeof spyOn>
let mockReadFile: ReturnType<typeof spyOn>

const mockOpenApiDoc: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  paths: {},
}

beforeEach(() => {
  mockReadFileSync = spyOn(fs, 'readFileSync').mockReturnValue(
    JSON.stringify(mockOpenApiDoc),
  )
  mockReadFile = spyOn(fsPromises, 'readFile').mockResolvedValue(
    JSON.stringify(mockOpenApiDoc),
  )
})

test('readOpenapi reads and parses OpenAPI file', () => {
  const filePath = 'openapi.json'
  const result = readOpenapi(filePath)
  expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test('readOpenapi uses default file path when no argument provided', () => {
  const defaultPath = 'openapi.json'
  const result = readOpenapi()
  expect(mockReadFileSync).toHaveBeenCalledWith(defaultPath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test.each([
  ['api/openapi.json'],
  ['./openapi.json'],
  ['/absolute/path/openapi.json'],
  ['src/schemas/api.json'],
])('readOpenapi reads file from custom path: %s', (filePath) => {
  const result = readOpenapi(filePath)
  expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test('readOpenapi parses valid JSON content', () => {
  const customDoc: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: {
      title: 'Custom API',
      version: '2.0.0',
      description: 'Test description',
    },
    paths: {
      '/users': {
        get: {
          responses: {
            '200': {
              description: 'Success',
            },
          },
        },
      },
    },
  }
  mockReadFileSync.mockReturnValue(JSON.stringify(customDoc))
  const result = readOpenapi('custom.json')
  expect(result).toEqual(customDoc)
})

test('readOpenapi throws error when file does not exist', () => {
  const error = new Error('ENOENT: no such file or directory')
  mockReadFileSync.mockImplementation(() => {
    throw error
  })
  expect(() => readOpenapi('nonexistent.json')).toThrow()
  expect(mockReadFileSync).toHaveBeenCalledWith('nonexistent.json', 'utf8')
})

test('readOpenapi throws error when JSON is invalid', () => {
  mockReadFileSync.mockReturnValue('invalid json content')
  expect(() => readOpenapi('invalid.json')).toThrow()
  expect(mockReadFileSync).toHaveBeenCalledWith('invalid.json', 'utf8')
})

test('readOpenapiAsync reads and parses OpenAPI file', async () => {
  const filePath = 'openapi.json'
  const result = await readOpenapiAsync(filePath)
  expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test('readOpenapiAsync uses default file path when no argument provided', async () => {
  const defaultPath = 'openapi.json'
  const result = await readOpenapiAsync()
  expect(mockReadFile).toHaveBeenCalledWith(defaultPath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test.each([
  ['api/openapi.json'],
  ['./openapi.json'],
  ['/absolute/path/openapi.json'],
  ['src/schemas/api.json'],
])('readOpenapiAsync reads file from custom path: %s', async (filePath) => {
  const result = await readOpenapiAsync(filePath)
  expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf8')
  expect(result).toEqual(mockOpenApiDoc)
})

test('readOpenapiAsync parses valid JSON content', async () => {
  const customDoc: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: {
      title: 'Custom API',
      version: '2.0.0',
      description: 'Test description',
    },
    paths: {
      '/users': {
        get: {
          responses: {
            '200': {
              description: 'Success',
            },
          },
        },
      },
    },
  }
  mockReadFile.mockResolvedValue(JSON.stringify(customDoc))
  const result = await readOpenapiAsync('custom.json')
  expect(result).toEqual(customDoc)
})

test('readOpenapiAsync throws error when file does not exist', async () => {
  const error = new Error('ENOENT: no such file or directory')
  mockReadFile.mockRejectedValue(error)
  await expect(readOpenapiAsync('nonexistent.json')).rejects.toThrow()
  expect(mockReadFile).toHaveBeenCalledWith('nonexistent.json', 'utf8')
})

test('readOpenapiAsync throws error when JSON is invalid', async () => {
  mockReadFile.mockResolvedValue('invalid json content')
  await expect(readOpenapiAsync('invalid.json')).rejects.toThrow()
  expect(mockReadFile).toHaveBeenCalledWith('invalid.json', 'utf8')
})

test('readOpenapi handles empty JSON object', () => {
  const emptyDoc: any = {}
  mockReadFileSync.mockReturnValue(JSON.stringify(emptyDoc))
  const result = readOpenapi('empty.json')
  expect(result).toEqual(emptyDoc)
})

test('readOpenapiAsync handles empty JSON object', async () => {
  const emptyDoc: any = {}
  mockReadFile.mockResolvedValue(JSON.stringify(emptyDoc))
  const result = await readOpenapiAsync('empty.json')
  expect(result).toEqual(emptyDoc)
})
