import { describe, expect, test } from 'bun:test'
import {
  errorSchemas,
  requestSchemas,
  responseSchemas,
  schemas,
} from '../index'

describe('@devup-api/zod exports', () => {
  test('exports schemas placeholder object', () => {
    expect(schemas).toBeDefined()
    expect(typeof schemas).toBe('object')
  })

  test('exports responseSchemas placeholder object', () => {
    expect(responseSchemas).toBeDefined()
    expect(typeof responseSchemas).toBe('object')
  })

  test('exports requestSchemas placeholder object', () => {
    expect(requestSchemas).toBeDefined()
    expect(typeof requestSchemas).toBe('object')
  })

  test('exports errorSchemas placeholder object', () => {
    expect(errorSchemas).toBeDefined()
    expect(typeof errorSchemas).toBe('object')
  })
})
