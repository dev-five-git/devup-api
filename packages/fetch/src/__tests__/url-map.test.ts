import { beforeEach, expect, test } from 'bun:test'

const urlMap = {
  foo: {
    getUsers: { method: 'GET' as const, url: '/users' },
    createUser: { method: 'POST' as const, url: '/users' },
    updateUser: { method: 'PUT' as const, url: '/users/{id}' },
    deleteUser: { method: 'DELETE' as const, url: '/users/{id}' },
  },
}

beforeEach(() => {
  // reset the module cache
})
const random = Math.random()

test.each([
  ['getUsers', '/users', JSON.stringify(urlMap)],
  ['createUser', '/users', JSON.stringify(urlMap)],
  ['updateUser', '/users/{id}', JSON.stringify(urlMap)],
  ['deleteUser', '/users/{id}', JSON.stringify(urlMap)],
] as const)('getApiEndpointInfo returns url for existing key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  // Add query parameter to bypass module cache and reload
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo')?.url).toBe(expected)
})

test.each([
  ['nonExistentKey', 'nonExistentKey', JSON.stringify(urlMap)],
  ['unknown', 'unknown', JSON.stringify(urlMap)],
  ['', '', JSON.stringify(urlMap)],
  ['/users', '/users', JSON.stringify(urlMap)],
] as const)('getApiEndpointInfo returns key itself when key does not exist: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo').url).toBe(expected)
})

test.each([
  ['getUsers', { method: 'GET', url: '/users' }, JSON.stringify(urlMap)],
  ['createUser', { method: 'POST', url: '/users' }, JSON.stringify(urlMap)],
  ['updateUser', { method: 'PUT', url: '/users/{id}' }, JSON.stringify(urlMap)],
  [
    'deleteUser',
    { method: 'DELETE', url: '/users/{id}' },
    JSON.stringify(urlMap),
  ],
] as const)('getApiEndpointInfo returns UrlMapValue for existing key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo')).toEqual(expected)
})

test.each([
  [
    'nonExistentKey',
    { method: 'GET', url: 'nonExistentKey' },
    JSON.stringify(urlMap),
  ],
  ['unknown', { method: 'GET', url: 'unknown' }, JSON.stringify(urlMap)],
  ['', { method: 'GET', url: '' }, JSON.stringify(urlMap)],
  ['/users', { method: 'GET', url: '/users' }, JSON.stringify(urlMap)],
] as const)('getApiEndpointInfo returns default for non-existent key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map`)
  expect(getApiEndpointInfo(key, '', 'GET')).toEqual(expected)
})

test.each([
  ['anyKey', 'anyKey', '{}'],
  ['test', 'test', '{}'],
] as const)('getApiEndpointInfo works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
})

test.each([
  ['anyKey', { method: 'GET', url: 'anyKey' }, '{}'],
  ['test', { method: 'GET', url: 'test' }, '{}'],
] as const)('getApiEndpointInfo works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo', 'GET')).toEqual(expected)
})

test.each([
  [['GET', 'anyKey'], '{}'],
  [['POST', 'anyKey'], '{}'],
  [['PUT', 'anyKey'], '{}'],
  [['DELETE', 'anyKey'], '{}'],
  [['PATCH', 'anyKey'], '{}'],
] as const)('getApiEndpointInfo works with empty URL map: %s -> %s', async (key, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key[1], 'foo', key[0]).method).toEqual(key[0])
})

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)('getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
})

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)('getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
})
