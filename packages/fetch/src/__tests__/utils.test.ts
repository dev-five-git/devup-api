import { describe, expect, test } from 'bun:test'
import {
  getApiEndpoint,
  getQueryString,
  isPlainObject,
  objectToFormData,
  objectToURLSearchParams,
} from '../utils'

test.each([
  [{}, true],
  [{ a: 1 }, true],
  [{ a: 1, b: 'test' }, true],
  [{ nested: { value: 1 } }, true],
])('returns true for plain objects: %s', (obj, expected) => {
  expect(isPlainObject(obj)).toBe(expected)
})

test.each([
  [null, false],
  [undefined, false],
  [[], false],
  [[1, 2, 3], false],
  [new Date(), false],
  [/test/, false],
  [new Map(), false],
  [new Set(), false],
  ['string', false],
  [123, false],
  [true, false],
  [false, false],
  [() => {}, false],
  [function test() {}, false],
])('returns false for non-plain objects: %s', (obj, expected) => {
  expect(isPlainObject(obj)).toBe(expected)
})

test.each([
  [Object.create(null), false, 'Object.create(null)'],
  [Object.create(Object.prototype), true, 'Object.create(Object.prototype)'],
])('handles special object creation: %s', (obj, expected) => {
  expect(isPlainObject(obj)).toBe(expected)
})

test.each([
  [
    (() => {
      class TestClass {
        value = 1
      }
      return new TestClass()
    })(),
    false,
    'class instance',
  ],
  [
    (() => {
      const proto = { customProp: 'value' }
      return Object.create(proto)
    })(),
    false,
    'object with custom prototype',
  ],
])('returns false for non-plain objects: %s', (obj, expected) => {
  expect(isPlainObject(obj)).toBe(expected)
})

test.each([
  [
    'https://api.example.com',
    '/users',
    undefined,
    'https://api.example.com/users',
  ],
  ['https://api.example.com', '/users', {}, 'https://api.example.com/users'],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '123' },
    'https://api.example.com/users/123',
  ],
  [
    'https://api.example.com',
    '/users/{userId}/posts/{postId}',
    { userId: '123', postId: '456' },
    'https://api.example.com/users/123/posts/456',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '123', name: 'test' },
    'https://api.example.com/users/123',
  ],
  [
    'https://api.example.com',
    '/users',
    { id: '123' },
    'https://api.example.com/users',
  ],
  [
    'http://localhost:3000',
    '/api/v1/users/{id}',
    { id: '999' },
    'http://localhost:3000/api/v1/users/999',
  ],
  [
    'https://api.example.com',
    '/users/{id}/profile',
    { id: '123' },
    'https://api.example.com/users/123/profile',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '../members' },
    'https://api.example.com/users/..%2Fmembers',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: 'a/b' },
    'https://api.example.com/users/a%2Fb',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: 'x?y=1' },
    'https://api.example.com/users/x%3Fy%3D1',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: 'x#y' },
    'https://api.example.com/users/x%23y',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '%' },
    'https://api.example.com/users/%25',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: 'a b' },
    'https://api.example.com/users/a%20b',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '공지' },
    'https://api.example.com/users/%EA%B3%B5%EC%A7%80',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '$&' },
    'https://api.example.com/users/%24%26',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '$`' },
    'https://api.example.com/users/%24%60',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: 123 },
    'https://api.example.com/users/123',
  ],
  [
    'https://api.example.com',
    '/users/{id}/friends/{id}',
    { id: 'a/b' },
    'https://api.example.com/users/a%2Fb/friends/a%2Fb',
  ],
  [
    'https://api.example.com',
    '/users/{id}',
    { id: '' },
    'https://api.example.com/users/',
  ],
  [
    'https://api.example.com',
    '/users',
    { id: '..' },
    'https://api.example.com/users',
  ],
])(
  'getApiEndpoint: baseUrl=%s, path=%s, params=%s -> %s',
  (baseUrl, path, params, expected) => {
    expect(getApiEndpoint(baseUrl, path, params)).toBe(expected)
  },
)

test.each(['.', '..'])('getApiEndpoint rejects path param %s', (id) => {
  expect(() =>
    getApiEndpoint('https://api.example.com', '/users/{id}', { id }),
  ).toThrow(
    `Path parameter "id" cannot be "${id}": it would change the request path`,
  )
})

test.each([
  ['a=1&b=2', 'a=1&b=2'],
  ['', ''],
  ['key=value&test=123', 'key=value&test=123'],
  ['x=1&y=2&z=3', 'x=1&y=2&z=3'],
  [{ a: '1', b: '2' }, 'a=1&b=2'],
  [{}, ''],
  [{ key: 'value', test: '123' }, 'key=value&test=123'],
  [{ x: '1', y: '2', z: '3' }, 'x=1&y=2&z=3'],
  [{ a: 1, b: 2 }, 'a=1&b=2'],
  [{ a: '1', b: 2, c: 'test' }, 'a=1&b=2&c=test'],
  [{ a: ['1', '2', '3'] }, 'a=1&a=2&a=3'],
  [{ a: [1, 2, 3] }, 'a=1&a=2&a=3'],
  [{ a: [1, '2', 3] }, 'a=1&a=2&a=3'],
  [new URLSearchParams('a=1&b=2'), 'a=1&b=2'],
  [new URLSearchParams(''), ''],
  [new URLSearchParams('key=value&test=123'), 'key=value&test=123'],
  [
    [
      ['a', '1'],
      ['b', '2'],
    ] as [string, string][],
    'a=1&b=2',
  ],
  [
    [
      ['key', 'value'],
      ['test', '123'],
    ] as [string, string][],
    'key=value&test=123',
  ],
  [
    [
      ['x', '1'],
      ['y', '2'],
      ['z', '3'],
    ] as [string, string][],
    'x=1&y=2&z=3',
  ],
  [
    [
      ['x', '1'],
      ['x', '2'],
      ['x', '3'],
    ] as [string, string][],
    'x=1&x=2&x=3',
  ],
])('getQueryString: %s query -> "%s"', (query, expected) => {
  const result = getQueryString(
    query as NonNullable<Parameters<typeof getQueryString>[0]>,
  )
  expect(result.toString()).toBe(expected)
})

describe('objectToURLSearchParams', () => {
  test('converts simple key-value pairs', () => {
    const params = objectToURLSearchParams({ name: 'test', age: 25 })
    expect(params.get('name')).toBe('test')
    expect(params.get('age')).toBe('25')
  })

  test('skips null values', () => {
    const params = objectToURLSearchParams({ name: 'test', skip: null })
    expect(params.get('name')).toBe('test')
    expect(params.has('skip')).toBe(false)
  })

  test('skips undefined values', () => {
    const params = objectToURLSearchParams({ name: 'test', skip: undefined })
    expect(params.get('name')).toBe('test')
    expect(params.has('skip')).toBe(false)
  })

  test('JSON.stringifies nested objects', () => {
    const nested = { key: 'value' }
    const params = objectToURLSearchParams({ data: nested })
    expect(params.get('data')).toBe(JSON.stringify(nested))
  })

  test('JSON.stringifies arrays', () => {
    const arr = [1, 2, 3]
    const params = objectToURLSearchParams({ items: arr })
    expect(params.get('items')).toBe(JSON.stringify(arr))
  })

  test('converts boolean values to string', () => {
    const params = objectToURLSearchParams({ active: true, deleted: false })
    expect(params.get('active')).toBe('true')
    expect(params.get('deleted')).toBe('false')
  })

  test('converts number values to string', () => {
    const params = objectToURLSearchParams({ count: 42, price: 9.99 })
    expect(params.get('count')).toBe('42')
    expect(params.get('price')).toBe('9.99')
  })

  test('handles empty object', () => {
    const params = objectToURLSearchParams({})
    expect(params.toString()).toBe('')
  })
})

describe('objectToFormData', () => {
  test('converts simple key-value pairs', () => {
    const formData = objectToFormData({ name: 'test', age: 25 })
    expect(formData.get('name')).toBe('test')
    expect(formData.get('age')).toBe('25')
  })

  test('skips null values', () => {
    const formData = objectToFormData({ name: 'test', skip: null })
    expect(formData.get('name')).toBe('test')
    expect(formData.has('skip')).toBe(false)
  })

  test('skips undefined values', () => {
    const formData = objectToFormData({ name: 'test', skip: undefined })
    expect(formData.get('name')).toBe('test')
    expect(formData.has('skip')).toBe(false)
  })

  test('JSON.stringifies nested objects', () => {
    const nested = { key: 'value' }
    const formData = objectToFormData({ data: nested })
    expect(formData.get('data')).toBe(JSON.stringify(nested))
  })

  test('JSON.stringifies arrays', () => {
    const arr = [1, 2, 3]
    const formData = objectToFormData({ items: arr })
    expect(formData.get('items')).toBe(JSON.stringify(arr))
  })

  test('appends Blob values directly', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' })
    const formData = objectToFormData({ file: blob })
    const result = formData.get('file')
    expect(result).toBeInstanceOf(Blob)
  })

  test('appends File values directly', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const formData = objectToFormData({ document: file })
    const result = formData.get('document')
    expect(result).toBeInstanceOf(File)
    expect((result as File).name).toBe('test.txt')
  })

  test('converts boolean values to string', () => {
    const formData = objectToFormData({ active: true, deleted: false })
    expect(formData.get('active')).toBe('true')
    expect(formData.get('deleted')).toBe('false')
  })

  test('converts number values to string', () => {
    const formData = objectToFormData({ count: 42, price: 9.99 })
    expect(formData.get('count')).toBe('42')
    expect(formData.get('price')).toBe('9.99')
  })

  test('handles empty object', () => {
    const formData = objectToFormData({})
    const entries = Array.from(formData.entries())
    expect(entries).toHaveLength(0)
  })
})
