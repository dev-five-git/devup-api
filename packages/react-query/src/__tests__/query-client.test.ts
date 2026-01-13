/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { expect, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { DevupQueryClient, getQueryKey } from '../query-client'

test('DevupQueryClient constructor', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test('DevupQueryClient useQuery method exists', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(typeof queryClient.useQuery).toBe('function')
})

test('DevupQueryClient useMutation method exists', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(typeof queryClient.useMutation).toBe('function')
})

test('DevupQueryClient useSuspenseQuery method exists', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(typeof queryClient.useSuspenseQuery).toBe('function')
})

test('DevupQueryClient useInfiniteQuery method exists', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(typeof queryClient.useInfiniteQuery).toBe('function')
})

test('DevupQueryClient useQueries method exists', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  expect(typeof queryClient.useQueries).toBe('function')
})

test('getQueryKey returns correct key without options', () => {
  const result = getQueryKey('get', '/test', undefined)
  expect(result).toEqual(['get', '/test'])
})

test('getQueryKey returns correct key with options', () => {
  const options = { params: { id: '123' } }
  const result = getQueryKey('get', '/test', options)
  expect(result).toEqual(['get', '/test', options])
})

test('getQueryKey handles different methods', () => {
  const methods = ['get', 'post', 'put', 'delete', 'patch'] as const
  for (const method of methods) {
    const result = getQueryKey(method, '/test', undefined)
    expect(result).toEqual([method, '/test'])
  }
})

test('getQueryKey handles different paths', () => {
  const paths = ['/test', '/users', '/users/{id}'] as const
  for (const path of paths) {
    const result = getQueryKey('get', path, undefined)
    expect(result).toEqual(['get', path])
  }
})

test('getQueryKey handles different option types', () => {
  const options1 = { params: { id: '123' } }
  const result1 = getQueryKey('get', '/test', options1)
  expect(result1).toEqual(['get', '/test', options1])

  const options2 = { query: { page: 1 } }
  const result2 = getQueryKey('get', '/test', options2)
  expect(result2).toEqual(['get', '/test', options2])

  const options3 = { params: { id: '123' }, query: { page: 1 } }
  const result3 = getQueryKey('get', '/test', options3)
  expect(result3).toEqual(['get', '/test', options3])
})
