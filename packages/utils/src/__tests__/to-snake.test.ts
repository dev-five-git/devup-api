import { expect, test } from 'bun:test'
import { toSnake } from '../to-snake'

test.each([
  ['helloWorld', 'hello_world'],
  ['myVariableName', 'my_variable_name'],
  ['camelCaseString', 'camel_case_string'],
])('converts camelCase to snake_case: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['HelloWorld', 'hello_world'],
  ['MyVariableName', 'my_variable_name'],
  ['PascalCaseString', 'pascal_case_string'],
])('converts PascalCase to snake_case: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['hello-world', 'hello_world'],
  ['my-variable-name', 'my_variable_name'],
  ['kebab-case-string', 'kebab_case_string'],
])('converts kebab-case to snake_case: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['hello world', 'hello_world'],
  ['my variable name', 'my_variable_name'],
  ['space separated string', 'space_separated_string'],
])('converts space-separated strings to snake_case: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['hello_world', 'hello_world'],
  ['my_variable_name', 'my_variable_name'],
  ['snake_case_string', 'snake_case_string'],
])('returns snake_case strings unchanged: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['helloWorld123', 'hello_world123'],
  ['myVariable2Name', 'my_variable2_name'],
  ['test123Case', 'test123_case'],
])('handles strings with numbers: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['XMLHttpRequest', 'xml_http_request'],
  ['HTTPSConnection', 'https_connection'],
])('handles consecutive uppercase letters: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['hello-world_test', 'hello_world_test'],
  ['my@variable#name', 'my_variable_name'],
  ['test!@#$%^&*()case', 'test_case'],
])('handles special characters: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['hello__world', 'hello_world'],
  ['my___variable', 'my_variable'],
])('collapses multiple underscores: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['_hello_world_', 'hello_world'],
  ['__my_variable__', 'my_variable'],
])('removes leading and trailing underscores: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['', ''],
  ['a', 'a'],
  ['A', 'a'],
])('handles empty string and single characters: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})

test.each([
  ['HelloWorld-123_test', 'hello_world_123_test'],
  ['myVariable@Name#123', 'my_variable_name_123'],
  ['XMLHttpRequest-API', 'xml_http_request_api'],
])('handles complex cases: %s -> %s', (input, expected) => {
  expect(toSnake(input)).toBe(expected)
})
