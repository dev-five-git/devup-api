import { beforeEach, expect, test } from 'bun:test'

const urlMap = {
  foo: {
    getUsers: { GET: { url: '/users' } },
    createUser: { POST: { url: '/users' } },
    updateUser: { PUT: { url: '/users/{id}' } },
    deleteUser: { DELETE: { url: '/users/{id}' } },
  },
}

beforeEach(() => {
  // reset the module cache
})
const random = Math.random()

test.each([
  ['getUsers', '/users', 'GET', JSON.stringify(urlMap)],
  ['createUser', '/users', 'POST', JSON.stringify(urlMap)],
  ['updateUser', '/users/{id}', 'PUT', JSON.stringify(urlMap)],
  ['deleteUser', '/users/{id}', 'DELETE', JSON.stringify(urlMap)],
] as const)(
  'getApiEndpointInfo returns url for existing key: %s -> %s',
  async (key, expected, method, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    // Add query parameter to bypass module cache and reload
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', method)?.url).toBe(expected)
  },
)

test.each([
  ['nonExistentKey', 'nonExistentKey', 'GET', JSON.stringify(urlMap)],
  ['unknown', 'unknown', 'GET', JSON.stringify(urlMap)],
  ['', '', 'GET', JSON.stringify(urlMap)],
  ['/users', '/users', 'GET', JSON.stringify(urlMap)],
] as const)(
  'getApiEndpointInfo returns key itself when key does not exist: %s -> %s',
  async (key, expected, method, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', method).url).toBe(expected)
  },
)

test.each([
  ['getUsers', { method: 'GET', url: '/users' }, 'GET', JSON.stringify(urlMap)],
  [
    'createUser',
    { method: 'POST', url: '/users' },
    'POST',
    JSON.stringify(urlMap),
  ],
  [
    'updateUser',
    { method: 'PUT', url: '/users/{id}' },
    'PUT',
    JSON.stringify(urlMap),
  ],
  [
    'deleteUser',
    { method: 'DELETE', url: '/users/{id}' },
    'DELETE',
    JSON.stringify(urlMap),
  ],
] as const)(
  'getApiEndpointInfo returns UrlMapValue for existing key: %s -> %s',
  async (key, expected, method, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', method)).toEqual(expected)
  },
)

test.each([
  [
    'nonExistentKey',
    { method: 'GET', url: 'nonExistentKey' },
    JSON.stringify(urlMap),
  ],
  ['unknown', { method: 'GET', url: 'unknown' }, JSON.stringify(urlMap)],
  ['', { method: 'GET', url: '' }, JSON.stringify(urlMap)],
  ['/users', { method: 'GET', url: '/users' }, JSON.stringify(urlMap)],
] as const)(
  'getApiEndpointInfo returns default for non-existent key: %s -> %s',
  async (key, expected, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map`)
    expect(getApiEndpointInfo(key, '', 'GET')).toEqual(expected)
  },
)

test.each([
  ['anyKey', 'anyKey', '{}'],
  ['test', 'test', '{}'],
] as const)(
  'getApiEndpointInfo works with empty URL map: %s -> %s',
  async (key, expected, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
  },
)

test.each([
  ['anyKey', { method: 'GET', url: 'anyKey' }, '{}'],
  ['test', { method: 'GET', url: 'test' }, '{}'],
] as const)(
  'getApiEndpointInfo works with empty URL map: %s -> %s',
  async (key, expected, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', 'GET')).toEqual(expected)
  },
)

test.each([
  [['GET', 'anyKey'], '{}'],
  [['POST', 'anyKey'], '{}'],
  [['PUT', 'anyKey'], '{}'],
  [['DELETE', 'anyKey'], '{}'],
  [['PATCH', 'anyKey'], '{}'],
] as const)(
  'getApiEndpointInfo works with empty URL map: %s -> %s',
  async (key, envValue) => {
    process.env.DEVUP_API_URL_MAP = envValue
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key[1], 'foo', key[0]).method).toEqual(key[0])
  },
)

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)(
  'getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s',
  async (key, expected) => {
    delete process.env.DEVUP_API_URL_MAP
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
  },
)

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)(
  'getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s',
  async (key, expected) => {
    delete process.env.DEVUP_API_URL_MAP
    const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
    expect(getApiEndpointInfo(key, 'foo', 'GET').url).toBe(expected)
  },
)
