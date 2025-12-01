/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { expect, test } from 'bun:test'
import { DevupApi } from '../api'
import { createApi } from '../create-api'

test.each([
  ['https://api.example.com'],
  ['https://api.example.com/'],
  ['http://localhost:3000'],
  ['http://localhost:3000/'],
] as const)('createApi returns DevupApi instance: %s', (baseUrl) => {
  const api = createApi({ baseUrl })
  expect(api).toBeInstanceOf(DevupApi)
})

test.each([
  ['https://api.example.com', undefined],
  ['https://api.example.com', {}],
  ['https://api.example.com', { headers: { Authorization: 'Bearer token' } }],
] as const)('createApi accepts defaultOptions: %s', (baseUrl, defaultOptions) => {
  const api = createApi({ baseUrl, ...defaultOptions })
  expect(api).toBeInstanceOf(DevupApi)
  if (defaultOptions) {
    expect(api.getDefaultOptions()).toEqual(defaultOptions)
  }
})

test.each([
  ['openapi.json'],
  ['openapi2.json'],
] as const)('createApi accepts serverName: %s', (serverName) => {
  const api = createApi({
    baseUrl: 'https://api.example.com',
    serverName: serverName as any,
  })
  expect(api).toBeInstanceOf(DevupApi)
})

test('createApi uses default serverName when not provided', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  expect(api).toBeInstanceOf(DevupApi)
})

test('createApi uses empty baseUrl when not provided', () => {
  const api = createApi({})
  expect(api).toBeInstanceOf(DevupApi)
  expect(api.getBaseUrl()).toBe('')
})
