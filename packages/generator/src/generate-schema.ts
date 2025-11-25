import type { OpenAPIV3 } from 'openapi-types'

/**
 * Resolve $ref reference in OpenAPI schema
 */
export function resolveRef(
  ref: string,
  document: OpenAPIV3.Document,
): OpenAPIV3.SchemaObject | null {
  if (!ref.startsWith('#/')) {
    return null
  }

  const parts = ref.slice(2).split('/')
  let current: unknown = document

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }

  if (current && typeof current === 'object' && !('$ref' in current)) {
    return current as OpenAPIV3.SchemaObject
  }

  return null
}

/**
 * Convert OpenAPI schema to TypeScript type representation
 */
export function getTypeFromSchema(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  document: OpenAPIV3.Document,
): unknown {
  // Handle $ref
  if ('$ref' in schema) {
    const resolved = resolveRef(schema.$ref, document)
    if (resolved) {
      return getTypeFromSchema(resolved, document)
    }
    return 'unknown'
  }

  const schemaObj = schema as OpenAPIV3.SchemaObject

  // Handle allOf, anyOf, oneOf
  if (schemaObj.allOf) {
    const types = schemaObj.allOf.map((s) => getTypeFromSchema(s, document))
    return types.length > 0 ? types.join(' & ') : 'unknown'
  }

  if (schemaObj.anyOf || schemaObj.oneOf) {
    const types = (schemaObj.anyOf || schemaObj.oneOf || []).map((s) =>
      getTypeFromSchema(s, document),
    )
    return types.length > 0 ? `(${types.join(' | ')})` : 'unknown'
  }

  // Handle enum
  if (schemaObj.enum) {
    return schemaObj.enum.map((v) => `"${String(v)}"`).join(' | ')
  }

  // Handle primitive types
  if (schemaObj.type === 'string') {
    if (schemaObj.format === 'date' || schemaObj.format === 'date-time') {
      return 'string'
    }
    return 'string'
  }

  if (schemaObj.type === 'number' || schemaObj.type === 'integer') {
    return 'number'
  }

  if (schemaObj.type === 'boolean') {
    return 'boolean'
  }

  // Handle array
  if (schemaObj.type === 'array') {
    const items = schemaObj.items
    if (items) {
      const itemType = getTypeFromSchema(items, document)
      return `Array<${formatTypeValue(itemType)}>`
    }
    return 'unknown[]'
  }

  // Handle object
  if (schemaObj.type === 'object' || schemaObj.properties) {
    const props: Record<string, unknown> = {}
    const required = schemaObj.required || []

    if (schemaObj.properties) {
      for (const [key, value] of Object.entries(schemaObj.properties)) {
        const propType = getTypeFromSchema(value, document)
        // Mark as optional if not in required array
        if (!required.includes(key)) {
          props[`${key}?`] = propType
        } else {
          props[key] = propType
        }
      }
    }

    // Handle additionalProperties
    if (schemaObj.additionalProperties) {
      if (schemaObj.additionalProperties === true) {
        props['[key: string]'] = 'unknown'
      } else if (typeof schemaObj.additionalProperties === 'object') {
        const additionalType = getTypeFromSchema(
          schemaObj.additionalProperties,
          document,
        )
        props['[key: string]'] = additionalType
      }
    }

    return props
  }

  // Handle oneOf/anyOf already handled above, but check again for safety
  return 'unknown'
}

/**
 * Format a type object to TypeScript interface/type string
 */
export function formatType(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj)
    .map(([key, value]) => {
      const formattedValue = formatTypeValue(value)
      return `    ${key}: ${formattedValue}`
    })
    .join(';\n')

  return `{\n${entries}\n  }`
}

/**
 * Format a type value to TypeScript type string
 */
export function formatTypeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return formatType(value as Record<string, unknown>)
  }

  return String(value)
}

/**
 * Extract parameters from OpenAPI operation
 */
export function extractParameters(
  pathItem: OpenAPIV3.PathItemObject | undefined,
  operation: OpenAPIV3.OperationObject | undefined,
  document: OpenAPIV3.Document,
): {
  pathParams: Record<string, unknown>
  queryParams: Record<string, unknown>
  headerParams: Record<string, unknown>
} {
  const pathParams: Record<string, unknown> = {}
  const queryParams: Record<string, unknown> = {}
  const headerParams: Record<string, unknown> = {}

  const allParams = [
    ...(pathItem?.parameters || []),
    ...(operation?.parameters || []),
  ]

  for (const param of allParams) {
    if ('$ref' in param) {
      // Resolve $ref parameter
      const resolved = resolveRef(param.$ref, document)
      if (
        resolved &&
        'in' in resolved &&
        'name' in resolved &&
        typeof resolved.in === 'string' &&
        typeof resolved.name === 'string'
      ) {
        const paramSchema =
          'schema' in resolved && resolved.schema ? resolved.schema : {}
        const paramType = getTypeFromSchema(paramSchema, document)
        if (resolved.in === 'path') {
          pathParams[resolved.name] = paramType
        } else if (resolved.in === 'query') {
          queryParams[resolved.name] = paramType
        } else if (resolved.in === 'header') {
          headerParams[resolved.name] = paramType
        }
      }
      continue
    }

    const paramSchema = param.schema || {}
    const paramType = getTypeFromSchema(paramSchema, document)

    if (param.in === 'path') {
      pathParams[param.name] = paramType
    } else if (param.in === 'query') {
      queryParams[param.name] = paramType
    } else if (param.in === 'header') {
      headerParams[param.name] = paramType
    }
  }

  return { pathParams, queryParams, headerParams }
}

/**
 * Extract request body from OpenAPI operation
 */
export function extractRequestBody(
  requestBody:
    | OpenAPIV3.RequestBodyObject
    | OpenAPIV3.ReferenceObject
    | undefined,
  document: OpenAPIV3.Document,
): unknown {
  if (!requestBody) {
    return undefined
  }

  if ('$ref' in requestBody) {
    const resolved = resolveRef(requestBody.$ref, document)
    if (resolved && 'content' in resolved && resolved.content) {
      const content = resolved.content as OpenAPIV3.RequestBodyObject['content']
      const jsonContent = content['application/json']
      if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
        return getTypeFromSchema(jsonContent.schema, document)
      }
    }
    return 'unknown'
  }

  const content = requestBody.content
  if (content) {
    const jsonContent = content['application/json']
    if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
      return getTypeFromSchema(jsonContent.schema, document)
    }
  }

  return undefined
}
