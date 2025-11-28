import { expect, test } from 'bun:test'
import * as indexModule from '../index'

test('index.ts exports', () => {
  expect({ ...indexModule }).toEqual({
    devupApi: expect.any(Function),
    default: expect.any(Function),
  })
})
