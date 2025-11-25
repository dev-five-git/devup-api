import { expect, test } from 'bun:test'
import { toCamel } from '../to-camel'

test.each([
  ['hello_world', 'helloWorld'],
  ['my_variable_name', 'myVariableName'],
  ['snake_case_string', 'snakeCaseString'],
])('converts snake_case to camelCase: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['HelloWorld', 'helloWorld'],
  ['MyVariableName', 'myVariableName'],
  ['PascalCaseString', 'pascalCaseString'],
])('converts PascalCase to camelCase: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['hello-world', 'helloWorld'],
  ['my-variable-name', 'myVariableName'],
  ['kebab-case-string', 'kebabCaseString'],
])('converts kebab-case to camelCase: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['hello world', 'helloWorld'],
  ['my variable name', 'myVariableName'],
  ['space separated string', 'spaceSeparatedString'],
])('converts space-separated strings to camelCase: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['helloWorld', 'helloWorld'],
  ['myVariableName', 'myVariableName'],
  ['camelCaseString', 'camelCaseString'],
])('returns camelCase strings unchanged: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['hello_world123', 'helloWorld123'],
  ['my_variable2_name', 'myVariable2Name'],
  ['test123_case', 'test123Case'],
])('handles strings with numbers: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['XML_HTTP_REQUEST', 'xmlHttpRequest'],
  ['HTTPS_CONNECTION', 'httpsConnection'],
])('handles consecutive uppercase letters: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['hello-world_test', 'helloWorldTest'],
  ['my@variable#name', 'myVariableName'],
  ['test!@#$%^&*()case', 'testCase'],
])('handles special characters: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['hello__world', 'helloWorld'],
  ['my___variable', 'myVariable'],
])('collapses multiple separators: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['_hello_world_', 'helloWorld'],
  ['__my_variable__', 'myVariable'],
])('removes leading and trailing separators: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['', ''],
  ['a', 'a'],
  ['A', 'a'],
])('handles empty string and single characters: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})

test.each([
  ['HelloWorld-123_test', 'helloWorld123Test'],
  ['myVariable@Name#123', 'myVariableName123'],
  ['XML_HTTP_REQUEST-API', 'xmlHttpRequestApi'],
])('handles complex cases: %s -> %s', (input, expected) => {
  expect(toCamel(input)).toBe(expected)
})
