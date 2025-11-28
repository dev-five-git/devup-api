import { beforeEach, expect, spyOn, test } from 'bun:test'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import { createTmpDir, createTmpDirAsync } from '../create-tmp-dir'

let mockExistsSync: ReturnType<typeof spyOn>
let mockMkdirSync: ReturnType<typeof spyOn>
let mockMkdir: ReturnType<typeof spyOn>

beforeEach(() => {
  mockExistsSync = spyOn(fs, 'existsSync').mockReturnValue(false)
  mockMkdirSync = spyOn(fs, 'mkdirSync').mockImplementation(() => {})
  mockMkdir = spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined)
})

test.each([
  ['test-dir-1'],
  ['test-dir-2'],
  ['custom/path/to/dir'],
  ['nested/deep/path'],
] as const)('createTmpDir creates directory when it does not exist: %s', (tempDir) => {
  mockExistsSync.mockReturnValue(false)
  mockMkdirSync.mockClear()
  const result = createTmpDir(tempDir)
  expect(result).toBe(tempDir)
  expect(mockExistsSync).toHaveBeenCalledWith(tempDir)
  expect(mockMkdirSync).toHaveBeenCalledWith(tempDir, { recursive: true })
})

test('createTmpDir uses default value when no argument provided', () => {
  const defaultDir = 'df'
  mockExistsSync.mockReturnValue(false)
  mockMkdirSync.mockClear()
  const result = createTmpDir()
  expect(result).toBe(defaultDir)
  expect(mockExistsSync).toHaveBeenCalledWith(defaultDir)
  expect(mockMkdirSync).toHaveBeenCalledWith(defaultDir, { recursive: true })
})

test('createTmpDir returns path when directory already exists', () => {
  const tempDir = 'existing-dir'
  mockExistsSync.mockReturnValue(true)
  mockMkdirSync.mockClear()
  const result = createTmpDir(tempDir)
  expect(result).toBe(tempDir)
  expect(mockExistsSync).toHaveBeenCalledWith(tempDir)
  expect(mockMkdirSync).not.toHaveBeenCalled()
})

test.each([
  ['async-test-dir-1'],
  ['async-test-dir-2'],
  ['async/custom/path'],
  ['async/nested/deep'],
] as const)('createTmpDirAsync creates directory when it does not exist: %s', async (tempDir) => {
  mockMkdir.mockClear()
  mockMkdir.mockResolvedValue(undefined)
  const result = await createTmpDirAsync(tempDir)
  expect(result).toBe(tempDir)
  expect(mockMkdir).toHaveBeenCalledWith(tempDir, { recursive: true })
})

test('createTmpDirAsync uses default value when no argument provided', async () => {
  const defaultDir = 'df'
  mockMkdir.mockClear()
  mockMkdir.mockResolvedValue(undefined)
  const result = await createTmpDirAsync()
  expect(result).toBe(defaultDir)
  expect(mockMkdir).toHaveBeenCalledWith(defaultDir, { recursive: true })
})

test('createTmpDirAsync handles EEXIST error gracefully', async () => {
  const tempDir = 'async-existing-dir'
  const eexistError = new Error('EEXIST') as NodeJS.ErrnoException
  eexistError.code = 'EEXIST'
  mockMkdir.mockClear()
  mockMkdir.mockRejectedValueOnce(eexistError)
  const result = await createTmpDirAsync(tempDir)
  expect(result).toBe(tempDir)
  expect(mockMkdir).toHaveBeenCalledWith(tempDir, { recursive: true })
})

test('createTmpDir creates nested directories recursively', () => {
  const nestedDir = 'nested/deep/path/to/dir'
  mockExistsSync.mockReturnValue(false)
  mockMkdirSync.mockClear()
  const result = createTmpDir(nestedDir)
  expect(result).toBe(nestedDir)
  expect(mockExistsSync).toHaveBeenCalledWith(nestedDir)
  expect(mockMkdirSync).toHaveBeenCalledWith(nestedDir, { recursive: true })
})

test('createTmpDirAsync creates nested directories recursively', async () => {
  const nestedDir = 'async-nested/deep/path/to/dir'
  mockMkdir.mockClear()
  mockMkdir.mockResolvedValue(undefined)
  const result = await createTmpDirAsync(nestedDir)
  expect(result).toBe(nestedDir)
  expect(mockMkdir).toHaveBeenCalledWith(nestedDir, { recursive: true })
})

test('createTmpDirAsync throws error when error code is not EEXIST', async () => {
  const tempDir = 'error-dir'
  const otherError = new Error('Permission denied') as NodeJS.ErrnoException
  otherError.code = 'EACCES'
  mockMkdir.mockClear()
  mockMkdir.mockRejectedValueOnce(otherError)
  await expect(createTmpDirAsync(tempDir)).rejects.toThrow('Permission denied')
  expect(mockMkdir).toHaveBeenCalledWith(tempDir, { recursive: true })
})
