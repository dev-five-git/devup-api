/** biome-ignore-all lint/suspicious/noExplicitAny: test */
import { expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'

const createDocument = (
  document: Partial<OpenAPIV3_1.Document> = {},
): OpenAPIV3_1.Document =>
  ({
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    ...document,
  }) as OpenAPIV3_1.Document

// Helper function to convert Document to Record format for testing
const createSchemas = (
  document: OpenAPIV3_1.Document,
  fileName = 'openapi.json',
): Record<string, OpenAPIV3_1.Document> => ({
  [fileName]: document,
})

test.each([
  [
    {
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            responses: {},
          },
        },
      },
    },
  ],
  [
    {
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            responses: {
              '200': {
                description: 'List of users',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            responses: {
              '201': {
                description: 'User created',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
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
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  ],
] as const)('generateInterface returns interface for schema: %s', (schema) => {
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test nullable properties (OpenAPI 3.0 style)
test('generateInterface handles nullable properties (OpenAPI 3.0 style)', () => {
  const schema = {
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
                      name: { type: 'string', nullable: true },
                      age: { type: 'number', nullable: true },
                      active: { type: 'boolean', nullable: true },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                        nullable: true,
                      },
                      metadata: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          key: { type: 'string' },
                        },
                      },
                      status: {
                        type: 'string',
                        enum: ['active', 'inactive'],
                        nullable: true,
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
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test nullable properties (OpenAPI 3.1 style with type array)
test('generateInterface handles nullable properties (OpenAPI 3.1 style)', () => {
  const schema = {
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
                      name: { type: ['string', 'null'] },
                      age: { type: ['number', 'null'] },
                      active: { type: ['boolean', 'null'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test nullable in component schemas
test('generateInterface handles nullable in component schemas', () => {
  const schema = {
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
                    $ref: '#/components/schemas/User',
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
          properties: {
            id: { type: 'string' },
            nickname: { type: 'string', nullable: true },
            bio: { type: ['string', 'null'] },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test all HTTP methods
test('generateInterface handles all HTTP methods', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
        post: {
          operationId: 'createUser',
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
        put: {
          operationId: 'updateUser',
          responses: {
            '200': {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
        delete: {
          operationId: 'deleteUser',
          responses: {
            '204': {
              description: 'Deleted',
            },
          },
        },
        patch: {
          operationId: 'patchUser',
          responses: {
            '200': {
              description: 'Patched',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test path parameters
test('generateInterface handles path parameters', () => {
  const schema = {
    paths: {
      '/users/{userId}': {
        get: {
          operationId: 'getUser',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test query parameters
test('generateInterface handles query parameters', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'number' },
            },
            {
              name: 'limit',
              in: 'query',
              required: true,
              schema: { type: 'number' },
            },
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test path and query parameters together
test('generateInterface handles path and query parameters together', () => {
  const schema = {
    paths: {
      '/users/{userId}/posts': {
        get: {
          operationId: 'getUserPosts',
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
              schema: { type: 'number' },
            },
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test request body
test('generateInterface handles request body', () => {
  const schema = {
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
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test request body with $ref
test('generateInterface handles request body with $ref', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
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
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response with 200 status
test('generateInterface handles 200 response', () => {
  const schema = {
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
                    items: {
                      $ref: '#/components/schemas/User',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response with 201 status
test('generateInterface handles 201 response', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
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
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response with other status codes (fallback)
test('generateInterface handles response with other status codes', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '202': {
              description: 'Accepted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error responses
test('generateInterface handles error responses', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Not Found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
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
      schemas: {
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test default error response
test('generateInterface handles default error response', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
            default: {
              description: 'Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test component schemas for request
test('generateInterface handles component schemas for request', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateUserRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
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
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test component schemas for response
test('generateInterface handles component schemas for response', () => {
  const schema = {
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
                    $ref: '#/components/schemas/User',
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
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test component schemas for error
test('generateInterface handles component schemas for error', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
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
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test array response with component schema
test('generateInterface handles array response with component schema', () => {
  const schema = {
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
                    items: {
                      $ref: '#/components/schemas/User',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test operationId and path keys
test('generateInterface creates both operationId and path keys', () => {
  const schema = {
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
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test without operationId
test('generateInterface handles endpoints without operationId', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test requestDefaultNonNullable option
test('generateInterface handles requestDefaultNonNullable option', () => {
  const schema = {
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
                    name: { type: 'string', default: 'John' },
                    email: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any)), {
      requestDefaultNonNullable: true,
    }),
  ).toMatchSnapshot()
  expect(
    generateInterface(createSchemas(createDocument(schema as any)), {
      requestDefaultNonNullable: false,
    }),
  ).toMatchSnapshot()
})

// Test responseDefaultNonNullable option
test('generateInterface handles responseDefaultNonNullable option', () => {
  const schema = {
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
                      id: { type: 'string', default: '123' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any)), {
      responseDefaultNonNullable: true,
    }),
  ).toMatchSnapshot()
  expect(
    generateInterface(createSchemas(createDocument(schema as any)), {
      responseDefaultNonNullable: false,
    }),
  ).toMatchSnapshot()
})

// Test nested schemas in allOf, anyOf, oneOf
test('generateInterface handles nested schemas in allOf', () => {
  const schema = {
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
                    allOf: [
                      { $ref: '#/components/schemas/Base' },
                      {
                        type: 'object',
                        properties: {
                          extra: { type: 'string' },
                        },
                      },
                    ],
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
        Base: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test empty paths
test('generateInterface handles empty paths', () => {
  const schema = {
    paths: {},
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test pathItem parameters
test('generateInterface handles pathItem parameters', () => {
  const schema = {
    paths: {
      '/users/{userId}': {
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        get: {
          operationId: 'getUser',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test requestBody $ref
test('generateInterface handles requestBody $ref', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          requestBody: {
            $ref: '#/components/requestBodies/CreateUser',
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
    components: {
      requestBodies: {
        CreateUser: {
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
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response $ref
test('generateInterface handles response $ref', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              $ref: '#/components/responses/UserList',
            },
          },
        },
      },
    },
    components: {
      responses: {
        UserList: {
          description: 'List of users',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test complex scenario with all features
test('generateInterface handles complex scenario with all features', () => {
  const schema = {
    paths: {
      '/users/{userId}/posts/{postId}': {
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        get: {
          operationId: 'getUserPost',
          parameters: [
            {
              name: 'postId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'include',
              in: 'query',
              required: false,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Post',
                  },
                },
              },
            },
            '404': {
              description: 'Not Found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
        put: {
          operationId: 'updateUserPost',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdatePostRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Post',
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
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        UpdatePostRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test anyOf in schema collection
test('generateInterface handles anyOf in schema collection', () => {
  const schema = {
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
                    anyOf: [
                      { $ref: '#/components/schemas/User' },
                      { $ref: '#/components/schemas/Admin' },
                    ],
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
          properties: {
            id: { type: 'string' },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test oneOf in schema collection
test('generateInterface handles oneOf in schema collection', () => {
  const schema = {
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
                    oneOf: [
                      { $ref: '#/components/schemas/User' },
                      { $ref: '#/components/schemas/Guest' },
                    ],
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
          properties: {
            id: { type: 'string' },
          },
        },
        Guest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test requestBody $ref that extracts schema name
test('generateInterface handles requestBody $ref that extracts schema name', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          requestBody: {
            $ref: '#/components/schemas/CreateUserRequest',
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response $ref that extracts schema name
test('generateInterface handles response $ref that extracts schema name', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              $ref: '#/components/schemas/UserResponse',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test requestBody with $ref that is not a component schema
test('generateInterface handles requestBody with $ref that is not a component schema', () => {
  const schema = {
    paths: {
      '/users': {
        post: {
          operationId: 'createUser',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NonExistent',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: {} },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test response with $ref that is not a component schema
test('generateInterface handles response with $ref that is not a component schema', () => {
  const schema = {
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
                    $ref: '#/components/schemas/NonExistent',
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error response with $ref that is not a component schema
test('generateInterface handles error response with $ref that is not a component schema', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NonExistent',
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test array response with $ref that is not a component schema
test('generateInterface handles array response with $ref that is not a component schema', () => {
  const schema = {
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
                    items: {
                      $ref: '#/components/schemas/NonExistent',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error array response with $ref that is not a component schema
test('generateInterface handles error array response with $ref that is not a component schema', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/NonExistent',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error array response with component schema
test('generateInterface handles error array response with component schema', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Error',
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
      schemas: {
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error response with $ref (response object reference)
test('generateInterface handles error response with $ref to response object', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              $ref: '#/components/responses/BadRequest',
            },
          },
        },
      },
    },
    components: {
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})

// Test error response with $ref that extracts schema name (line 147 coverage)
test('generateInterface handles error response $ref that extracts schema name', () => {
  const schema = {
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
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
              $ref: '#/components/schemas/ServerError',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ServerError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }
  expect(
    generateInterface(createSchemas(createDocument(schema as any))),
  ).toMatchSnapshot()
})
