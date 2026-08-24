import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'
import {
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '../generate-zod'
import { normalizeNullableUnion, splitNullableUnion } from '../openapi-utils'

// =============================================================================
// Helpers
// =============================================================================

const REF = { $ref: '#/components/schemas/Item' }
const NULL_TYPE = { type: 'null' }
const INLINE_OBJECT = {
  type: 'object',
  properties: { a: { type: 'string' } },
}

/**
 * Build a document that exercises `schema` in both a request body position
 * (component reference shortcut) and a response property position (inline
 * type generation).
 */
const createSchemas = (
  schema: unknown,
): Record<string, OpenAPIV3_1.Document> => ({
  'openapi.json': {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/items': {
        post: {
          operationId: 'createItem',
          requestBody: { content: { 'application/json': { schema } } },
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { item: schema } },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Item: { type: 'object', properties: { id: { type: 'string' } } },
      },
    },
  } as unknown as OpenAPIV3_1.Document,
})

/**
 * Build a document that exercises `schema` as a property of a component
 * schema, which is the only position zod schemas are emitted for.
 */
const createComponentSchemas = (
  schema: unknown,
): Record<string, OpenAPIV3_1.Document> => ({
  'openapi.json': {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/items': {
        get: {
          operationId: 'getItem',
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
        Wrapper: { type: 'object', properties: { item: schema } },
        Item: { type: 'object', properties: { id: { type: 'string' } } },
      },
    },
  } as unknown as OpenAPIV3_1.Document,
})

/**
 * An OpenAPI 3.1 nullable union must generate exactly what the equivalent
 * OpenAPI 3.0 `nullable: true` schema generates, on all three paths.
 */
const expectParity = (openapi31: unknown, openapi30: unknown): void => {
  for (const build of [createSchemas, createComponentSchemas]) {
    expect(generateInterface(build(openapi31))).toBe(
      generateInterface(build(openapi30)),
    )
    expect(generateZodSchemas(build(openapi31))).toBe(
      generateZodSchemas(build(openapi30)),
    )
    expect(generateZodTypeDeclarations(build(openapi31))).toBe(
      generateZodTypeDeclarations(build(openapi30)),
    )
  }
}

// =============================================================================
// OpenAPI 3.1 nullable notation: anyOf / oneOf with { type: 'null' }
// =============================================================================

describe('nullable $ref union (anyOf: [$ref, { type: "null" }])', () => {
  test('matches OpenAPI 3.0 { $ref, nullable: true }', () => {
    expectParity({ anyOf: [REF, NULL_TYPE] }, { ...REF, nullable: true })
  })

  test('matches OpenAPI 3.0 with oneOf notation', () => {
    expectParity({ oneOf: [REF, NULL_TYPE] }, { ...REF, nullable: true })
  })

  test('matches OpenAPI 3.0 with the null member listed first', () => {
    expectParity({ anyOf: [NULL_TYPE, REF] }, { ...REF, nullable: true })
  })

  test('keeps the component reference instead of inlining it', () => {
    const result = generateInterface(createSchemas({ anyOf: [REF, NULL_TYPE] }))

    expect(result).toContain(
      "body: DevupObject<'request', 'openapi.json'>['Item']",
    )
    expect(result).toContain(
      "item?: DevupObject<'response', 'openapi.json'>['Item']",
    )
    expect(result).not.toContain('unknown)')
  })

  test('keeps the zod request path mapping', () => {
    const result = generateZodSchemas(
      createSchemas({ anyOf: [REF, NULL_TYPE] }),
    )

    expect(result).toContain('createItem: openapi_json_request_Item')
    expect(result).toContain("'/items': openapi_json_request_Item")
  })

  test('keeps the zod lazy reference instead of a union', () => {
    const result = generateZodSchemas(
      createComponentSchemas({ anyOf: [REF, NULL_TYPE] }),
    )

    expect(result).toContain('z.lazy(() => _Item)')
    expect(result).not.toContain('z.union([')
  })

  test('keeps the zod type declaration unwrappable', () => {
    const result = generateZodTypeDeclarations(
      createComponentSchemas({ anyOf: [REF, NULL_TYPE] }),
    )

    expect(result).toContain('z.ZodLazy<z.ZodTypeAny>')
    expect(result).not.toContain('z.ZodUnion<')
  })
})

describe('nullable inline union (anyOf: [schema, { type: "null" }])', () => {
  test('object member matches OpenAPI 3.0 nullable object', () => {
    expectParity(
      { anyOf: [INLINE_OBJECT, NULL_TYPE] },
      { ...INLINE_OBJECT, nullable: true },
    )
  })

  test('object member matches OpenAPI 3.0 with oneOf notation', () => {
    expectParity(
      { oneOf: [INLINE_OBJECT, NULL_TYPE] },
      { ...INLINE_OBJECT, nullable: true },
    )
  })

  test('primitive member matches OpenAPI 3.0 nullable primitive', () => {
    expectParity(
      { anyOf: [{ type: 'string' }, NULL_TYPE] },
      { type: 'string', nullable: true },
    )
  })

  test('generates a nullable type rather than a union with unknown', () => {
    const result = generateInterface(
      createSchemas({ anyOf: [{ type: 'string' }, NULL_TYPE] }),
    )

    expect(result).toContain('item?: string | null')
    expect(result).not.toContain('unknown')
  })

  test('generates .nullable() rather than z.union in zod', () => {
    const result = generateZodSchemas(
      createComponentSchemas({ anyOf: [{ type: 'string' }, NULL_TYPE] }),
    )

    expect(result).toContain('z.string().nullable()')
    expect(result).not.toContain('z.union([')
  })
})

// =============================================================================
// Genuine unions must not regress
// =============================================================================

describe('genuine unions', () => {
  const UNION = { anyOf: [{ type: 'string' }, { type: 'number' }] }

  test('stays a union in the generated interface', () => {
    expect(generateInterface(createSchemas(UNION))).toContain(
      'item?: (string | number)',
    )
  })

  test('stays z.union in the generated zod schema', () => {
    expect(generateZodSchemas(createComponentSchemas(UNION))).toContain(
      'z.union([z.string(), z.number()])',
    )
  })

  test('stays z.ZodUnion in the generated zod type', () => {
    expect(
      generateZodTypeDeclarations(createComponentSchemas(UNION)),
    ).toContain('z.ZodUnion<[z.ZodString, z.ZodNumber]>')
  })

  test('union with a null member stays a union and becomes nullable', () => {
    const nullableUnion = {
      anyOf: [{ type: 'string' }, { type: 'number' }, NULL_TYPE],
    }

    expect(generateInterface(createSchemas(nullableUnion))).toContain(
      'item?: (string | number | null)',
    )
    expect(generateZodSchemas(createComponentSchemas(nullableUnion))).toContain(
      'z.union([z.string(), z.number()]).nullable()',
    )
    expect(
      generateZodTypeDeclarations(createComponentSchemas(nullableUnion)),
    ).toContain('z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodNumber]>>')
  })

  test('union with a null member matches OpenAPI 3.0 nullable union', () => {
    expectParity(
      { anyOf: [{ type: 'string' }, { type: 'number' }, NULL_TYPE] },
      { anyOf: [{ type: 'string' }, { type: 'number' }], nullable: true },
    )
  })
})

// =============================================================================
// OpenAPI 3.0 input must keep working
// =============================================================================

describe('OpenAPI 3.0 nullable input', () => {
  test('nullable primitive still generates a nullable type', () => {
    const nullableString = { type: 'string', nullable: true }

    expect(generateInterface(createSchemas(nullableString))).toContain(
      'item?: string | null',
    )
    expect(
      generateZodSchemas(createComponentSchemas(nullableString)),
    ).toContain('z.string().nullable()')
  })

  test('nullable $ref still generates the component reference', () => {
    expect(
      generateInterface(createSchemas({ ...REF, nullable: true })),
    ).toContain("body: DevupObject<'request', 'openapi.json'>['Item']")
  })
})

// =============================================================================
// splitNullableUnion / normalizeNullableUnion
// =============================================================================

describe('splitNullableUnion', () => {
  test('removes { type: "null" } members and reports nullability', () => {
    expect(
      splitNullableUnion([REF, NULL_TYPE] as OpenAPIV3_1.SchemaObject[]),
    ).toEqual({
      members: [REF],
      nullable: true,
    })
  })

  test('reports a type array of only null as a null member', () => {
    expect(
      splitNullableUnion([
        REF,
        { type: ['null'] },
      ] as OpenAPIV3_1.SchemaObject[]),
    ).toEqual({ members: [REF], nullable: true })
  })

  test('leaves genuine unions untouched', () => {
    const members = [
      { type: 'string' },
      { type: 'number' },
    ] as OpenAPIV3_1.SchemaObject[]

    expect(splitNullableUnion(members)).toEqual({ members, nullable: false })
  })

  test('does not treat a nullable type array member as a null member', () => {
    const members = [
      { type: ['string', 'null'] },
    ] as unknown as OpenAPIV3_1.SchemaObject[]

    expect(splitNullableUnion(members)).toEqual({ members, nullable: false })
  })

  test('does not treat a $ref member as a null member', () => {
    expect(splitNullableUnion([REF] as OpenAPIV3_1.SchemaObject[])).toEqual({
      members: [REF],
      nullable: false,
    })
  })
})

describe('normalizeNullableUnion', () => {
  test('collapses a nullable $ref union to the OpenAPI 3.0 shape', () => {
    expect(
      normalizeNullableUnion({
        anyOf: [REF, NULL_TYPE],
      } as OpenAPIV3_1.SchemaObject),
    ).toEqual({ ...REF, nullable: true } as OpenAPIV3_1.SchemaObject)
  })

  test('collapses a nullable oneOf union to the OpenAPI 3.0 shape', () => {
    expect(
      normalizeNullableUnion({
        oneOf: [INLINE_OBJECT, NULL_TYPE],
      } as OpenAPIV3_1.SchemaObject),
    ).toEqual({ ...INLINE_OBJECT, nullable: true } as OpenAPIV3_1.SchemaObject)
  })

  test('keeps sibling keywords of the collapsed union', () => {
    expect(
      normalizeNullableUnion({
        anyOf: [{ type: 'string' }, NULL_TYPE],
        description: 'nickname',
        default: null,
      } as unknown as OpenAPIV3_1.SchemaObject),
    ).toEqual({
      type: 'string',
      description: 'nickname',
      default: null,
      nullable: true,
    } as unknown as OpenAPIV3_1.SchemaObject)
  })

  test('returns the same schema for a genuine union', () => {
    const schema = {
      anyOf: [{ type: 'string' }, { type: 'number' }],
    } as OpenAPIV3_1.SchemaObject

    expect(normalizeNullableUnion(schema)).toBe(schema)
  })

  test('returns the same schema for a union that keeps two members', () => {
    const schema = {
      anyOf: [{ type: 'string' }, { type: 'number' }, NULL_TYPE],
    } as OpenAPIV3_1.SchemaObject

    expect(normalizeNullableUnion(schema)).toBe(schema)
  })

  test('returns the same schema when there is no union', () => {
    const schema = { type: 'string' } as OpenAPIV3_1.SchemaObject

    expect(normalizeNullableUnion(schema)).toBe(schema)
  })

  test('returns the same schema for a reference object', () => {
    const schema = REF as OpenAPIV3_1.ReferenceObject

    expect(normalizeNullableUnion(schema)).toBe(schema)
  })
})
