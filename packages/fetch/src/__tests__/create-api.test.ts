import { expect, test } from 'bun:test'
import { DevupApi } from '../api'
import { createApi } from '../create-api'

test.each([
  ['https://api.example.com'],
  ['https://api.example.com/'],
  ['http://localhost:3000'],
  ['http://localhost:3000/'],
] as const)('createApi returns DevupApi instance: %s', (baseUrl) => {
  const api = createApi(baseUrl)
  expect(api).toBeInstanceOf(DevupApi)
})

test.each([
  ['https://api.example.com', undefined],
  ['https://api.example.com', {}],
  ['https://api.example.com', { headers: { Authorization: 'Bearer token' } }],
] as const)('createApi accepts defaultOptions: %s', (baseUrl, defaultOptions) => {
  const api = createApi(baseUrl, defaultOptions)
  expect(api).toBeInstanceOf(DevupApi)
  if (defaultOptions) {
    expect(api.getDefaultOptions()).toEqual(defaultOptions)
  }
})
