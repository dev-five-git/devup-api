import { expect, test } from 'bun:test'
import * as indexModule from '../index'

test('index.ts exports all types', () => {
  expect(indexModule).toBeDefined()
  expect(typeof indexModule).toBe('object')
  expect(Object.keys(indexModule)).toEqual([])
})
