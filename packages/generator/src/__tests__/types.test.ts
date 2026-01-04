/**
 * Type tests for generator
 * Verify that generated type structures are correct
 */
import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'
import { extractParameters, getTypeFromSchema } from '../generate-schema'

// =============================================================================
// Helper
// =============================================================================

const createDocument = (
  doc: Partial<OpenAPIV3_1.Document> = {},
): OpenAPIV3_1.Document =>
  ({
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
    ...doc,
  }) as OpenAPIV3_1.Document

// =============================================================================
// getTypeFromSchema - OpenAPI schema to TypeScript type conversion
// =============================================================================

describe('getTypeFromSchema type conversion', () => {
  const doc = createDocument()

  test('primitive type conversion', () => {
    expect(getTypeFromSchema({ type: 'string' }, doc).type).toBe('string')
    expect(getTypeFromSchema({ type: 'number' }, doc).type).toBe('number')
    expect(getTypeFromSchema({ type: 'integer' }, doc).type).toBe('number')
    expect(getTypeFromSchema({ type: 'boolean' }, doc).type).toBe('boolean')
  })

  test('enum to union type conversion', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'string',
      enum: ['active', 'inactive', 'pending'],
    }
    const result = getTypeFromSchema(schema, doc)

    expect(result.type).toBe('"active" | "inactive" | "pending"')
  })

  test('array type conversion', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'array',
      items: { type: 'string' },
    }
    const result = getTypeFromSchema(schema, doc)

    expect(result.type).toEqual({ __isArray: true, items: 'string' })
  })

  test('object type conversion - required field distinction', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['id', 'name'],
    }
    const result = getTypeFromSchema(schema, doc)

    // required fields have no ?, optional fields have ?
    expect(result.type).toHaveProperty('id')
    expect(result.type).toHaveProperty('name')
    expect(result.type).toHaveProperty('email?')
  })

  test('$ref resolution', () => {
    const docWithRef = createDocument({
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
            },
          },
        },
      },
    })

    const schema: OpenAPIV3_1.ReferenceObject = {
      $ref: '#/components/schemas/User',
    }
    const result = getTypeFromSchema(schema, docWithRef)

    expect(result.type).toHaveProperty('id?')
  })

  test('allOf to intersection type', () => {
    const docWithSchemas = createDocument({
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: { id: { type: 'integer' } },
          },
        },
      },
    })

    const schema: OpenAPIV3_1.SchemaObject = {
      allOf: [
        { $ref: '#/components/schemas/Base' },
        { type: 'object', properties: { name: { type: 'string' } } },
      ],
    }
    const result = getTypeFromSchema(schema, docWithSchemas)

    expect(String(result.type)).toContain('&')
  })

  test('oneOf/anyOf to union type', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    }
    const result = getTypeFromSchema(schema, doc)

    expect(String(result.type)).toContain('|')
  })
})

// =============================================================================
// extractParameters - Parameter extraction
// =============================================================================

describe('extractParameters parameter classification', () => {
  const doc = createDocument()

  test('separates path/query/header parameters', () => {
    const operation: OpenAPIV3_1.OperationObject = {
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
        },
        {
          name: 'Authorization',
          in: 'header',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {},
    }

    const result = extractParameters(undefined, operation, doc)

    expect(result.pathParams).toHaveProperty('userId')
    expect(result.queryParams).toHaveProperty('page')
    expect(result.headerParams).toHaveProperty('Authorization')
  })

  test('preserves required status', () => {
    const operation: OpenAPIV3_1.OperationObject = {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        {
          name: 'filter',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {},
    }

    const result = extractParameters(undefined, operation, doc)

    expect(result.pathParams.id.required).toBe(true)
    expect(result.queryParams.filter.required).toBe(false)
  })
})

// =============================================================================
// generateInterface - Interface generation verification
// =============================================================================

describe('generateInterface structure verification', () => {
  test('generates module augmentation', () => {
    const result = generateInterface({ 'openapi.json': createDocument() })

    expect(result).toContain('import "@devup-api/fetch"')
    expect(result).toContain('declare module "@devup-api/fetch"')
    expect(result).toContain('interface DevupApiServers')
  })

  test('GET endpoint to DevupGetApiStruct', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('interface DevupGetApiStruct')
    expect(result).toContain('getUsers')
    expect(result).toContain('/users')
  })

  test('POST endpoint to DevupPostApiStruct with body', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: { '201': { description: 'Created' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('interface DevupPostApiStruct')
    expect(result).toContain('createUser')
    expect(result).toContain('body')
  })

  test('path parameter to params generation', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUserById',
              parameters: [
                {
                  name: 'userId',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
              ],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('params')
    expect(result).toContain('userId')
  })

  test('query parameter to query generation', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              parameters: [
                {
                  name: 'page',
                  in: 'query',
                  required: false,
                  schema: { type: 'integer' },
                },
                {
                  name: 'limit',
                  in: 'query',
                  required: true,
                  schema: { type: 'integer' },
                },
              ],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('query')
    expect(result).toContain('page')
    expect(result).toContain('limit')
  })

  test('error response to error type generation', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Bad Request',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: { message: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('error')
  })
})

// =============================================================================
// DevupObject reference generation verification
// =============================================================================

describe('DevupObject reference generation', () => {
  test('response $ref to DevupObject<response> reference', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: { id: { type: 'integer' } },
            },
          },
        },
      }),
    })

    expect(result).toContain("DevupObject<'response', 'openapi.json'>['User']")
    expect(result).toContain('interface DevupResponseComponentStruct')
  })

  test('request $ref to DevupObject<request> reference', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CreateUserRequest' },
                  },
                },
              },
              responses: { '201': { description: 'Created' } },
            },
          },
        },
        components: {
          schemas: {
            CreateUserRequest: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain(
      "DevupObject<'request', 'openapi.json'>['CreateUserRequest']",
    )
    expect(result).toContain('interface DevupRequestComponentStruct')
  })

  test('error $ref to DevupObject<error> reference', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ApiError: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain("DevupObject<'error', 'openapi.json'>['ApiError']")
    expect(result).toContain('interface DevupErrorComponentStruct')
  })

  test('array response $ref to Array<DevupObject> reference', () => {
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: { id: { type: 'integer' } },
            },
          },
        },
      }),
    })

    expect(result).toContain(
      "Array<DevupObject<'response', 'openapi.json'>['User']>",
    )
  })
})

// =============================================================================
// Case conversion verification
// =============================================================================

describe('Case conversion', () => {
  test('camelCase conversion', () => {
    const result = generateInterface(
      {
        'openapi.json': createDocument({
          paths: {
            '/users/{user_id}': {
              get: {
                operationId: 'get_user_by_id',
                parameters: [
                  {
                    name: 'user_id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                  },
                ],
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      { convertCase: 'camel' },
    )

    expect(result).toContain('getUserById')
    expect(result).toContain('userId')
  })

  test('snake_case conversion', () => {
    const result = generateInterface(
      {
        'openapi.json': createDocument({
          paths: {
            '/users/{userId}': {
              get: {
                operationId: 'getUserById',
                parameters: [
                  {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                  },
                ],
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      { convertCase: 'snake' },
    )

    expect(result).toContain('get_user_by_id')
    expect(result).toContain('user_id')
  })

  test('PascalCase conversion', () => {
    const result = generateInterface(
      {
        'openapi.json': createDocument({
          paths: {
            '/users/{user_id}': {
              get: {
                operationId: 'get_user',
                parameters: [
                  {
                    name: 'user_id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                  },
                ],
                responses: { '200': { description: 'Success' } },
              },
            },
          },
        }),
      },
      { convertCase: 'pascal' },
    )

    expect(result).toContain('GetUser')
    expect(result).toContain('UserId')
  })
})

// =============================================================================
// Multi-server support verification
// =============================================================================

describe('Multi-server support', () => {
  test('processes multiple server files', () => {
    const result = generateInterface({
      'main-api.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
      'admin-api.json': createDocument({
        paths: {
          '/admin/users': {
            get: {
              operationId: 'getAdminUsers',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('main-api.json')
    expect(result).toContain('admin-api.json')
    expect(result).toContain('getUsers')
    expect(result).toContain('getAdminUsers')
  })
})
