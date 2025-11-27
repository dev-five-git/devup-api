import { expect, test } from 'bun:test'
import { convertCase } from '../convert-case'

test.each([
  ['hello_world', 'snake', 'hello_world'],
  ['my_variable_name', 'snake', 'my_variable_name'],
  ['snake_case_string', 'snake', 'snake_case_string'],
])('converts to snake_case: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'snake')).toBe(expected)
})

test.each([
  ['HelloWorld', 'snake', 'hello_world'],
  ['MyVariableName', 'snake', 'my_variable_name'],
  ['PascalCaseString', 'snake', 'pascal_case_string'],
])('converts PascalCase to snake_case: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'snake')).toBe(expected)
})

test.each([
  ['helloWorld', 'snake', 'hello_world'],
  ['myVariableName', 'snake', 'my_variable_name'],
  ['camelCaseString', 'snake', 'camel_case_string'],
])('converts camelCase to snake_case: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'snake')).toBe(expected)
})

test.each([
  ['hello_world', 'camel', 'helloWorld'],
  ['my_variable_name', 'camel', 'myVariableName'],
  ['snake_case_string', 'camel', 'snakeCaseString'],
])('converts to camelCase: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'camel')).toBe(expected)
})

test.each([
  ['HelloWorld', 'camel', 'helloWorld'],
  ['MyVariableName', 'camel', 'myVariableName'],
  ['PascalCaseString', 'camel', 'pascalCaseString'],
])('converts PascalCase to camelCase: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'camel')).toBe(expected)
})

test.each([
  ['helloWorld', 'camel', 'helloWorld'],
  ['myVariableName', 'camel', 'myVariableName'],
  ['camelCaseString', 'camel', 'camelCaseString'],
])('returns camelCase strings unchanged: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'camel')).toBe(expected)
})

test.each([
  ['hello_world', 'pascal', 'HelloWorld'],
  ['my_variable_name', 'pascal', 'MyVariableName'],
  ['snake_case_string', 'pascal', 'SnakeCaseString'],
])('converts to PascalCase: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'pascal')).toBe(expected)
})

test.each([
  ['helloWorld', 'pascal', 'HelloWorld'],
  ['myVariableName', 'pascal', 'MyVariableName'],
  ['camelCaseString', 'pascal', 'CamelCaseString'],
])('converts camelCase to PascalCase: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'pascal')).toBe(expected)
})

test.each([
  ['HelloWorld', 'pascal', 'HelloWorld'],
  ['MyVariableName', 'pascal', 'MyVariableName'],
  ['PascalCaseString', 'pascal', 'PascalCaseString'],
])('returns PascalCase strings unchanged: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'pascal')).toBe(expected)
})

test.each([
  ['hello_world', 'maintain', 'hello_world'],
  ['myVariableName', 'maintain', 'myVariableName'],
  ['HelloWorld', 'maintain', 'HelloWorld'],
  ['any_string-here', 'maintain', 'any_string-here'],
])('maintains original case: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'maintain')).toBe(expected)
})

test.each([
  ['hello_world', undefined, 'helloWorld'],
  ['my_variable_name', undefined, 'myVariableName'],
  ['snake_case_string', undefined, 'snakeCaseString'],
])('defaults to camelCase when caseType is undefined: %s -> %s', (input, caseType, expected) => {
  // biome-ignore lint/suspicious/noExplicitAny: Testing default behavior with undefined caseType
  expect(convertCase(input, caseType as any)).toBe(expected)
})

test.each([
  ['hello_world', 'helloWorld'],
  ['my_variable_name', 'myVariableName'],
  ['snake_case_string', 'snakeCaseString'],
])('defaults to camelCase when caseType is not provided: %s -> %s', (input, expected) => {
  expect(convertCase(input)).toBe(expected)
})

test.each([
  ['', 'camel', ''],
  ['a', 'camel', 'a'],
  ['A', 'camel', 'a'],
])('handles empty string and single characters: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'camel')).toBe(expected)
})

test.each([
  ['hello_world123', 'camel', 'helloWorld123'],
  ['my_variable2_name', 'camel', 'myVariable2Name'],
  ['test123_case', 'camel', 'test123Case'],
])('handles strings with numbers: %s -> %s', (input, caseType, expected) => {
  expect(convertCase(input, caseType as 'camel')).toBe(expected)
})

test.each([
  ['hello_world', 'invalid', 'hello_world'],
  ['myVariableName', 'unknown', 'myVariableName'],
  ['HelloWorld', 'wrong', 'HelloWorld'],
])('default case returns original string for invalid caseType: %s -> %s', (input, caseType, expected) => {
  // biome-ignore lint/suspicious/noExplicitAny: Testing default case with invalid caseType values
  expect(convertCase(input, caseType as any)).toBe(expected)
})
