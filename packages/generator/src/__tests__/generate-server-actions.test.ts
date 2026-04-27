import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import {
  generateServerActionCode,
  generateServerActionTypes,
} from '../generate-server-actions'

const createDocument = (
  doc: Partial<OpenAPIV3_1.Document> = {},
): OpenAPIV3_1.Document =>
  ({
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
    ...doc,
  }) as OpenAPIV3_1.Document

describe('generateServerActionCode', () => {
  test('generates top-level server action functions for operationIds by default', () => {
    const result = generateServerActionCode(
      {
        'openapi.json': createDocument({
          paths: {
            '/users': {
              get: {
                operationId: 'getUsers',
                responses: { '200': { description: 'Success' } },
              },
              post: {
                operationId: 'createUser',
                responses: { '201': { description: 'Created' } },
              },
            },
          },
        }),
      },
      { serverActions: { baseUrl: 'https://api.example.com' } },
    )

    expect(result).toContain("'use server'")
    expect(result).toContain("import { createApi } from '@devup-api/fetch'")
    expect(result).toContain(
      "import { serializeApiResponse } from '@devup-api/fetch'",
    )
    expect(result).toContain("baseUrl: 'https://api.example.com'")
    expect(result).toContain('export async function getUsers(')
    expect(result).toContain(
      "return serializeApiResponse(await api.get('getUsers'",
    )
    expect(result).toContain('export async function createUser(')
    expect(result).toContain(
      "return serializeApiResponse(await api.post('createUser'",
    )
  })

  test('generates actions when serverActions is omitted', () => {
    const result = generateServerActionCode({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain("'use server'")
    expect(result).toContain('export async function getUsers')
  })

  test('does not generate actions when serverActions is explicitly disabled', () => {
    const result = generateServerActionCode(
      {
        'openapi.json': createDocument({
          paths: {
            '/users': {
              get: {
                operationId: 'getUsers',
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      { serverActions: false },
    )

    expect(result).toContain("'use server'")
    expect(result).not.toContain('export async function getUsers')
  })

  test('does not generate actions when serverActions object is disabled', () => {
    const result = generateServerActionCode(
      {
        'openapi.json': createDocument({
          paths: {
            '/users': {
              get: {
                operationId: 'getUsers',
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      { serverActions: { enabled: false } },
    )

    expect(result).toContain("'use server'")
    expect(result).not.toContain('export async function getUsers')
  })

  test('generates all operationIds with empty serverActions config', () => {
    const result = generateServerActionCode(
      {
        'openapi.json': createDocument({
          paths: {
            '/users': {
              get: {
                operationId: 'getUsers',
                responses: { '200': { description: 'Success' } },
              },
              post: {
                operationId: 'createUser',
                responses: { '201': { description: 'Created' } },
              },
            },
            '/users/{id}': {
              delete: {
                operationId: 'deleteUser',
                responses: { '204': { description: 'Deleted' } },
              },
            },
          },
        }),
      },
      {
        serverActions: {},
      },
    )

    expect(result).toContain('export async function getUsers')
    expect(result).toContain('export async function createUser')
    expect(result).toContain('export async function deleteUser')
  })

  test('uses serverName when generating actions for non-default schemas', () => {
    const result = generateServerActionCode(
      {
        'admin.json': createDocument({
          paths: {
            '/admins': {
              get: {
                operationId: 'getAdmins',
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      undefined,
    )

    expect(result).toContain("serverName: 'admin.json'")
    expect(result).toContain(
      "return serializeApiResponse(await api.get('getAdmins'",
    )
  })

  test('creates safe action names for invalid and duplicate operationIds', () => {
    const result = generateServerActionCode({
      'openapi.json': createDocument({
        paths: {
          '/numeric': {
            get: {
              operationId: '123NumericUser',
              responses: { '200': { description: 'Success' } },
            },
          },
          '/shared': {
            get: {
              operationId: 'getSharedUser',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
      'admin-api.json': createDocument({
        paths: {
          '/shared': {
            get: {
              operationId: 'getSharedUser',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('export async function _123numericUser(')
    expect(result).toContain('export async function getSharedUser(')
    expect(result).toContain(
      'export async function adminApiJson_getSharedUser(',
    )
  })
})

describe('generateServerActionTypes', () => {
  test('declares the generated server action module', () => {
    const result = generateServerActionTypes(
      {
        'openapi.json': createDocument({
          paths: {
            '/users': {
              get: {
                operationId: 'getUsers',
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      undefined,
    )

    expect(result).toContain(
      "declare module '@devup-api/fetch/server-generated'",
    )
    expect(result).toContain('export function getUsers(')
    expect(result).toContain('Promise<DevupApiResponse<')
    expect(result).toContain('SerializedResponse')
  })
})
