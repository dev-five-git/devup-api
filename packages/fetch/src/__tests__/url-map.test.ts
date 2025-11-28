import { expect, test } from 'bun:test'

const urlMap = {
  getUsers: { method: 'GET' as const, url: '/users' },
  createUser: { method: 'POST' as const, url: '/users' },
  updateUser: { method: 'PUT' as const, url: '/users/{id}' },
  deleteUser: { method: 'DELETE' as const, url: '/users/{id}' },
}

test.each([
  ['getUsers', '/users', JSON.stringify(urlMap)],
  ['createUser', '/users', JSON.stringify(urlMap)],
  ['updateUser', '/users/{id}', JSON.stringify(urlMap)],
  ['deleteUser', '/users/{id}', JSON.stringify(urlMap)],
] as const)('getUrl returns url for existing key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  // Add query parameter to bypass module cache and reload
  const { getUrl } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrl(key)).toBe(expected)
})

test.each([
  ['nonExistentKey', 'nonExistentKey', JSON.stringify(urlMap)],
  ['unknown', 'unknown', JSON.stringify(urlMap)],
  ['', '', JSON.stringify(urlMap)],
  ['/users', '/users', JSON.stringify(urlMap)],
] as const)('getUrl returns key itself when key does not exist: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getUrl } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrl(key)).toBe(expected)
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
] as const)('getUrlWithMethod returns UrlMapValue for existing key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getUrlWithMethod } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrlWithMethod(key)).toEqual(expected)
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
] as const)('getUrlWithMethod returns default for non-existent key: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getUrlWithMethod } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrlWithMethod(key)).toEqual(expected)
})

test.each([
  ['anyKey', 'anyKey', '{}'],
  ['test', 'test', '{}'],
] as const)('getUrl works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getUrl } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrl(key)).toBe(expected)
})

test.each([
  ['anyKey', { method: 'GET', url: 'anyKey' }, '{}'],
  ['test', { method: 'GET', url: 'test' }, '{}'],
] as const)('getUrlWithMethod works with empty URL map: %s -> %s', async (key, expected, envValue) => {
  process.env.DEVUP_API_URL_MAP = envValue
  const { getUrlWithMethod } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrlWithMethod(key)).toEqual(expected)
})

test.each([
  ['anyKey', 'anyKey'],
  ['test', 'test'],
] as const)('getUrl works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getUrl } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrl(key)).toBe(expected)
})

test.each([
  ['anyKey', { method: 'GET', url: 'anyKey' }],
  ['test', { method: 'GET', url: 'test' }],
] as const)('getUrlWithMethod works when DEVUP_API_URL_MAP is not set: %s -> %s', async (key, expected) => {
  delete process.env.DEVUP_API_URL_MAP
  const { getUrlWithMethod } = await import(`../url-map?t=${Date.now()}`)
  expect(getUrlWithMethod(key)).toEqual(expected)
})

test('getUrl handles key that exists but url property is missing', async () => {
  const urlMapWithoutUrl = {
    testKey: { method: 'GET' as const },
  }
  process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithoutUrl)
  const { getUrl } = await import(`../url-map?t=${Date.now() + Math.random()}`)
  // When url property is missing, optional chaining returns undefined, so key is returned
  expect(getUrl('testKey')).toBe('testKey')
})

test('DEVUP_API_URL_MAP constant is exported and accessible', async () => {
  const testUrlMap = { testKey: { method: 'GET' as const, url: '/test' } }
  process.env.DEVUP_API_URL_MAP = JSON.stringify(testUrlMap)
  const urlMapModule = await import(
    `../url-map?t=${Date.now() + Math.random()}`
  )
  expect(urlMapModule).toHaveProperty('DEVUP_API_URL_MAP')
  expect(typeof urlMapModule.DEVUP_API_URL_MAP).toBe('object')
  // Directly access the constant to ensure it's covered
  const urlMap = urlMapModule.DEVUP_API_URL_MAP
  expect(urlMap).toEqual(testUrlMap)
  // Verify it's used by getUrl function
  expect(urlMapModule.getUrl('testKey')).toBe('/test')
})

test('DEVUP_API_URL_MAP uses fallback when env var is undefined', async () => {
  delete process.env.DEVUP_API_URL_MAP
  const urlMapModule = await import(
    `../url-map?t=${Date.now() + Math.random()}`
  )
  // Directly access the constant to ensure the fallback path is covered
  const urlMap = urlMapModule.DEVUP_API_URL_MAP
  expect(urlMap).toEqual({})
  expect(urlMapModule.getUrl('anyKey')).toBe('anyKey')
  expect(urlMapModule.getUrlWithMethod('anyKey')).toEqual({
    method: 'GET',
    url: 'anyKey',
  })
})

test('DEVUP_API_URL_MAP uses fallback when env var is empty string', async () => {
  process.env.DEVUP_API_URL_MAP = ''
  const urlMapModule = await import(
    `../url-map?t=${Date.now() + Math.random()}`
  )
  // Directly access the constant to ensure the fallback path is covered
  const urlMap = urlMapModule.DEVUP_API_URL_MAP
  expect(urlMap).toEqual({})
  expect(urlMapModule.getUrl('anyKey')).toBe('anyKey')
  expect(urlMapModule.getUrlWithMethod('anyKey')).toEqual({
    method: 'GET',
    url: 'anyKey',
  })
})

test('getUrl handles key where DEVUP_API_URL_MAP[key] exists but url is undefined', async () => {
  const urlMapWithUndefinedUrl = {
    testKey: { method: 'GET' as const },
  }
  process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithUndefinedUrl)
  const { getUrl } = await import(`../url-map?t=${Date.now() + Math.random()}`)
  // When url property is missing, optional chaining returns undefined, so key is returned
  expect(getUrl('testKey')).toBe('testKey')
})

test('getUrl handles key where DEVUP_API_URL_MAP[key] exists but url is null', async () => {
  const urlMapWithNullUrl = {
    testKey: { method: 'GET' as const, url: null as unknown as string },
  }
  process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithNullUrl)
  const { getUrl } = await import(`../url-map?t=${Date.now() + Math.random()}`)
  // When url is null, optional chaining returns null, so key is returned
  expect(getUrl('testKey')).toBe('testKey')
})

test('getUrl handles key where DEVUP_API_URL_MAP[key] exists but url is empty string', async () => {
  const urlMapWithEmptyUrl = {
    testKey: { method: 'GET' as const, url: '' },
  }
  process.env.DEVUP_API_URL_MAP = JSON.stringify(urlMapWithEmptyUrl)
  const { getUrl } = await import(`../url-map?t=${Date.now() + Math.random()}`)
  // When url is empty string, it's falsy, so key is returned
  expect(getUrl('testKey')).toBe('testKey')
})
