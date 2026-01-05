import { expect, test } from 'bun:test'
import * as indexModule from '../index'

test('index.ts exports', () => {
  expect({ ...indexModule }).toEqual({
    // URL map
    createUrlMap: expect.any(Function),
    // Interface generation
    generateInterface: expect.any(Function),
    // Zod generation
    generateZodSchemas: expect.any(Function),
    generateZodTypeDeclarations: expect.any(Function),
    // CRUD config generation
    buildCrudConfigs: expect.any(Function),
    extractPathParams: expect.any(Function),
    generateCrudConfigCode: expect.any(Function),
    generateCrudConfigTypes: expect.any(Function),
    parseCrudConfigs: expect.any(Function),
    parseCrudConfigsFromMultiple: expect.any(Function),
    parseDevupOperations: expect.any(Function),
    parseDevupTag: expect.any(Function),
  })
})
