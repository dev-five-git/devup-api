import { expect, test } from 'bun:test'
import * as indexModule from '../index'

test('index.ts exports', () => {
  expect({ ...indexModule }).toEqual({
    createUrlMap: expect.any(Function),
    generateInterface: expect.any(Function),
    generateZodSchemas: expect.any(Function),
    generateZodTypeDeclarations: expect.any(Function),
  })
})
