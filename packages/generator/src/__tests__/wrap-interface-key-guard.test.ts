import { expect, test } from 'bun:test'
import { wrapInterfaceKeyGuard } from '../wrap-interface-key-guard'

test.each([
  ['getUsers', 'getUsers'],
  ['createUser', 'createUser'],
  ['updateUser', 'updateUser'],
  ['deleteUser', 'deleteUser'],
  ['testKey', 'testKey'],
  ['camelCase', 'camelCase'],
  ['snake_case', 'snake_case'],
  ['PascalCase', 'PascalCase'],
] as const)('wrapInterfaceKeyGuard returns key as-is when no slash: %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})

test.each([
  ['/users', '[`/users`]'],
  ['/users/{id}', '[`/users/{id}`]'],
  ['/api/v1/users', '[`/api/v1/users`]'],
  ['/users/{userId}/posts/{postId}', '[`/users/{userId}/posts/{postId}`]'],
  ['/api/v1/users/{id}/profile', '[`/api/v1/users/{id}/profile`]'],
] as const)('wrapInterfaceKeyGuard wraps key with backticks when slash present: %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})

test.each([
  ['', ''],
  ['/', '[`/`]'],
  ['//', '[`//`]'],
  ['///', '[`///`]'],
] as const)('wrapInterfaceKeyGuard handles edge cases: %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})

test.each([
  ['users/123', '[`users/123`]'],
  ['test/path/here', '[`test/path/here`]'],
  ['a/b/c/d', '[`a/b/c/d`]'],
] as const)('wrapInterfaceKeyGuard wraps key with multiple slashes: %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})

test.each([
  ['field"name', '[`field"name`]'],
  ["field'name", "[`field'name`]"],
  ['field`name', '[`field`name`]'],
  ['field-name', '[`field-name`]'],
  ['field name', '[`field name`]'],
  ['field@name', '[`field@name`]'],
  ['field#name', '[`field#name`]'],
  ['field$name', 'field$name'], // $ is valid in identifiers
  ['field_name', 'field_name'], // _ is valid in identifiers
  ['123field', '[`123field`]'], // cannot start with number
] as const)('wrapInterfaceKeyGuard wraps key with forbidden characters: %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})

test.each([
  ['name?', 'name?'], // valid identifier with optional marker
  ['email?', 'email?'], // valid identifier with optional marker
  ['field_name?', 'field_name?'], // valid identifier with optional marker
  ['field-name?', '[`field-name`]?'], // invalid identifier with optional marker
  ['field name?', '[`field name`]?'], // invalid identifier with optional marker
  ['/users?', '[`/users`]?'], // path with optional marker
  ['123field?', '[`123field`]?'], // starts with number, with optional marker
] as const)('wrapInterfaceKeyGuard handles optional keys (ending with ?): %s -> %s', (key, expected) => {
  expect(wrapInterfaceKeyGuard(key)).toBe(expected)
})
