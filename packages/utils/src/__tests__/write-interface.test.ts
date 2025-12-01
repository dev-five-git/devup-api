import { beforeEach, expect, spyOn, test } from 'bun:test'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import { writeInterface, writeInterfaceAsync } from '../write-interface'

let mockWriteFileSync: ReturnType<typeof spyOn>
let mockWriteFile: ReturnType<typeof spyOn>

beforeEach(() => {
  mockWriteFileSync = spyOn(fs, 'writeFileSync').mockImplementation(() => {})
  mockWriteFile = spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined)
})

test('writeInterface writes content to file', () => {
  const filePath = 'output.ts'
  const content = 'export interface Test {}'
  writeInterface(filePath, content)
  expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test.each([
  ['output.ts', 'export interface Test {}'],
  ['types/api.ts', 'export interface Api {}'],
  ['src/interfaces/user.ts', 'export interface User {}'],
  ['/absolute/path/output.ts', 'export interface Output {}'],
])('writeInterface writes content to custom path: %s', (filePath, content) => {
  writeInterface(filePath, content)
  expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterface writes empty content', () => {
  const filePath = 'empty.ts'
  const content = ''
  writeInterface(filePath, content)
  expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterface writes multiline content', () => {
  const filePath = 'multiline.ts'
  const content = `export interface Test {
  id: string
  name: string
}`
  writeInterface(filePath, content)
  expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterface writes complex TypeScript interface', () => {
  const filePath = 'complex.ts'
  const content = `export interface Complex {
  id: string
  data: {
    nested: {
      value: number
    }
  }
  items: Array<{
    key: string
    value: unknown
  }>
}`
  writeInterface(filePath, content)
  expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterface throws error when directory does not exist', () => {
  const error = new Error('ENOENT: no such file or directory')
  mockWriteFileSync.mockImplementation(() => {
    throw error
  })
  expect(() => writeInterface('nonexistent/dir/file.ts', 'content')).toThrow()
  expect(mockWriteFileSync).toHaveBeenCalledWith(
    'nonexistent/dir/file.ts',
    'content',
    'utf8',
  )
})

test('writeInterface throws error when permission denied', () => {
  const error = new Error('EACCES: permission denied')
  mockWriteFileSync.mockImplementation(() => {
    throw error
  })
  expect(() => writeInterface('/root/file.ts', 'content')).toThrow()
  expect(mockWriteFileSync).toHaveBeenCalledWith(
    '/root/file.ts',
    'content',
    'utf8',
  )
})

test('writeInterfaceAsync writes content to file', async () => {
  const filePath = 'output.ts'
  const content = 'export interface Test {}'
  await writeInterfaceAsync(filePath, content)
  expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test.each([
  ['output.ts', 'export interface Test {}'],
  ['types/api.ts', 'export interface Api {}'],
  ['src/interfaces/user.ts', 'export interface User {}'],
  ['/absolute/path/output.ts', 'export interface Output {}'],
])('writeInterfaceAsync writes content to custom path: %s', async (filePath, content) => {
  await writeInterfaceAsync(filePath, content)
  expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterfaceAsync writes empty content', async () => {
  const filePath = 'empty.ts'
  const content = ''
  await writeInterfaceAsync(filePath, content)
  expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterfaceAsync writes multiline content', async () => {
  const filePath = 'multiline.ts'
  const content = `export interface Test {
  id: string
  name: string
}`
  await writeInterfaceAsync(filePath, content)
  expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterfaceAsync writes complex TypeScript interface', async () => {
  const filePath = 'complex.ts'
  const content = `export interface Complex {
  id: string
  data: {
    nested: {
      value: number
    }
  }
  items: Array<{
    key: string
    value: unknown
  }>
}`
  await writeInterfaceAsync(filePath, content)
  expect(mockWriteFile).toHaveBeenCalledWith(filePath, content, 'utf8')
})

test('writeInterfaceAsync throws error when directory does not exist', async () => {
  const error = new Error('ENOENT: no such file or directory')
  mockWriteFile.mockRejectedValue(error)
  await expect(
    writeInterfaceAsync('nonexistent/dir/file.ts', 'content'),
  ).rejects.toThrow()
  expect(mockWriteFile).toHaveBeenCalledWith(
    'nonexistent/dir/file.ts',
    'content',
    'utf8',
  )
})

test('writeInterfaceAsync throws error when permission denied', async () => {
  const error = new Error('EACCES: permission denied')
  mockWriteFile.mockRejectedValue(error)
  await expect(
    writeInterfaceAsync('/root/file.ts', 'content'),
  ).rejects.toThrow()
  expect(mockWriteFile).toHaveBeenCalledWith('/root/file.ts', 'content', 'utf8')
})

test('writeInterface overwrites existing file', () => {
  const filePath = 'existing.ts'
  const oldContent = 'export interface Old {}'
  const newContent = 'export interface New {}'
  mockWriteFileSync.mockClear()
  writeInterface(filePath, oldContent)
  writeInterface(filePath, newContent)
  expect(mockWriteFileSync).toHaveBeenCalledTimes(2)
  expect(mockWriteFileSync).toHaveBeenLastCalledWith(
    filePath,
    newContent,
    'utf8',
  )
})

test('writeInterfaceAsync overwrites existing file', async () => {
  const filePath = 'existing.ts'
  const oldContent = 'export interface Old {}'
  const newContent = 'export interface New {}'
  mockWriteFile.mockClear()
  await writeInterfaceAsync(filePath, oldContent)
  await writeInterfaceAsync(filePath, newContent)
  expect(mockWriteFile).toHaveBeenCalledTimes(2)
  expect(mockWriteFile).toHaveBeenLastCalledWith(filePath, newContent, 'utf8')
})
