import { describe, expect, test } from 'bun:test'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'
import {
  createSchemaContext,
  formatTypeValue,
  getTypeFromSchema,
} from '../generate-schema'

const reference = { $ref: '#/components/schemas/ServiceType' }
const nullable = { anyOf: [reference, { type: 'null' as const }] }

const document: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: { title: 'Nullable enum reference', version: '1.0.0' },
  paths: {
    '/inputs': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Input' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Input' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ServiceType: { type: 'string', enum: ['B', 'E'] },
      Item: { type: 'object', properties: { id: { type: 'string' } } },
      Input: {
        type: 'object',
        required: ['requiredServiceType'],
        properties: {
          serviceType: nullable,
          requiredServiceType: nullable,
          nonNullable: reference,
        },
      },
    },
  },
}

describe('nullable references', () => {
  test('uses the referenced enum name without leaking the caller context', () => {
    const context = createSchemaContext('Wrapper')
    context.propertyPath.push('parent')

    const result = getTypeFromSchema(nullable, document, {
      context,
      propertyName: 'selected',
    })

    expect(formatTypeValue(result.type)).toBe('ServiceType | null')
    expect(context.schemaName).toBe('Wrapper')
    expect(context.propertyPath).toEqual(['parent'])
    expect([...context.enums.keys()]).toEqual(['ServiceType'])
    expect(context.enums.get('ServiceType')?.nullable).toBe(true)
  })

  test.each([false, true])(
    'preserves optional and required enum nullability with requestDefaultNonNullable=%s',
    (requestDefaultNonNullable) => {
      const output = generateInterface(
        { 'openapi.json': document },
        { requestDefaultNonNullable },
      )
      // Both request and response component types must preserve the contract.
      expect(output.match(/serviceType\?: ServiceType \| null/g)).toHaveLength(
        2,
      )
      expect(
        output.match(/requiredServiceType: ServiceType \| null/g),
      ).toHaveLength(2)
      expect(output.match(/nonNullable\?: ServiceType;/g)).toHaveLength(2)
    },
  )

  test.each(['anyOf', 'oneOf'] as const)(
    'preserves %s nullability when resolving a reference inline',
    (keyword) => {
      const { type } = getTypeFromSchema(
        { [keyword]: [reference, { type: 'null' }] },
        document,
      )
      expect(formatTypeValue(type)).toBe('"B" | "E" | null')
    },
  )

  for (const componentType of ['request', 'response', 'error'] as const) {
    test(`${componentType} references preserve enum and object nullability`, () => {
      const options = {
        serverName: 'openapi.json',
        componentType,
        usedSchemaNames: new Set(['ServiceType', 'Item']),
      }
      expect(
        formatTypeValue(getTypeFromSchema(nullable, document, options).type),
      ).toBe('ServiceType | null')
      expect(
        formatTypeValue(
          getTypeFromSchema(
            {
              oneOf: [{ $ref: '#/components/schemas/Item' }, { type: 'null' }],
            },
            document,
            options,
          ).type,
        ),
      ).toBe(`DevupObject<'${componentType}', 'openapi.json'>['Item'] | null`)
    })
  }

  test('preserves nullability declared on a referenced enum', () => {
    const schema = { type: 'string' as const, enum: ['B', 'E'], nullable: true }
    const result = getTypeFromSchema(
      reference,
      {
        ...document,
        components: { schemas: { ServiceType: schema } },
      },
      {
        serverName: 'openapi.json',
        componentType: 'request',
        usedSchemaNames: new Set(['ServiceType']),
      },
    )
    expect(formatTypeValue(result.type)).toBe('ServiceType | null')
  })
})
