/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { expect, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { createQueryClient } from '../create-query-client'
import { DevupQueryClient } from '../query-client'

test.each([
  ['https://api.example.com'],
  ['https://api.example.com/'],
  ['http://localhost:3000'],
  ['http://localhost:3000/'],
] as const)('createQueryClient returns DevupQueryClient instance: %s', (baseUrl) => {
  const api = createApi({ baseUrl })
  const queryClient = createQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test.each([
  ['https://api.example.com', undefined],
  ['https://api.example.com', {}],
  ['https://api.example.com', { headers: { Authorization: 'Bearer token' } }],
] as const)('createQueryClient accepts api with defaultOptions: %s', (baseUrl, defaultOptions) => {
  const api = createApi({ baseUrl, ...defaultOptions })
  const queryClient = createQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test.each([
  ['openapi.json'],
  ['openapi2.json'],
] as const)('createQueryClient accepts api with serverName: %s', (serverName) => {
  const api = createApi({
    baseUrl: 'https://api.example.com',
    serverName: serverName as any,
  })
  const queryClient = createQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test('createQueryClient uses default serverName when not provided', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})

test('createQueryClient uses empty baseUrl when not provided', () => {
  const api = createApi({})
  const queryClient = createQueryClient(api)
  expect(queryClient).toBeInstanceOf(DevupQueryClient)
})
