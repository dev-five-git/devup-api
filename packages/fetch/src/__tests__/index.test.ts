import { expect, test } from 'bun:test'
import * as indexModule from '../index'

// Type imports to verify types are exported (compile-time check)

test('index.ts exports', () => {
  expect({ ...indexModule }).toEqual({
    createApi: expect.any(Function),
  })
})
