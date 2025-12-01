/** biome-ignore-all lint/suspicious/noExplicitAny: test */
import { expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import {
  extractParameters,
  extractRequestBody,
  formatTypeValue,
  getTypeFromSchema,
} from '../generate-schema'

const createDocument = (
  document: Partial<OpenAPIV3_1.Document> = {},
): OpenAPIV3_1.Document =>
  ({
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    ...document,
  }) as OpenAPIV3_1.Document

test.each([
  [
    {
      $ref: '#/components/schemas/User',
    },
    {
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
  [
    {
      $ref: '#/components/schemas/User',
    },
    {
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
      },
    },
  ],
  [
    {
      $ref: '#/components/schemas/User',
    },
    {
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', default: '123' },
              name: { type: 'string', default: 'John Doe' },
            },
          },
        },
      },
    },
  ],
  [
    {
      type: 'object',
      properties: {
        id: { type: 'string', default: '123' },
        name: { type: 'string', default: 'John Doe' },
      },
    },
    {},
  ],
  [
    {
      type: 'array',
      items: {
        $ref: '#/components/schemas/User',
      },
    },
    {
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
  [
    {
      type: 'array',
      items: {
        type: 'string',
        default: '123',
      },
    },
    {},
  ],
  [
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    {},
  ],
  [
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', default: '123' },
          name: { type: 'string', default: 'John Doe' },
        },
      },
    },
    {},
  ],
  [
    {
      $ref: '#/components/schemas/Wrong',
    },
    {},
  ],
  [
    {
      $ref: '',
    },
    {},
  ],
])('getTypeFromSchema returns interface for schema: %s', (schema, document) => {
  expect(
    getTypeFromSchema(schema as any, createDocument(document as any)),
  ).toMatchSnapshot()
  expect(
    getTypeFromSchema(schema as any, createDocument(document as any), {
      defaultNonNullable: true,
    }),
  ).toMatchSnapshot()
})

// Test allOf
test('getTypeFromSchema handles allOf', () => {
  const schema = {
    allOf: [
      {
        type: 'object' as const,
        properties: { id: { type: 'string' as const } },
      },
      {
        type: 'object' as const,
        properties: { name: { type: 'string' as const } },
      },
    ],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles empty allOf', () => {
  const schema = {
    allOf: [],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles allOf with default', () => {
  const schema = {
    allOf: [
      {
        type: 'object' as const,
        properties: { id: { type: 'string' as const } },
      },
    ],
    default: { id: '123' },
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test anyOf
test('getTypeFromSchema handles anyOf', () => {
  const schema = {
    anyOf: [{ type: 'string' as const }, { type: 'number' as const }],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles empty anyOf', () => {
  const schema = {
    anyOf: [],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles anyOf with default', () => {
  const schema = {
    anyOf: [{ type: 'string' as const }],
    default: 'test',
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test oneOf
test('getTypeFromSchema handles oneOf', () => {
  const schema = {
    oneOf: [{ type: 'string' as const }, { type: 'number' as const }],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles empty oneOf', () => {
  const schema = {
    oneOf: [],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test enum
test('getTypeFromSchema handles enum', () => {
  const schema = {
    enum: ['red', 'green', 'blue'],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles enum with default', () => {
  const schema = {
    enum: ['red', 'green', 'blue'],
    default: 'red',
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles enum with number values', () => {
  const schema = {
    enum: [1, 2, 3],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test primitive types
test('getTypeFromSchema handles number type', () => {
  const schema = { type: 'number' as const } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles number type with default', () => {
  const schema = {
    type: 'number' as const,
    default: 42,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles integer type', () => {
  const schema = { type: 'integer' as const } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles integer type with default', () => {
  const schema = {
    type: 'integer' as const,
    default: 10,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles boolean type', () => {
  const schema = { type: 'boolean' as const } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles boolean type with default', () => {
  const schema = {
    type: 'boolean' as const,
    default: true,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles string with date format', () => {
  const schema = {
    type: 'string' as const,
    format: 'date' as const,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles string with date-time format', () => {
  const schema = {
    type: 'string' as const,
    format: 'date-time' as const,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles string with default', () => {
  const schema = {
    type: 'string' as const,
    default: 'test',
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test array without items
test('getTypeFromSchema handles array without items', () => {
  const schema = { type: 'array' as const } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles array without items with default', () => {
  const schema = {
    type: 'array' as const,
    default: [],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

// Test object with additionalProperties
test('getTypeFromSchema handles object with additionalProperties true', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
    },
    additionalProperties: true,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles object with additionalProperties schema', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
    },
    additionalProperties: { type: 'string' as const },
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles object with additionalProperties schema with default', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
    },
    additionalProperties: { type: 'string' as const, default: 'default' },
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles object without properties but with type object', () => {
  const schema = {
    type: 'object' as const,
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles properties without type object', () => {
  const schema = {
    properties: {
      id: { type: 'string' as const },
    },
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles object with property $ref that has default', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      user: {
        $ref: '#/components/schemas/User',
      },
    },
  } as OpenAPIV3_1.SchemaObject
  const document = {
    components: {
      schemas: {
        User: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const },
          },
          default: { id: '123' },
        },
      },
    },
  }
  expect(getTypeFromSchema(schema, createDocument(document))).toMatchSnapshot()
})

test('getTypeFromSchema handles object with required property that has default', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, default: '123' },
      name: { type: 'string' as const },
    },
    required: ['id'],
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
  expect(
    getTypeFromSchema(schema, createDocument(), {
      defaultNonNullable: true,
    }),
  ).toMatchSnapshot()
})

test('getTypeFromSchema handles object with property $ref without default', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      user: {
        $ref: '#/components/schemas/User',
      },
    },
  } as OpenAPIV3_1.SchemaObject
  const document = {
    components: {
      schemas: {
        User: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const },
          },
        },
      },
    },
  }
  expect(getTypeFromSchema(schema, createDocument(document))).toMatchSnapshot()
})

test('getTypeFromSchema handles object with property $ref that cannot be resolved', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      user: {
        $ref: '#/components/schemas/NonExistent',
      },
    },
  } as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles fallback to unknown', () => {
  const schema = {} as OpenAPIV3_1.SchemaObject
  expect(getTypeFromSchema(schema, createDocument())).toMatchSnapshot()
})

test('getTypeFromSchema handles $ref that resolves to schema with $ref', () => {
  const schema = {
    $ref: '#/components/schemas/User',
  } as OpenAPIV3_1.ReferenceObject
  const document = {
    components: {
      schemas: {
        User: {
          $ref: '#/components/schemas/BaseUser',
        } as OpenAPIV3_1.ReferenceObject,
        BaseUser: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const },
          },
        },
      },
    },
  }
  expect(
    getTypeFromSchema(schema, createDocument(document as any)),
  ).toMatchSnapshot()
})

// Test formatTypeValue
test('formatTypeValue handles string', () => {
  expect(formatTypeValue('string')).toBe('string')
})

test('formatTypeValue handles type object', () => {
  expect(formatTypeValue({ type: 'string', default: 'test' })).toBe('string')
})

test('formatTypeValue handles object', () => {
  const obj = {
    id: { type: 'string', default: undefined },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles nested type object', () => {
  const value = {
    type: { id: { type: 'string' } },
  }
  expect(formatTypeValue(value)).toMatchSnapshot()
})

test('formatTypeValue handles other types', () => {
  expect(formatTypeValue(123)).toBe('123')
  expect(formatTypeValue(true)).toBe('true')
  expect(formatTypeValue(null)).toBe('null')
})

test('formatTypeValue handles array', () => {
  expect(formatTypeValue(['a', 'b'])).toBe('a,b')
})

test('formatTypeValue handles ParameterDefinition with description and default', () => {
  const obj = {
    id: {
      type: 'string',
      in: 'path',
      name: 'id',
      required: true,
      description: 'User ID',
      default: '123',
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles ParameterDefinition with just default', () => {
  const obj = {
    id: {
      type: 'string',
      in: 'path',
      name: 'id',
      required: false,
      default: '123',
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles ParameterDefinition with description only', () => {
  const obj = {
    id: {
      type: 'string',
      in: 'path',
      name: 'id',
      required: true,
      description: 'User ID',
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with all optional properties', () => {
  const obj = {
    id: { type: 'string', default: undefined },
    name: { type: 'string', default: undefined },
  }
  // All properties are optional (no '?' in key, but type object)
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles nested object with all optional properties', () => {
  const obj = {
    user: {
      id: { type: 'string', default: undefined },
      name: { type: 'string', default: undefined },
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with string value (component reference)', () => {
  const obj = {
    user: 'User',
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles nested type object with object type', () => {
  const value = {
    type: {
      id: { type: 'string' },
      name: { type: 'string' },
    },
  }
  expect(formatTypeValue(value)).toMatchSnapshot()
})

test('formatTypeValue handles object with mixed optional and required', () => {
  const obj = {
    required: { type: 'string' },
    optional: { type: 'string', default: undefined },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles ParameterDefinition with required false', () => {
  const obj = {
    page: {
      type: 'number',
      in: 'query',
      name: 'page',
      required: false,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles empty object', () => {
  const obj = {}
  expect(formatTypeValue(obj)).toBe('{}')
})

test('formatTypeValue handles object with ParameterDefinition that has required true', () => {
  const obj = {
    id: {
      type: 'string',
      in: 'path',
      name: 'id',
      required: true,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object that has non-object type', () => {
  const obj = {
    id: {
      type: 'string',
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with nested type object with object type', () => {
  const obj = {
    user: {
      type: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with nested regular object', () => {
  const obj = {
    user: {
      id: 'string',
      name: 'string',
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with non-object value', () => {
  const obj = {
    count: 123,
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with keys ending with question mark', () => {
  const obj = {
    'id?': { type: 'string' },
    'name?': { type: 'string' },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with ParameterDefinition required false in nested check', () => {
  const obj = {
    params: {
      page: {
        type: 'number',
        in: 'query',
        name: 'page',
        required: false,
      },
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object containing nested object type', () => {
  const obj = {
    user: {
      type: {
        profile: {
          type: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object containing non-object type (string)', () => {
  const obj = {
    id: {
      type: 'string',
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with all optional properties (keys ending with ?)', () => {
  // This will trigger areAllPropertiesOptional with keys ending in '?'
  const obj = {
    params: {
      'id?': { type: 'string' },
      'name?': { type: 'string' },
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with nested empty object', () => {
  // This will trigger areAllPropertiesOptional with empty object
  const obj = {
    empty: {},
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object containing nested object with all optional', () => {
  // This will trigger areAllPropertiesOptional recursively for type object with nested object
  const obj = {
    user: {
      type: {
        'id?': { type: 'string' },
        'name?': { type: 'string' },
      },
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object containing nested object type that triggers recursive areAllPropertiesOptional', () => {
  // This specifically tests lines 224-225: type object with nested object type
  // The nested object has all optional properties (keys ending with ?)
  const obj = {
    nested: {
      type: {
        inner: {
          type: {
            'id?': { type: 'string' },
            'name?': { type: 'string' },
          },
          default: undefined,
        },
      },
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with nested regular object that triggers areAllPropertiesOptional recursive call (line 230)', () => {
  // This tests line 230: areAllPropertiesOptional recursive call for regular objects
  // The nested object should have all optional properties to trigger the recursive path
  const obj = {
    nested: {
      'id?': { type: 'string' },
      'name?': { type: 'string' },
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles deeply nested regular objects that trigger areAllPropertiesOptional recursive calls', () => {
  // This tests multiple recursive calls for line 230
  const obj = {
    level1: {
      level2: {
        level3: {
          'id?': { type: 'string' },
          'name?': { type: 'string' },
        },
      },
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

test('formatTypeValue handles object with type object where type is object with optional properties', () => {
  // This tests lines 224-225: when isTypeObject is true and type is an object
  // The object type should have all optional properties to trigger the recursive call
  const obj = {
    params: {
      type: {
        'id?': { type: 'string' },
        'name?': { type: 'string' },
      },
      default: undefined,
    },
  }
  expect(formatTypeValue(obj)).toMatchSnapshot()
})

// Test extractParameters
test('extractParameters handles path parameters', () => {
  const pathItem = {
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string' as const },
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  expect(
    extractParameters(pathItem, undefined, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles query parameters', () => {
  const operation = {
    parameters: [
      {
        name: 'page',
        in: 'query' as const,
        required: false,
        schema: { type: 'number' as const },
      },
    ],
  } as OpenAPIV3_1.OperationObject
  expect(
    extractParameters(undefined, operation, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles header parameters', () => {
  const operation = {
    parameters: [
      {
        name: 'Authorization',
        in: 'header' as const,
        required: true,
        schema: { type: 'string' as const },
      },
    ],
  } as OpenAPIV3_1.OperationObject
  expect(
    extractParameters(undefined, operation, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles parameters from both pathItem and operation', () => {
  const pathItem = {
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string' as const },
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const operation = {
    parameters: [
      {
        name: 'page',
        in: 'query' as const,
        required: false,
        schema: { type: 'number' as const },
      },
    ],
  } as OpenAPIV3_1.OperationObject
  expect(
    extractParameters(pathItem, operation, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref parameters', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/UserId',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const document = {
    components: {
      parameters: {
        UserId: {
          name: 'id',
          in: 'path' as const,
          required: true,
          schema: { type: 'string' as const },
        },
      },
    },
  }
  expect(
    extractParameters(pathItem, undefined, createDocument(document)),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref parameter that cannot be resolved', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/NonExistent',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  expect(
    extractParameters(pathItem, undefined, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles parameter without schema', () => {
  const operation = {
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
      },
    ],
  } as OpenAPIV3_1.OperationObject
  expect(
    extractParameters(undefined, operation, createDocument()),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref parameter without required fields', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/Invalid',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const document = {
    components: {
      parameters: {
        Invalid: {
          name: 'id',
          // missing 'in' field
        },
      },
    },
  }
  expect(
    extractParameters(pathItem, undefined, createDocument(document as any)),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref parameter with schema', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/UserId',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const document = {
    components: {
      parameters: {
        UserId: {
          name: 'id',
          in: 'path' as const,
          required: true,
          schema: { type: 'string' as const, default: 'default' },
        },
      },
    },
  }
  expect(
    extractParameters(pathItem, undefined, createDocument(document)),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref query parameter', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/PageParam',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const document = {
    components: {
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query' as const,
          required: false,
          schema: { type: 'number' as const },
        },
      },
    },
  }
  expect(
    extractParameters(pathItem, undefined, createDocument(document)),
  ).toMatchSnapshot()
})

test('extractParameters handles $ref header parameter', () => {
  const pathItem = {
    parameters: [
      {
        $ref: '#/components/parameters/AuthHeader',
      },
    ],
  } as OpenAPIV3_1.PathItemObject
  const document = {
    components: {
      parameters: {
        AuthHeader: {
          name: 'Authorization',
          in: 'header' as const,
          required: true,
          schema: { type: 'string' as const },
        },
      },
    },
  }
  expect(
    extractParameters(pathItem, undefined, createDocument(document)),
  ).toMatchSnapshot()
})

test('extractParameters handles empty parameters', () => {
  expect(
    extractParameters(undefined, undefined, createDocument()),
  ).toMatchSnapshot()
})

// Test extractRequestBody
test('extractRequestBody handles undefined requestBody', () => {
  expect(extractRequestBody(undefined, createDocument())).toBeUndefined()
})

test('extractRequestBody handles requestBody with application/json', () => {
  const requestBody = {
    content: {
      'application/json': {
        schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
          },
        },
      },
    },
  } as OpenAPIV3_1.RequestBodyObject
  expect(extractRequestBody(requestBody, createDocument())).toMatchSnapshot()
})

test('extractRequestBody handles requestBody $ref', () => {
  const requestBody = {
    $ref: '#/components/requestBodies/CreateUser',
  } as OpenAPIV3_1.ReferenceObject
  const document = {
    components: {
      requestBodies: {
        CreateUser: {
          content: {
            'application/json': {
              schema: {
                type: 'object' as const,
                properties: {
                  name: { type: 'string' as const },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(
    extractRequestBody(requestBody, createDocument(document)),
  ).toMatchSnapshot()
})

test('extractRequestBody handles requestBody $ref that cannot be resolved', () => {
  const requestBody = {
    $ref: '#/components/requestBodies/NonExistent',
  } as OpenAPIV3_1.ReferenceObject
  expect(extractRequestBody(requestBody, createDocument())).toBe('unknown')
})

test('extractRequestBody handles requestBody $ref without content', () => {
  const requestBody = {
    $ref: '#/components/requestBodies/Invalid',
  } as OpenAPIV3_1.ReferenceObject
  const document = {
    components: {
      requestBodies: {
        Invalid: {
          // no content field
        },
      },
    },
  }
  expect(extractRequestBody(requestBody, createDocument(document as any))).toBe(
    'unknown',
  )
})

test('extractRequestBody handles requestBody $ref without application/json', () => {
  const requestBody = {
    $ref: '#/components/requestBodies/CreateUser',
  } as OpenAPIV3_1.ReferenceObject
  const document = {
    components: {
      requestBodies: {
        CreateUser: {
          content: {
            'application/xml': {
              schema: {
                type: 'object' as const,
              },
            },
          },
        },
      },
    },
  }
  expect(extractRequestBody(requestBody, createDocument(document))).toBe(
    'unknown',
  )
})

test('extractRequestBody handles requestBody without application/json', () => {
  const requestBody = {
    content: {
      'application/xml': {
        schema: {
          type: 'object' as const,
        },
      },
    },
  } as OpenAPIV3_1.RequestBodyObject
  expect(extractRequestBody(requestBody, createDocument())).toBeUndefined()
})

test('extractRequestBody handles requestBody without schema', () => {
  const requestBody = {
    content: {
      'application/json': {
        // no schema
      },
    },
  } as OpenAPIV3_1.RequestBodyObject
  expect(extractRequestBody(requestBody, createDocument())).toBeUndefined()
})

test('extractRequestBody handles requestBody with empty content', () => {
  const requestBody = {
    content: {},
  } as OpenAPIV3_1.RequestBodyObject
  expect(extractRequestBody(requestBody, createDocument())).toBeUndefined()
})
