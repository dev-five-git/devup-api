import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import {
  buildCrudConfigs,
  extractPathParams,
  parseCrudConfigs,
  parseCrudConfigsFromMultiple,
  parseDevupOperations,
  parseDevupTag,
} from '../parse-crud-tags'

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
// parseDevupTag
// =============================================================================

describe('parseDevupTag', () => {
  test('parses valid devup:name:one tag', () => {
    const result = parseDevupTag('devup:user:one')
    expect(result).toEqual({
      raw: 'devup:user:one',
      name: 'user',
      mode: 'one',
    })
  })

  test('parses valid devup:name:create tag', () => {
    const result = parseDevupTag('devup:post:create')
    expect(result).toEqual({
      raw: 'devup:post:create',
      name: 'post',
      mode: 'create',
    })
  })

  test('parses valid devup:name:edit tag', () => {
    const result = parseDevupTag('devup:comment:edit')
    expect(result).toEqual({
      raw: 'devup:comment:edit',
      name: 'comment',
      mode: 'edit',
    })
  })

  test('parses valid devup:name:fix tag', () => {
    const result = parseDevupTag('devup:article:fix')
    expect(result).toEqual({
      raw: 'devup:article:fix',
      name: 'article',
      mode: 'fix',
    })
  })

  test('parses name with hyphens and underscores', () => {
    const result = parseDevupTag('devup:user-profile:one')
    expect(result).toEqual({
      raw: 'devup:user-profile:one',
      name: 'user-profile',
      mode: 'one',
    })

    const result2 = parseDevupTag('devup:user_profile:create')
    expect(result2).toEqual({
      raw: 'devup:user_profile:create',
      name: 'user_profile',
      mode: 'create',
    })
  })

  test('parses name with numbers', () => {
    const result = parseDevupTag('devup:user2:one')
    expect(result).toEqual({
      raw: 'devup:user2:one',
      name: 'user2',
      mode: 'one',
    })
  })

  test('returns null for non-devup tags', () => {
    expect(parseDevupTag('users')).toBeNull()
    expect(parseDevupTag('api:users')).toBeNull()
    expect(parseDevupTag('devup-user-one')).toBeNull()
  })

  test('returns null for invalid mode', () => {
    expect(parseDevupTag('devup:user:delete')).toBeNull()
    expect(parseDevupTag('devup:user:list')).toBeNull()
    expect(parseDevupTag('devup:user:update')).toBeNull()
  })

  test('returns null for invalid name format', () => {
    expect(parseDevupTag('devup:123user:one')).toBeNull() // starts with number
    expect(parseDevupTag('devup::one')).toBeNull() // empty name
  })

  test('returns null for malformed tags', () => {
    expect(parseDevupTag('devup:user')).toBeNull() // missing mode
    expect(parseDevupTag('devup:')).toBeNull()
    expect(parseDevupTag('')).toBeNull()
  })
})

// =============================================================================
// extractPathParams
// =============================================================================

describe('extractPathParams', () => {
  test('extracts single path parameter', () => {
    const result = extractPathParams('/users/{id}')
    expect(result).toEqual(['id'])
  })

  test('extracts multiple path parameters', () => {
    const result = extractPathParams('/users/{userId}/posts/{postId}')
    expect(result).toEqual(['userId', 'postId'])
  })

  test('returns empty array for path without parameters', () => {
    const result = extractPathParams('/users')
    expect(result).toEqual([])
  })

  test('handles nested path with multiple segments', () => {
    const result = extractPathParams(
      '/orgs/{orgId}/teams/{teamId}/members/{memberId}',
    )
    expect(result).toEqual(['orgId', 'teamId', 'memberId'])
  })
})

// =============================================================================
// parseDevupOperations
// =============================================================================

describe('parseDevupOperations', () => {
  test('returns empty array for document with empty paths object', () => {
    const result = parseDevupOperations(createDocument())
    expect(result).toEqual([])
  })

  test('returns empty array for document with undefined paths', () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
    } as OpenAPIV3_1.Document
    const result = parseDevupOperations(doc)
    expect(result).toEqual([])
  })

  test('extracts GET operations with devup:one tag', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['devup:user:one'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      method: 'get',
      path: '/users/{id}',
      operationId: 'getUser',
      params: ['id'],
    })
    expect(result[0]?.tags).toHaveLength(1)
    expect(result[0]?.tags[0]?.mode).toBe('one')
  })

  test('extracts POST operations with devup:create tag', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              tags: ['devup:user:create'],
              responses: { '201': { description: 'Created' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      method: 'post',
      path: '/users',
      operationId: 'createUser',
    })
  })

  test('extracts PUT operations with devup:edit tag', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            put: {
              operationId: 'updateUser',
              tags: ['devup:user:edit'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      method: 'put',
      operationId: 'updateUser',
    })
    expect(result[0]?.tags[0]?.mode).toBe('edit')
  })

  test('extracts PATCH operations with devup:fix tag', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            patch: {
              operationId: 'patchUser',
              tags: ['devup:user:fix'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      method: 'patch',
      operationId: 'patchUser',
    })
    expect(result[0]?.tags[0]?.mode).toBe('fix')
  })

  test('ignores DELETE operations (not supported in CRUD modes)', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            delete: {
              operationId: 'deleteUser',
              tags: ['devup:user:one'], // Invalid - delete shouldn't have devup tags
              responses: { '204': { description: 'Deleted' } },
            },
          },
        },
      }),
    )

    expect(result).toEqual([])
  })

  test('ignores operations without tags', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toEqual([])
  })

  test('ignores operations with non-devup tags only', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['users', 'public'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toEqual([])
  })

  test('ignores mismatched method and mode', () => {
    // GET with create mode should be ignored (create is for POST)
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              tags: ['devup:user:create'], // Invalid - GET can't be create
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toEqual([])
  })

  test('handles multiple operations in same path', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['devup:user:one'],
              responses: { '200': { description: 'Success' } },
            },
            put: {
              operationId: 'updateUser',
              tags: ['devup:user:edit'],
              responses: { '200': { description: 'Success' } },
            },
            patch: {
              operationId: 'patchUser',
              tags: ['devup:user:fix'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.method).sort()).toEqual(['get', 'patch', 'put'])
  })

  test('handles null pathItem', () => {
    const result = parseDevupOperations(
      createDocument({
        paths: {
          '/users': null as never,
        },
      }),
    )

    expect(result).toEqual([])
  })
})

// =============================================================================
// buildCrudConfigs
// =============================================================================

describe('buildCrudConfigs', () => {
  test('builds config from operations with one and create endpoints', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                    },
                    required: ['name', 'email'],
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result).toHaveProperty('user')
    expect(result.user).toMatchObject({
      name: 'user',
      one: {
        method: 'get',
        operationId: 'getUser',
      },
      create: {
        method: 'post',
        operationId: 'createUser',
      },
    })
    expect(result.user?.create.fields).toHaveLength(2)
  })

  test('builds config with optional edit endpoint', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
          put: {
            operationId: 'updateUser',
            tags: ['devup:user:edit'],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.edit).toMatchObject({
      method: 'put',
      operationId: 'updateUser',
    })
  })

  test('builds config with optional fix endpoint', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
          patch: {
            operationId: 'patchUser',
            tags: ['devup:user:fix'],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.fix).toMatchObject({
      method: 'patch',
      operationId: 'patchUser',
    })
  })

  test('filters out incomplete configs (missing one)', () => {
    const doc = createDocument({
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result).not.toHaveProperty('user')
  })

  test('filters out incomplete configs (missing create)', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result).not.toHaveProperty('user')
  })

  test('handles multiple CRUD groups', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
        '/posts/{id}': {
          get: {
            operationId: 'getPost',
            tags: ['devup:post:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/posts': {
          post: {
            operationId: 'createPost',
            tags: ['devup:post:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('post')
  })

  test('extracts field metadata from request body', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', minLength: 1, maxLength: 100 },
                      age: { type: 'integer', minimum: 0, maximum: 150 },
                      email: { type: 'string', format: 'email' },
                      status: { type: 'string', enum: ['active', 'inactive'] },
                      bio: { type: 'string', description: 'User biography' },
                      pattern_field: { type: 'string', pattern: '^[a-z]+$' },
                    },
                    required: ['name', 'email'],
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    const fields = result.user?.create.fields
    expect(fields).toBeDefined()

    const nameField = fields?.find((f) => f.name === 'name')
    expect(nameField).toMatchObject({
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
    })

    const ageField = fields?.find((f) => f.name === 'age')
    expect(ageField).toMatchObject({
      type: 'integer',
      required: false,
      minimum: 0,
      maximum: 150,
    })

    const emailField = fields?.find((f) => f.name === 'email')
    expect(emailField).toMatchObject({
      type: 'string',
      format: 'email',
      required: true,
    })

    const statusField = fields?.find((f) => f.name === 'status')
    expect(statusField).toMatchObject({
      type: 'string',
      enum: ['active', 'inactive'],
    })

    const bioField = fields?.find((f) => f.name === 'bio')
    expect(bioField).toMatchObject({
      description: 'User biography',
    })

    const patternField = fields?.find((f) => f.name === 'pattern_field')
    expect(patternField).toMatchObject({
      pattern: '^[a-z]+$',
    })
  })

  test('handles $ref in request body schema', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
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
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    const fields = result.user?.create.fields
    expect(fields).toHaveLength(2)
    expect(fields?.find((f) => f.name === 'name')?.required).toBe(true)
    expect(fields?.find((f) => f.name === 'email')?.required).toBe(false)
  })

  test('handles requestBody with $ref at top level', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              $ref: '#/components/requestBodies/CreateUserBody',
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
      components: {
        requestBodies: {
          CreateUserBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    // RequestBody $ref at top level returns empty fields (not resolved)
    expect(result.user?.create.fields).toEqual([])
  })

  test('handles missing operationId (warns and skips)', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    // Without operationId on 'one', config is incomplete
    expect(result).not.toHaveProperty('user')
  })

  test('handles request body without json content', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'text/plain': {
                  schema: { type: 'string' },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.create.fields).toEqual([])
  })

  test('handles schema without properties', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'string' }, // Not an object
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.create.fields).toEqual([])
  })

  test('handles property with $ref that cannot be resolved', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      nested: { $ref: '#/components/schemas/NonExistent' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    // $ref properties are skipped, only 'name' is extracted
    const fields = result.user?.create.fields
    expect(fields).toHaveLength(1)
    expect(fields?.[0]?.name).toBe('name')
  })

  test('handles unresolvable schema $ref', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NonExistent' },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.create.fields).toEqual([])
  })

  test('handles invalid $ref path format', () => {
    const doc = createDocument({
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            tags: ['devup:user:one'],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/users': {
          post: {
            operationId: 'createUser',
            tags: ['devup:user:create'],
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/invalid/path/Schema' },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      },
    })

    const operations = parseDevupOperations(doc)
    const result = buildCrudConfigs(operations, doc)

    expect(result.user?.create.fields).toEqual([])
  })
})

// =============================================================================
// parseCrudConfigs
// =============================================================================

describe('parseCrudConfigs', () => {
  test('parses complete CRUD config from document', () => {
    const result = parseCrudConfigs(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['devup:user:one'],
              responses: { '200': { description: 'Success' } },
            },
          },
          '/users': {
            post: {
              operationId: 'createUser',
              tags: ['devup:user:create'],
              responses: { '201': { description: 'Created' } },
            },
          },
        },
      }),
    )

    expect(result).toHaveProperty('user')
    expect(result.user?.name).toBe('user')
    expect(result.user?.one.operationId).toBe('getUser')
    expect(result.user?.create.operationId).toBe('createUser')
  })

  test('returns empty object for document without devup tags', () => {
    const result = parseCrudConfigs(
      createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['users'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    )

    expect(result).toEqual({})
  })
})

// =============================================================================
// parseCrudConfigsFromMultiple
// =============================================================================

describe('parseCrudConfigsFromMultiple', () => {
  test('merges configs from multiple documents', () => {
    const result = parseCrudConfigsFromMultiple({
      'main.json': createDocument({
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              tags: ['devup:user:one'],
              responses: { '200': { description: 'Success' } },
            },
          },
          '/users': {
            post: {
              operationId: 'createUser',
              tags: ['devup:user:create'],
              responses: { '201': { description: 'Created' } },
            },
          },
        },
      }),
      'admin.json': createDocument({
        paths: {
          '/posts/{id}': {
            get: {
              operationId: 'getPost',
              tags: ['devup:post:one'],
              responses: { '200': { description: 'Success' } },
            },
          },
          '/posts': {
            post: {
              operationId: 'createPost',
              tags: ['devup:post:create'],
              responses: { '201': { description: 'Created' } },
            },
          },
        },
      }),
    })

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('post')
  })

  test('returns empty object for empty documents map', () => {
    const result = parseCrudConfigsFromMultiple({})
    expect(result).toEqual({})
  })

  test('handles documents without any valid configs', () => {
    const result = parseCrudConfigsFromMultiple({
      'empty.json': createDocument({}),
      'nodevup.json': createDocument({
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              tags: ['users'],
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toEqual({})
  })
})
