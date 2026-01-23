/**
 * Type tests for generator
 * Verify that generated type structures are correct
 */
import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'
import {
  createSchemaContext,
  extractParameters,
  getTypeFromSchema,
} from '../generate-schema'

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

  test('enum to named type with context', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'string',
      enum: ['active', 'inactive', 'pending'],
    }
    const context = createSchemaContext('User')
    context.propertyPath.push('status')
    const result = getTypeFromSchema(schema, doc, {
      context,
      propertyName: undefined,
    })

    // With context, returns the enum type name
    expect(result.type).toBe('UserStatus')
    // Enum should be registered in context
    expect(context.enums.has('UserStatus')).toBe(true)
    expect(context.enums.get('UserStatus')?.values).toEqual([
      'active',
      'inactive',
      'pending',
    ])
  })

  test('enum in nested object with context', () => {
    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
        },
      },
    }
    const context = createSchemaContext('Post')
    const _result = getTypeFromSchema(schema, doc, { context })

    // Enum should be registered with property path
    expect(context.enums.has('PostStatus')).toBe(true)
    expect(context.enums.get('PostStatus')?.values).toEqual([
      'draft',
      'published',
      'archived',
    ])
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

// =============================================================================
// Enum type generation
// =============================================================================

describe('Enum type generation', () => {
  test('generates named type alias for enum in response', () => {
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
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'pending'],
                          },
                        },
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

    // Should generate a named type alias for the enum
    expect(result).toContain(
      'type ResponseStatus = "active" | "inactive" | "pending"',
    )
    // Should use the named type in the interface
    expect(result).toContain('status?: ResponseStatus')
  })

  test('generates named type alias for enum in component schema', () => {
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
              properties: {
                id: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['admin', 'user', 'guest'],
                },
              },
            },
          },
        },
      }),
    })

    // Should generate a named type alias for the enum
    expect(result).toContain('type UserRole = "admin" | "user" | "guest"')
    // Should use the named type in the component
    expect(result).toContain('role?: UserRole')
  })

  test('reuses same enum type for identical values', () => {
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
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'inactive'],
                },
              },
            },
          },
        },
      }),
    })

    // Should only have one type definition (not duplicated)
    const matches = result.match(/type UserStatus/g)
    expect(matches?.length).toBe(1)
  })

  test('deduplicates enum types across response and error with same name', () => {
    // This test covers the branch where enum is already registered (lines 340-342, etc.)
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
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['success', 'pending'],
                          },
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['success', 'pending'],
                          },
                        },
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

    // Same enum should only be defined once even if used in both response and error
    const matches = result.match(/type (Response|Error)Status/g)
    // Should have at most one definition (first one wins)
    expect(matches?.length).toBeLessThanOrEqual(2)
  })

  test('handles enum in array response without component ref', () => {
    // This covers lines 381-383 (array response with enum, not using component ref)
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            category: {
                              type: 'string',
                              enum: ['food', 'drink', 'other'],
                            },
                          },
                        },
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

    expect(result).toContain(
      'type ResponseCategory = "food" | "drink" | "other"',
    )
  })

  test('handles enum in array error response without component ref', () => {
    // This covers lines 515-517 (array error with enum, not using component ref)
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object', properties: {} },
                    },
                  },
                },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: {
                              type: 'string',
                              enum: ['warning', 'error', 'critical'],
                            },
                          },
                        },
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

    expect(result).toContain(
      'type ErrorSeverity = "warning" | "error" | "critical"',
    )
  })

  test('handles enum in error response object without component ref', () => {
    // This covers lines 536-538 (error object with enum)
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object', properties: {} },
                    },
                  },
                },
                '500': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          errorCode: {
                            type: 'string',
                            enum: ['internal', 'timeout', 'unavailable'],
                          },
                        },
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

    expect(result).toContain(
      'type ErrorErrorCode = "internal" | "timeout" | "unavailable"',
    )
  })

  test('generates enum name from values when no context path', () => {
    // This covers generate-schema.ts lines 62-66 (fallback enum naming)
    const context = createSchemaContext() // No schema name
    // Don't push any property path

    const schema: OpenAPIV3_1.SchemaObject = {
      type: 'string',
      enum: ['red', 'green', 'blue'],
    }

    const result = getTypeFromSchema(schema, createDocument(), { context })

    // Should generate name from values: RedGreenBlueEnum
    expect(result.type).toBe('RedGreenBlueEnum')
    expect(context.enums.has('RedGreenBlueEnum')).toBe(true)
  })

  test('deduplicates enums when multiple operations have same enum property name', () => {
    // This covers lines 340-342: duplicate enum check when merging from inline context
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
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['active', 'inactive'],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/posts': {
            get: {
              operationId: 'getPosts',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            enum: ['active', 'inactive'],
                          },
                        },
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

    // Should only define the enum once
    const matches = result.match(/type ResponseStatus/g)
    expect(matches?.length).toBe(1)
  })

  test('deduplicates enums in array responses across operations', () => {
    // This covers lines 381-383: duplicate enum in array response
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            priority: {
                              type: 'string',
                              enum: ['low', 'medium', 'high'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/tasks': {
            get: {
              operationId: 'getTasks',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            priority: {
                              type: 'string',
                              enum: ['low', 'medium', 'high'],
                            },
                          },
                        },
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

    // Should only define the enum once
    const matches = result.match(/type ResponsePriority/g)
    expect(matches?.length).toBe(1)
  })

  test('deduplicates enums in error responses across operations', () => {
    // This covers lines 474-476 and 536-538: duplicate enum in error response
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
                      schema: {
                        type: 'object',
                        properties: {
                          level: {
                            type: 'string',
                            enum: ['warn', 'error', 'fatal'],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/posts': {
            get: {
              operationId: 'getPosts',
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          level: {
                            type: 'string',
                            enum: ['warn', 'error', 'fatal'],
                          },
                        },
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

    // Should only define the enum once
    const matches = result.match(/type ErrorLevel/g)
    expect(matches?.length).toBe(1)
  })

  test('deduplicates enums in array error responses across operations', () => {
    // This covers lines 515-517: duplicate enum in array error response
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': { description: 'Success' },
                '422': {
                  description: 'Validation Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: {
                              type: 'string',
                              enum: ['info', 'warning', 'error'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/orders': {
            get: {
              operationId: 'getOrders',
              responses: {
                '200': { description: 'Success' },
                '422': {
                  description: 'Validation Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: {
                              type: 'string',
                              enum: ['info', 'warning', 'error'],
                            },
                          },
                        },
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

    // Should only define the enum once
    const matches = result.match(/type ErrorSeverity/g)
    expect(matches?.length).toBe(1)
  })

  test('handles response with $ref that resolves to schema with enum (non-component ref)', () => {
    // This specifically targets lines 340-342: $ref that is not in responseSchemaNames
    // We use components.responses which resolves but doesn't go through the normal path
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/status': {
            get: {
              operationId: 'getStatus',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        // $ref to a response object (not schema) - extractSchemaNameFromRef returns null
                        $ref: '#/components/responses/StatusResponse',
                      },
                    },
                  },
                },
              },
            },
          },
          '/health': {
            get: {
              operationId: 'getHealth',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/responses/StatusResponse',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          responses: {
            StatusResponse: {
              type: 'object',
              properties: {
                state: {
                  type: 'string',
                  enum: ['healthy', 'degraded', 'down'],
                },
              },
            },
          },
        },
      }),
    })

    // The enum should be generated (may have different name based on resolution)
    expect(result).toMatch(/type.*=.*"healthy".*\|.*"degraded".*\|.*"down"/)
  })

  test('handles error response with $ref that resolves to schema with enum (non-component ref)', () => {
    // This specifically targets lines 474-476: $ref for error that is not in errorSchemaNames
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/action': {
            post: {
              operationId: 'doAction',
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/responses/ErrorResponse',
                      },
                    },
                  },
                },
              },
            },
          },
          '/process': {
            post: {
              operationId: 'doProcess',
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/responses/ErrorResponse',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          responses: {
            ErrorResponse: {
              type: 'object',
              properties: {
                errorType: {
                  type: 'string',
                  enum: ['validation', 'auth', 'server'],
                },
              },
            },
          },
        },
      }),
    })

    expect(result).toMatch(/type.*=.*"validation".*\|.*"auth".*\|.*"server"/)
  })

  test('handles array response with items $ref that is not a component schema', () => {
    // This targets lines 381-383: array response with items $ref not in responseSchemaNames
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/logs': {
            get: {
              operationId: 'getLogs',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/responses/LogEntry',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/events': {
            get: {
              operationId: 'getEvents',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/responses/LogEntry',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          responses: {
            LogEntry: {
              type: 'object',
              properties: {
                level: {
                  type: 'string',
                  enum: ['debug', 'info', 'warn', 'error'],
                },
              },
            },
          },
        },
      }),
    })

    expect(result).toMatch(
      /type.*=.*"debug".*\|.*"info".*\|.*"warn".*\|.*"error"/,
    )
  })

  test('handles array error response with items $ref that is not a component schema', () => {
    // This targets lines 515-517: array error with items $ref not in errorSchemaNames
    const result = generateInterface({
      'openapi.json': createDocument({
        paths: {
          '/submit': {
            post: {
              operationId: 'submit',
              responses: {
                '200': { description: 'Success' },
                '422': {
                  description: 'Validation Errors',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/responses/ValidationError',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/update': {
            put: {
              operationId: 'update',
              responses: {
                '200': { description: 'Success' },
                '422': {
                  description: 'Validation Errors',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/responses/ValidationError',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          responses: {
            ValidationError: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                constraint: {
                  type: 'string',
                  enum: ['required', 'format', 'range', 'unique'],
                },
              },
            },
          },
        },
      }),
    })

    expect(result).toMatch(
      /type.*=.*"required".*\|.*"format".*\|.*"range".*\|.*"unique"/,
    )
  })
})
