/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { expect, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { DevupQueryClient } from '../query-client'

const api = createApi({ baseUrl: 'https://api.example.com' })
const queryClient = new DevupQueryClient(api as any)

test('DevupQueryClient constructor', () => {
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test('DevupQueryClient useQuery method exists', () => {
  expect(typeof queryClient.useQuery).toBe('function')
})

test('DevupQueryClient useMutation method exists', () => {
  expect(typeof queryClient.useMutation).toBe('function')
})

test('DevupQueryClient useSuspenseQuery method exists', () => {
  expect(typeof queryClient.useSuspenseQuery).toBe('function')
})

test('DevupQueryClient useInfiniteQuery method exists', () => {
  expect(typeof queryClient.useInfiniteQuery).toBe('function')
})

test('DevupQueryClient useQueries method exists', () => {
  expect(typeof queryClient.useQueries).toBe('function')
})

test('getQueryKey returns correct key without options', () => {
  const result = queryClient.getQueryKey('get' as any, '/test' as any)
  expect(result).toEqual(['get', '/test'])
})

test('getQueryKey returns correct key with options', () => {
  const options = { params: { id: '123' } }
  const result = queryClient.getQueryKey(
    'get' as any,
    '/test' as any,
    options as any,
  )
  expect(result).toEqual(['get', '/test', options])
})

test('getQueryKey handles different methods', () => {
  const methods = ['get', 'post', 'put', 'delete', 'patch'] as const
  for (const method of methods) {
    const result = queryClient.getQueryKey(method as any, '/test' as any)
    expect(result).toEqual([method, '/test'])
  }
})

test('getQueryKey handles different paths', () => {
  const paths = ['/test', '/users', '/users/{id}'] as const
  for (const path of paths) {
    const result = queryClient.getQueryKey('get' as any, path as any)
    expect(result).toEqual(['get', path])
  }
})

test('getQueryKey handles different option types', () => {
  const options1 = { params: { id: '123' } }
  const result1 = queryClient.getQueryKey(
    'get' as any,
    '/test' as any,
    options1 as any,
  )
  expect(result1).toEqual(['get', '/test', options1])

  const options2 = { query: { page: 1 } }
  const result2 = queryClient.getQueryKey(
    'get' as any,
    '/test' as any,
    options2 as any,
  )
  expect(result2).toEqual(['get', '/test', options2])

  const options3 = { params: { id: '123' }, query: { page: 1 } }
  const result3 = queryClient.getQueryKey(
    'get' as any,
    '/test' as any,
    options3 as any,
  )
  expect(result3).toEqual(['get', '/test', options3])
})

test('getQueryKey normalizes method to lowercase', () => {
  const upper = queryClient.getQueryKey('GET' as any, '/test' as any)
  const lower = queryClient.getQueryKey('get' as any, '/test' as any)
  expect(upper).toEqual(lower)
  expect(upper).toEqual(['get', '/test'])
})

test('getQueryKey normalizes method to lowercase with options', () => {
  const options = { params: { id: '123' } }
  const upper = queryClient.getQueryKey(
    'POST' as any,
    '/test' as any,
    options as any,
  )
  const lower = queryClient.getQueryKey(
    'post' as any,
    '/test' as any,
    options as any,
  )
  expect(upper).toEqual(lower)
  expect(upper).toEqual(['post', '/test', options])
})

test('getQueryKey normalizes all HTTP methods', () => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
  for (const method of methods) {
    const result = queryClient.getQueryKey(method as any, '/test' as any)
    expect(result[0]).toBe(method.toLowerCase())
  }
})

test('resolveEndpoint falls back to key itself when no URL map entry', () => {
  const resolved = api.resolveEndpoint('GET' as any, '/users' as any)
  expect(resolved.url).toBe('/users')
  expect(resolved.method).toBe('GET')
})

test('resolveEndpoint returns key as url for unknown operationId', () => {
  const resolved = api.resolveEndpoint('GET' as any, 'unknownOp' as any)
  expect(resolved.url).toBe('unknownOp')
})

test('getQueryKey produces consistent keys for same resolved URL', () => {
  const resolvedUrl = api.resolveEndpoint('GET' as any, '/users' as any).url
  const key1 = queryClient.getQueryKey('GET' as any, resolvedUrl as any)
  const key2 = queryClient.getQueryKey('get' as any, '/users' as any)
  expect(key1).toEqual(key2)
  expect(key1).toEqual(['get', '/users'])
})

test('getQueryKey produces identical keys when resolved URL matches path', () => {
  const key1 = queryClient.getQueryKey(
    'GET' as any,
    '/users' as any,
    { query: { page: 1 } } as any,
  )
  const key2 = queryClient.getQueryKey(
    'get' as any,
    '/users' as any,
    { query: { page: 1 } } as any,
  )
  expect(key1).toEqual(key2)
  expect(key1).toEqual(['get', '/users', { query: { page: 1 } }])
})
