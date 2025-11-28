import { expect, test } from 'bun:test'
import { getApiEndpoint, isPlainObject } from '../utils'

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
])('getApiEndpoint: baseUrl=%s, path=%s, params=%s -> %s', (baseUrl, path, params, expected) => {
  expect(getApiEndpoint(baseUrl, path, params)).toBe(expected)
})
