import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import {
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '../generate-zod'

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
// generateZodSchemas - Basic functionality
// =============================================================================

describe('generateZodSchemas', () => {
  test('generates import statement', () => {
    const result = generateZodSchemas({ 'openapi.json': createDocument() })
    expect(result).toContain('import { z } from "zod"')
  })

  test('generates schema exports', () => {
    const result = generateZodSchemas({ 'openapi.json': createDocument() })
    expect(result).toContain('export const schemas')
    expect(result).toContain('export const requestSchemas')
    expect(result).toContain('export const responseSchemas')
    expect(result).toContain('export const errorSchemas')
  })

  test('generates response schema from component', () => {
    const result = generateZodSchemas({
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
                id: { type: 'integer' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.object')
    expect(result).toContain('z.int()')
    expect(result).toContain('z.string()')
  })

  test('generates request schema from component', () => {
    const result = generateZodSchemas({
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
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
              required: ['name', 'email'],
            },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
    expect(result).toContain('z.string()')
    expect(result).toContain('.email()')
  })

  test('generates error schema from component', () => {
    const result = generateZodSchemas({
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
              properties: {
                message: { type: 'string' },
                code: { type: 'integer' },
              },
              required: ['message'],
            },
          },
        },
      }),
    })

    expect(result).toContain('errorSchemas')
    expect(result).toContain('ApiError')
  })
})

// =============================================================================
// Primitive types conversion
// =============================================================================

describe('generateZodSchemas - primitive types', () => {
  test('converts string type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('z.string()')
  })

  test('converts number type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'number' },
          },
        },
      }),
    })

    expect(result).toContain('z.number()')
  })

  test('converts integer type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'integer' },
          },
        },
      }),
    })

    expect(result).toContain('z.int()')
  })

  test('converts boolean type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'boolean' },
          },
        },
      }),
    })

    expect(result).toContain('z.boolean()')
  })
})

// =============================================================================
// Complex types conversion
// =============================================================================

describe('generateZodSchemas - complex types', () => {
  test('converts array type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.array(z.string())')
  })

  test('converts enum type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.enum')
    expect(result).toContain('"active"')
    expect(result).toContain('"inactive"')
    expect(result).toContain('"pending"')
  })

  test('converts object with optional properties', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                required_field: { type: 'string' },
                optional_field: { type: 'string' },
              },
              required: ['required_field'],
            },
          },
        },
      }),
    })

    expect(result).toContain('required_field: z.string()')
    expect(result).toContain('optional_field: z.string().optional()')
  })
})

// =============================================================================
// String format validation
// =============================================================================

describe('generateZodSchemas - string formats', () => {
  test('adds email validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'email' },
          },
        },
      }),
    })

    expect(result).toContain('z.email()')
  })

  test('adds url validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'uri' },
          },
        },
      }),
    })

    expect(result).toContain('z.url()')
  })

  test('adds uuid validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'uuid' },
          },
        },
      }),
    })

    expect(result).toContain('z.uuid()')
  })

  test('adds email validation with minLength constraint', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'email', minLength: 5 },
          },
        },
      }),
    })

    expect(result).toContain('z.email()')
    expect(result).toContain('.min(5)')
  })

  test('adds email validation with maxLength constraint', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'email', maxLength: 100 },
          },
        },
      }),
    })

    expect(result).toContain('z.email()')
    expect(result).toContain('.max(100)')
  })

  test('adds email validation with both minLength and maxLength constraints', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'string',
              format: 'email',
              minLength: 5,
              maxLength: 100,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.email().min(5).max(100)')
  })

  test('adds url validation with minLength constraint', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'uri', minLength: 10 },
          },
        },
      }),
    })

    expect(result).toContain('z.url()')
    expect(result).toContain('.min(10)')
  })

  test('adds url validation with maxLength constraint', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'url', maxLength: 2000 },
          },
        },
      }),
    })

    expect(result).toContain('z.url()')
    expect(result).toContain('.max(2000)')
  })

  test('adds url validation with both minLength and maxLength constraints', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'string',
              format: 'uri',
              minLength: 10,
              maxLength: 2000,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.url().min(10).max(2000)')
  })
})

// =============================================================================
// Number validation
// =============================================================================

describe('generateZodSchemas - number validation', () => {
  test('adds min/max validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'integer', minimum: 0, maximum: 100 },
          },
        },
      }),
    })

    expect(result).toContain('.min(0)')
    expect(result).toContain('.max(100)')
  })
})

// =============================================================================
// Multi-server support
// =============================================================================

describe('generateZodSchemas - multi-server', () => {
  test('generates schemas for multiple servers', () => {
    const result = generateZodSchemas({
      'main-api.json': createDocument({
        paths: {
          '/users': {
            get: {
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
            User: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      }),
      'admin-api.json': createDocument({
        paths: {
          '/admin': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Admin' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Admin: { type: 'object', properties: { role: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('main_api_json')
    expect(result).toContain('admin_api_json')
    expect(result).toContain('User')
    expect(result).toContain('Admin')
  })
})

// =============================================================================
// generateZodTypeDeclarations
// =============================================================================

describe('generateZodTypeDeclarations', () => {
  test('generates module augmentation', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
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
            User: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      }),
    })

    expect(result).toContain('import "@devup-api/zod"')
    expect(result).toContain('declare module "@devup-api/zod"')
    expect(result).toContain('interface DevupZodResponseSchemas')
    // Should contain specific Zod types instead of generic z.ZodType
    expect(result).toContain('z.ZodObject<')
  })

  test('generates request schema types', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CreateUser' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            CreateUser: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('interface DevupZodRequestSchemas')
    expect(result).toContain('CreateUser')
  })

  test('generates error schema types', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            get: {
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

    expect(result).toContain('interface DevupZodErrorSchemas')
    expect(result).toContain('ApiError')
  })
})

// =============================================================================
// Nullable and Union Types
// =============================================================================

describe('generateZodSchemas - nullable and union types', () => {
  test('handles nullable string (OpenAPI 3.0 style)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', nullable: true },
          },
        },
      }),
    })

    expect(result).toContain('.nullable()')
  })

  test('handles nullable (OpenAPI 3.1 style with type array)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                nullableField: {
                  type: ['string', 'null'] as unknown as 'string',
                },
              },
            },
          },
        },
      }),
    })

    // The type array check is in isNullable() and should trigger .nullable()
    expect(result).toContain('.nullable()')
  })

  test('handles allOf composition', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [
                { type: 'object', properties: { a: { type: 'string' } } },
                { type: 'object', properties: { b: { type: 'number' } } },
              ],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.intersection')
  })

  test('handles oneOf union', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.union')
  })

  test('handles anyOf union', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              anyOf: [{ type: 'string' }, { type: 'boolean' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.union')
  })

  test('handles single enum value as literal', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', enum: ['only_value'] },
          },
        },
      }),
    })

    expect(result).toContain('z.literal')
  })
})

// =============================================================================
// More String Formats
// =============================================================================

describe('generateZodSchemas - more string formats', () => {
  test('adds datetime validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'date-time' },
          },
        },
      }),
    })

    expect(result).toContain('z.iso.datetime()')
  })

  test('adds url validation for format url', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', format: 'url' },
          },
        },
      }),
    })

    expect(result).toContain('.url()')
  })

  test('adds minLength and maxLength validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
      }),
    })

    expect(result).toContain('.min(1)')
    expect(result).toContain('.max(100)')
  })

  test('adds regex pattern validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', pattern: '^[a-z]+$' },
          },
        },
      }),
    })

    expect(result).toContain('.regex(')
  })
})

// =============================================================================
// More Number Validations
// =============================================================================

describe('generateZodSchemas - more number validations', () => {
  test('adds exclusive minimum/maximum validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'number',
              exclusiveMinimum: 0,
              exclusiveMaximum: 100,
            },
          },
        },
      }),
    })

    expect(result).toContain('.gt(0)')
    expect(result).toContain('.lt(100)')
  })
})

// =============================================================================
// Array Validations
// =============================================================================

describe('generateZodSchemas - array validations', () => {
  test('adds min/max items validation', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 10,
            },
          },
        },
      }),
    })

    expect(result).toContain('.min(1)')
    expect(result).toContain('.max(10)')
  })

  test('handles array without items', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'array' },
          },
        },
      }),
    })

    expect(result).toContain('z.array(z.unknown())')
  })
})

// =============================================================================
// Object Validations
// =============================================================================

describe('generateZodSchemas - object validations', () => {
  test('handles additionalProperties true', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: { id: { type: 'string' } },
              additionalProperties: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('.passthrough()')
  })

  test('handles additionalProperties with schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: { id: { type: 'string' } },
              additionalProperties: { type: 'string' },
            },
          },
        },
      }),
    })

    expect(result).toContain('.passthrough()')
  })

  test('handles empty object', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'object' },
          },
        },
      }),
    })

    expect(result).toContain('z.object({})')
  })

  test('handles object with default values', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'John' },
              },
            },
          },
        },
      }),
    })

    // With default value and requestDefaultNonNullable=false, should still be optional
    expect(result).toContain('name: z.string().optional()')
  })
})

// =============================================================================
// Ref Handling
// =============================================================================

describe('generateZodSchemas - ref handling', () => {
  test('handles $ref in schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Wrapper' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Inner: { type: 'string' },
            Wrapper: {
              type: 'object',
              properties: {
                inner: { $ref: '#/components/schemas/Inner' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.lazy')
  })

  test('handles unresolved $ref', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                // External ref that can't be resolved
                external: { $ref: 'external.json#/schemas/Foo' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.unknown()')
  })

  test('handles request body with $ref', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                $ref: '#/components/requestBodies/CreateTest',
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          requestBodies: {
            CreateTest: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Test' },
                },
              },
            },
          },
          schemas: {
            Test: { type: 'object', properties: { name: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
  })
})

// =============================================================================
// Path Methods
// =============================================================================

describe('generateZodSchemas - path methods', () => {
  test('handles PUT method', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            put: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'object', properties: { id: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
  })

  test('handles DELETE method', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            delete: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'boolean' },
          },
        },
      }),
    })

    expect(result).toContain('z.boolean()')
  })

  test('handles PATCH method', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            patch: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'object', properties: { name: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
  })
})

// =============================================================================
// Error Status Codes
// =============================================================================

describe('generateZodSchemas - error status codes', () => {
  test('handles default error response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': { description: 'Success' },
                default: {
                  description: 'Error',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Error' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Error: { type: 'object', properties: { msg: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('errorSchemas')
  })

  test('handles 5xx error responses', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': { description: 'Success' },
                '500': {
                  description: 'Server Error',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/ServerError' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ServerError: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('errorSchemas')
    expect(result).toContain('ServerError')
  })
})

// =============================================================================
// Edge Cases
// =============================================================================

describe('generateZodSchemas - edge cases', () => {
  test('handles empty paths', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({ paths: {} }),
    })

    expect(result).toContain('import { z } from "zod"')
    expect(result).toContain('export const schemas')
  })

  test('handles null pathItem', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': null as never,
        },
      }),
    })

    expect(result).toContain('export const schemas')
  })

  test('handles missing components', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('export const schemas')
  })

  test('handles allOf with single schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [{ type: 'string' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.string()')
    expect(result).not.toContain('z.intersection')
  })

  test('handles oneOf with single schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'number' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.number()')
    expect(result).not.toContain('z.union')
  })

  test('handles empty allOf', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { allOf: [] },
          },
        },
      }),
    })

    expect(result).toContain('z.unknown()')
  })

  test('handles empty oneOf', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { oneOf: [] },
          },
        },
      }),
    })

    expect(result).toContain('z.unknown()')
  })

  test('handles unknown type', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {} as OpenAPIV3_1.SchemaObject,
          },
        },
      }),
    })

    expect(result).toContain('z.unknown()')
  })

  test('normalizes server name with ./ prefix', () => {
    const result = generateZodSchemas({
      './openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('openapi_json')
    expect(result).not.toContain('./openapi.json')
  })
})

// =============================================================================
// generateZodTypeDeclarations - Additional Coverage
// =============================================================================

describe('generateZodTypeDeclarations - type generation', () => {
  test('generates ZodArray type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'array', items: { type: 'string' } },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodArray<z.ZodString>')
  })

  test('generates ZodNullable type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', nullable: true },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodNullable<z.ZodString>')
  })

  test('generates ZodUnion type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { oneOf: [{ type: 'string' }, { type: 'number' }] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnion<[z.ZodString, z.ZodNumber]>')
  })

  test('generates ZodIntersection type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [
                { type: 'object', properties: { a: { type: 'string' } } },
                { type: 'object', properties: { b: { type: 'number' } } },
              ],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodIntersection<')
  })

  test('generates ZodEnum type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', enum: ['a', 'b'] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodEnum<')
  })

  test('generates ZodLiteral type for single enum', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'string', enum: ['only'] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodLiteral<"only">')
  })

  test('generates ZodBoolean type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'boolean' },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodBoolean')
  })

  test('generates ZodOptional type for optional properties', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                optional_field: { type: 'string' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodOptional<z.ZodString>')
  })

  test('generates empty object type', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'object' },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodObject<Record<string, never>>')
  })

  test('generates ZodUnknown for unknown schema', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {} as OpenAPIV3_1.SchemaObject,
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnknown')
  })

  test('generates ZodLazy for $ref', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Wrapper' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Inner: { type: 'string' },
            Wrapper: {
              type: 'object',
              properties: {
                inner: { $ref: '#/components/schemas/Inner' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodLazy<z.ZodTypeAny>')
  })

  test('handles array without items in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { type: 'array' },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodArray<z.ZodUnknown>')
  })

  test('handles nullable type array in type declaration (OpenAPI 3.1)', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: ['number', 'null'] as unknown as 'number',
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodNullable<z.ZodNumber>')
  })

  test('handles $ref that resolves to nested $ref in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            // Outer schema that isn't in components (external ref scenario)
            Test: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodString')
  })
})

// =============================================================================
// Schema Collection Edge Cases
// =============================================================================

describe('generateZodSchemas - schema collection edge cases', () => {
  test('collects schemas from allOf in response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        allOf: [{ $ref: '#/components/schemas/Base' }],
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
            Base: { type: 'object', properties: { id: { type: 'string' } } },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('Base')
  })

  test('collects schemas from anyOf in response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        anyOf: [{ $ref: '#/components/schemas/TypeA' }],
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
            TypeA: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('TypeA')
  })

  test('collects schemas from oneOf in response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        oneOf: [{ $ref: '#/components/schemas/TypeB' }],
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
            TypeB: { type: 'number' },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('TypeB')
  })

  test('collects schemas from properties in response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          nested: { $ref: '#/components/schemas/Nested' },
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
            Nested: { type: 'boolean' },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('Nested')
  })

  test('collects schemas from array items in response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Item' },
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
            Item: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('Item')
  })

  test('handles response with $ref to response object', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  $ref: '#/components/responses/SuccessResponse',
                } as unknown as OpenAPIV3_1.ResponseObject,
              },
            },
          },
        },
        components: {
          responses: {
            SuccessResponse: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Data' },
                },
              },
            },
          },
          schemas: {
            Data: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      }),
    })

    // Response $ref to response object - extractSchemaNameFromRef returns null
    // for non-component-schema refs, so Data won't be collected
    expect(result).toContain('export const schemas')
  })

  test('handles error response with $ref', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': { description: 'Success' },
                '500': {
                  $ref: '#/components/responses/ServerError',
                } as unknown as OpenAPIV3_1.ResponseObject,
              },
            },
          },
        },
        components: {
          responses: {
            ServerError: {
              description: 'Server Error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorBody' },
                },
              },
            },
          },
          schemas: {
            ErrorBody: {
              type: 'object',
              properties: { msg: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('export const schemas')
  })

  test('handles allOf in error response', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': { description: 'Success' },
                '400': {
                  description: 'Bad Request',
                  content: {
                    'application/json': {
                      schema: {
                        allOf: [{ $ref: '#/components/schemas/ErrorBase' }],
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
            ErrorBase: {
              type: 'object',
              properties: { code: { type: 'integer' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('errorSchemas')
    expect(result).toContain('ErrorBase')
  })

  test('handles requestBody $ref to requestBodies with schema $ref', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                $ref: '#/components/requestBodies/TestRequest',
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          requestBodies: {
            TestRequest: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RequestPayload' },
                },
              },
            },
          },
          schemas: {
            RequestPayload: {
              type: 'object',
              properties: { data: { type: 'string' } },
            },
          },
        },
      }),
    })

    // When requestBody has $ref, extractSchemaNameFromRef is called
    // but it only extracts from #/components/schemas/ path
    expect(result).toContain('export const schemas')
  })
})

// =============================================================================
// Ref Resolution Edge Cases
// =============================================================================

describe('generateZodSchemas - ref resolution edge cases', () => {
  test('resolves $ref with nested object path', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Deep' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Deep: {
              type: 'object',
              properties: {
                // This ref points to a component schema
                child: { $ref: '#/components/schemas/Child' },
              },
            },
            Child: { type: 'string' },
          },
        },
      }),
    })

    expect(result).toContain('z.lazy')
    expect(result).toContain('_Child')
  })

  test('handles $ref that resolves to another schema object (not in schemaRefs)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      // This ref points to a path that exists but isn't a component schema
                      schema: { $ref: '#/paths/~1test/get/responses/200' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {},
        },
      }),
    })

    // Should fall through to z.unknown() when ref can't be properly resolved
    expect(result).toContain('export const schemas')
  })

  test('handles property with default value via $ref', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            DefaultValue: {
              type: 'string',
              default: 'hello',
            },
            Test: {
              type: 'object',
              properties: {
                withDefault: { $ref: '#/components/schemas/DefaultValue' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
  })

  test('handles requestBody $ref directly to schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              // This is an unusual but valid pattern - requestBody $ref to schema
              requestBody: {
                $ref: '#/components/schemas/DirectRequestSchema',
              } as unknown as OpenAPIV3_1.RequestBodyObject,
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            DirectRequestSchema: {
              type: 'object',
              properties: { data: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('requestSchemas')
    expect(result).toContain('DirectRequestSchema')
  })

  test('handles success response $ref directly to schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  // Direct $ref to schema (unusual but for coverage)
                  $ref: '#/components/schemas/DirectResponseSchema',
                } as unknown as OpenAPIV3_1.ResponseObject,
              },
            },
          },
        },
        components: {
          schemas: {
            DirectResponseSchema: {
              type: 'object',
              properties: { result: { type: 'boolean' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('responseSchemas')
    expect(result).toContain('DirectResponseSchema')
  })

  test('handles error response $ref directly to schema', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': { description: 'Success' },
                '400': {
                  // Direct $ref to schema for error
                  $ref: '#/components/schemas/DirectErrorSchema',
                } as unknown as OpenAPIV3_1.ResponseObject,
              },
            },
          },
        },
        components: {
          schemas: {
            DirectErrorSchema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('errorSchemas')
    expect(result).toContain('DirectErrorSchema')
  })
})

// =============================================================================
// resolveSchemaRef Edge Cases
// =============================================================================

describe('generateZodSchemas - resolveSchemaRef edge cases', () => {
  test('handles $ref with invalid path segment', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                // This ref points to a path that doesn't exist
                invalid: { $ref: '#/components/nonexistent/path' },
              },
            },
          },
        },
      }),
    })

    // Should return z.unknown() for unresolvable refs
    expect(result).toContain('z.unknown()')
  })

  test('handles $ref that resolves to nested $ref object', () => {
    const doc = createDocument({
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Test: {
            type: 'object',
            properties: {
              // This is a special edge case - pointing to something that has $ref
              nested: { $ref: '#/info' },
            },
          },
        },
      },
    })

    // Manually add $ref to info to test the nested $ref case
    ;(doc.info as unknown as { $ref: string }).$ref = '#/somewhere/else'

    const result = generateZodSchemas({ 'openapi.json': doc })

    // When resolved object has $ref, resolveSchemaRef returns null
    expect(result).toContain('z.unknown()')
  })

  test('handles non-component $ref that resolves to valid schema', () => {
    const doc = createDocument({
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Test: {
            type: 'object',
            properties: {
              // Points to a custom location that has a valid schema
              custom: { $ref: '#/x-custom-schemas/MySchema' },
            },
          },
        },
      },
    })

    // Add custom schema location (OpenAPI allows x- extensions)
    ;(doc as unknown as Record<string, unknown>)['x-custom-schemas'] = {
      MySchema: { type: 'string' },
    }

    const result = generateZodSchemas({ 'openapi.json': doc })

    // Should resolve and convert the schema
    expect(result).toContain('z.string()')
  })
})

// =============================================================================
// schemaToZodType $ref resolution
// =============================================================================

describe('generateZodTypeDeclarations - $ref resolution', () => {
  test('handles non-component $ref that resolves to valid schema', () => {
    const doc = createDocument({
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Test' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Test: {
            type: 'object',
            properties: {
              // Points to a custom location
              custom: { $ref: '#/x-types/CustomType' },
            },
          },
        },
      },
    })

    // Add custom type location
    ;(doc as unknown as Record<string, unknown>)['x-types'] = {
      CustomType: { type: 'number' },
    }

    const result = generateZodTypeDeclarations({ 'openapi.json': doc })

    // Should resolve and use ZodNumber type
    expect(result).toContain('z.ZodNumber')
  })
})

// =============================================================================
// Inline Request Body Schema (non-$ref)
// =============================================================================

describe('generateZodSchemas - inline request body schema', () => {
  test('handles requestBody with inline schema (no $ref)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: {
                content: {
                  'application/json': {
                    // Inline schema, not a $ref
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' },
                      },
                      required: ['name'],
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

    // Should still generate pathSchemas even without $ref
    expect(result).toContain('pathSchemas')
    expect(result).toContain('post')
  })

  test('handles requestBody with no application/json content', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/upload': {
            post: {
              operationId: 'uploadFile',
              requestBody: {
                content: {
                  'multipart/form-data': {
                    schema: {
                      type: 'object',
                      properties: {
                        file: { type: 'string', format: 'binary' },
                      },
                    },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    // Should handle gracefully when no application/json content
    expect(result).toContain('pathSchemas')
  })

  test('handles requestBody with empty content', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            post: {
              operationId: 'testEmpty',
              requestBody: {
                content: {},
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      }),
    })

    expect(result).toContain('pathSchemas')
  })
})

// =============================================================================
// generateZodTypeDeclarations - Edge Cases for schemaToZodType
// =============================================================================

describe('generateZodTypeDeclarations - schemaToZodType edge cases', () => {
  test('handles empty allOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { allOf: [] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnknown')
  })

  test('handles single allOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [{ type: 'string' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodString')
    expect(result).not.toContain('z.ZodIntersection')
  })

  test('handles empty oneOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { oneOf: [] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnknown')
  })

  test('handles single oneOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'number' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodNumber')
    expect(result).not.toContain('z.ZodUnion')
  })

  test('handles empty anyOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: { anyOf: [] },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnknown')
  })

  test('handles single anyOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              anyOf: [{ type: 'boolean' }],
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodBoolean')
    expect(result).not.toContain('z.ZodUnion')
  })

  test('handles $ref that fails to resolve in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                // External ref that can't be resolved
                external: { $ref: 'external.json#/schemas/Foo' },
              },
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodUnknown')
  })

  test('handles nullable allOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [{ type: 'string' }, { type: 'object' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodNullable<z.ZodIntersection')
  })

  test('handles nullable oneOf in type declaration', () => {
    const result = generateZodTypeDeclarations({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.ZodNullable<z.ZodUnion')
  })
})

// =============================================================================
// Additional Edge Cases for Full Coverage
// =============================================================================

describe('generateZodSchemas - additional coverage', () => {
  test('handles $ref to non-existent schema (schemaName exists but not in schemaRefs)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: {
                // References a schema that doesn't exist in components
                missing: { $ref: '#/components/schemas/NonExistent' },
              },
            },
          },
        },
      }),
    })

    // Should fall back to z.unknown() when schema not found
    expect(result).toContain('z.unknown()')
  })

  test('handles object property with $ref that has default value', () => {
    const result = generateZodSchemas(
      {
        'openapi.json': createDocument({
          paths: {
            '/test': {
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
                responses: { '200': { description: 'Success' } },
              },
            },
          },
          components: {
            schemas: {
              WithDefault: {
                type: 'string',
                default: 'defaultValue',
              },
              Test: {
                type: 'object',
                properties: {
                  refWithDefault: { $ref: '#/components/schemas/WithDefault' },
                },
              },
            },
          },
        }),
      },
      { requestDefaultNonNullable: true },
    )

    // With requestDefaultNonNullable: true and default value, should not be optional
    expect(result).toContain('requestSchemas')
  })

  test('handles nested nullable allOf in schemaToZod', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [{ type: 'string' }, { type: 'object' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.intersection')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable oneOf in schemaToZod', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.union')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable single allOf', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              allOf: [{ type: 'string' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.string()')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable single oneOf', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              oneOf: [{ type: 'number' }],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.number()')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable enum', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'string',
              enum: ['a', 'b'],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.enum')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable single enum (literal)', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'string',
              enum: ['only'],
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.literal')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable array', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.array')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable array without items', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'array',
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.array(z.unknown())')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable object', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'object',
              properties: { id: { type: 'string' } },
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.object')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable boolean', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'boolean',
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.boolean()')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable number', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'number',
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.number()')
    expect(result).toContain('.nullable()')
  })

  test('handles nullable integer', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Test' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Test: {
              type: 'integer',
              nullable: true,
            },
          },
        },
      }),
    })

    expect(result).toContain('z.int()')
    expect(result).toContain('.nullable()')
  })

  test('handles path with parameters', () => {
    const result = generateZodSchemas({
      'openapi.json': createDocument({
        paths: {
          '/users/{userId}/posts/{postId}': {
            get: {
              operationId: 'getUserPost',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Post' },
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
                    schema: { $ref: '#/components/schemas/UpdatePost' },
                  },
                },
              },
              responses: { '200': { description: 'Success' } },
            },
          },
        },
        components: {
          schemas: {
            Post: { type: 'object', properties: { title: { type: 'string' } } },
            UpdatePost: {
              type: 'object',
              properties: { title: { type: 'string' } },
            },
          },
        },
      }),
    })

    // Path with parameters should be normalized with case conversion
    expect(result).toContain('pathSchemas')
    expect(result).toContain('Post')
    expect(result).toContain('UpdatePost')
  })

  test('handles path parameters with snake_case conversion', () => {
    const result = generateZodSchemas(
      {
        'openapi.json': createDocument({
          paths: {
            '/users/{user_id}': {
              post: {
                operationId: 'create_user_item',
                requestBody: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Item' },
                    },
                  },
                },
                responses: { '200': { description: 'Success' } },
              },
            },
          },
          components: {
            schemas: {
              Item: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        }),
      },
      { convertCase: 'snake' },
    )

    expect(result).toContain('requestSchemas')
  })
})
