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
  expect(getApiEndpointInfo(key, '')).toEqual(expected)
})

test.each([
  ['anyKey', 'anyKey', '{}'],
  ['test', 'test', '{}'],
] as const)('getApiEndpointInfo works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo').url).toBe(expected)
})

test.each([
  ['anyKey', { method: 'GET', url: 'anyKey' }, '{}'],
  ['test', { method: 'GET', url: 'test' }, '{}'],
] as const)('getApiEndpointInfo works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo')).toEqual(expected)
})

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)('getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo').url).toBe(expected)
})

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)('getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getApiEndpointInfo } = await import(`../url-map?t=${random}`)
  expect(getApiEndpointInfo(key, 'foo').url).toBe(expected)
})

// test.each([
//   ['anyKey', { method: 'GET', url: 'anyKey' }],
//   ['test', { method: 'GET', url: 'test' }],
// ] as const)('getApiEndpointInfo works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
//   delete process.env.DEVUP_API_URL_MAP
//   const { getApiEndpointInfo } = await import(`../url-map?t=1`)
//   expect(getApiEndpointInfo(key, 'foo')).toEqual(expected)
// })

// test('getApiEndpointInfo handles key that exists but url property is missing', async () => {
//   const urlMapWithoutUrl = {
//     testKey: { method: 'GET' as const },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithoutUrl)
//   const { getApiEndpointInfo } = await import(
//     `../url-map`
//   )
//   // When url property is missing, optional chaining returns undefined, so key is returned
//   expect(getApiEndpointInfo('testKey', 'foo').url).toBe('testKey')
// })

// test('DEVUP_API_URL_MAP constant is exported and accessible', async () => {
//   const testUrlMap = {
//     '': { testKey: { method: 'GET' as const, url: '/test' } },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(testUrlMap)
//   const urlMapModule = await import(
//     `../url-map`
//   )
//   expect(urlMapModule).toHaveProperty('DEVUP_API_URL_MAP')
//   expect(typeof urlMapModule.DEVUP_API_URL_MAP).toBe('object')
//   // Directly access the constant to ensure it's covered
//   const urlMap = urlMapModule.DEVUP_API_URL_MAP
//   expect(urlMap).toEqual(testUrlMap)
//   // Verify it's used by getApiEndpointInfo function
//   expect(urlMapModule.getApiEndpointInfo('testKey', 'foo').url).toBe('/test')
// })

// test('DEVUP_API_URL_MAP uses fallback when env var is undefined', async () => {
//   delete process.env.DEVUP_API_URL_MAP
//   const urlMapModule = await import(
//     `../url-map`
//   )
//   // Directly access the constant to ensure the fallback path is covered
//   const urlMap = urlMapModule.DEVUP_API_URL_MAP
//   expect(urlMap).toEqual({})
//   expect(urlMapModule.getApiEndpointInfo('anyKey', 'foo').url).toBe('anyKey')
//   // Explicitly call getApiEndpointInfo to ensure it's covered
//   const result = urlMapModule.getApiEndpointInfo('anyKey', 'foo')
//   expect(result).toEqual({
//     method: 'GET',
//     url: 'anyKey',
//   })
//   // Also test that the function exists and is callable
//   expect(typeof urlMapModule.getApiEndpointInfo).toBe('function')
// })

// test('DEVUP_API_URL_MAP uses fallback when env var is empty string', async () => {
//   process.env.DEVUP_API_URL_MAP = ''
//   const urlMapModule = await import(
//     `../url-map`
//   )
//   // Directly access the constant to ensure the fallback path is covered
//   const urlMap = urlMapModule.DEVUP_API_URL_MAP
//   expect(urlMap).toEqual({})
//   expect(urlMapModule.getApiEndpointInfo('anyKey', 'foo').url).toBe('anyKey')
//   expect(urlMapModule.getApiEndpointInfo('anyKey', 'foo')).toEqual({
//     method: 'GET',
//     url: 'anyKey',
//   })
// })

// test('getApiEndpointInfo handles key where DEVUP_API_URL_MAP[key] exists but url is undefined', async () => {
//   const urlMapWithUndefinedUrl = {
//     testKey: { method: 'GET' as const },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithUndefinedUrl)
//   const { getApiEndpointInfo } = await import(
//     `../url-map`
//   )
//   // When url property is missing, optional chaining returns undefined, so key is returned
//   expect(getApiEndpointInfo('testKey', 'foo').url).toBe('testKey')
// })

// test('getApiEndpointInfo handles key where DEVUP_API_URL_MAP[key] exists but url is null', async () => {
//   const urlMapWithNullUrl = {
//     testKey: { method: 'GET' as const, url: null as unknown as string },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithNullUrl)
//   const { getApiEndpointInfo } = await import(
//     `../url-map`
//   )
//   // When url is null, optional chaining returns null, so key is returned
//   expect(getApiEndpointInfo('testKey', 'foo').url).toBe('testKey')
// })

// test('getApiEndpointInfo handles key where DEVUP_API_URL_MAP[key] exists but url is empty string', async () => {
//   const urlMapWithEmptyUrl = {
//     testKey: { method: 'GET' as const, url: '' },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithEmptyUrl)
//   const { getApiEndpointInfo } = await import(
//     `../url-map`
//   )
//   // When url is empty string, it's falsy, so key is returned
//   expect(getApiEndpointInfo('testKey', 'foo').url).toBe('testKey')
// })

// test('getApiEndpointInfo returns default when key does not exist in map (explicit coverage for line 10)', async () => {
//   const urlMap = { existingKey: { method: 'POST' as const, url: '/existing' } }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMap)
//   const { getApiEndpointInfo } = await import(
//     `../url-map`
//   )
//   // Explicitly test the if(!result) branch to ensure line 10 is covered
//   const result = getApiEndpointInfo('nonExistentKeyInMap', 'foo')
//   expect(result).toEqual({ method: 'GET', url: 'nonExistentKeyInMap' })
//   expect(result.method).toBe('GET')
//   expect(result.url).toBe('nonExistentKeyInMap')
// })

// test('getApiEndpointInfo returns result when key exists with url (explicit coverage for lines 12-13)', async () => {
//   const urlMap = {
//     '': {
//       testKey: { method: 'PUT' as const, url: '/test/url' },
//     },
//   }
//   process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMap)
//   const { getApiEndpointInfo } = await import(
//     `../url-map?t=${Date.now()+Math.random()}`
//   )
//   // Explicitly test the result.url ||= key and return result path (lines 12-13)
//   const result = getApiEndpointInfo('testKey', 'foo')
//   expect(result).toEqual({ method: 'PUT', url: '/test/url' })
//   expect(result.method).toBe('PUT')
//   expect(result.url).toBe('/test/url')
//   // Verify that url was not changed (since it already exists)
//   expect(result.url).not.toBe('testKey')
// })
