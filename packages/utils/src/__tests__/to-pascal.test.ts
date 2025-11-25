import { expect, test } from 'bun:test'
import { toPascal } from '../to-pascal'

test.each([
  ['hello_world', 'HelloWorld'],
  ['my_variable_name', 'MyVariableName'],
  ['snake_case_string', 'SnakeCaseString'],
])('converts snake_case to PascalCase: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['helloWorld', 'HelloWorld'],
  ['myVariableName', 'MyVariableName'],
  ['camelCaseString', 'CamelCaseString'],
])('converts camelCase to PascalCase: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['hello-world', 'HelloWorld'],
  ['my-variable-name', 'MyVariableName'],
  ['kebab-case-string', 'KebabCaseString'],
])('converts kebab-case to PascalCase: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['hello world', 'HelloWorld'],
  ['my variable name', 'MyVariableName'],
  ['space separated string', 'SpaceSeparatedString'],
])('converts space-separated strings to PascalCase: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['HelloWorld', 'HelloWorld'],
  ['MyVariableName', 'MyVariableName'],
  ['PascalCaseString', 'PascalCaseString'],
])('returns PascalCase strings unchanged: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['hello_world123', 'HelloWorld123'],
  ['my_variable2_name', 'MyVariable2Name'],
  ['test123_case', 'Test123Case'],
])('handles strings with numbers: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['XML_HTTP_REQUEST', 'XmlHttpRequest'],
  ['HTTPS_CONNECTION', 'HttpsConnection'],
])('handles consecutive uppercase letters: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['hello-world_test', 'HelloWorldTest'],
  ['my@variable#name', 'MyVariableName'],
  ['test!@#$%^&*()case', 'TestCase'],
])('handles special characters: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['hello__world', 'HelloWorld'],
  ['my___variable', 'MyVariable'],
])('collapses multiple separators: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['_hello_world_', 'HelloWorld'],
  ['__my_variable__', 'MyVariable'],
])('removes leading and trailing separators: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['', ''],
  ['a', 'A'],
  ['A', 'A'],
])('handles empty string and single characters: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})

test.each([
  ['HelloWorld-123_test', 'HelloWorld123Test'],
  ['myVariable@Name#123', 'MyVariableName123'],
  ['XML_HTTP_REQUEST-API', 'XmlHttpRequestApi'],
])('handles complex cases: %s -> %s', (input, expected) => {
  expect(toPascal(input)).toBe(expected)
})
