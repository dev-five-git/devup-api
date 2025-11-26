import type { OpenAPIV3_1 } from 'openapi-types'
import type { ParameterDefinition } from './generate-interface'

/**
 * Resolve $ref reference in OpenAPI parameter
 */
export function resolveParameterRef(
  ref: string,
  document: OpenAPIV3_1.Document,
): OpenAPIV3_1.ParameterObject | null {
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
    return current as OpenAPIV3_1.ParameterObject
  }

  return null
}

/**
 * Resolve $ref reference in OpenAPI schema
 */
export function resolveSchemaRef(
  ref: string,
  document: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject | null {
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
    return current as OpenAPIV3_1.SchemaObject
  }

  return null
}

/**
 * Convert OpenAPI schema to TypeScript type representation
 */
export function getTypeFromSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  document: OpenAPIV3_1.Document,
  options?: {
    defaultNonNullable?: boolean
  },
): { type: unknown; default?: unknown } {
  const defaultNonNullable = options?.defaultNonNullable ?? false
  // Handle $ref
  if ('$ref' in schema) {
    const resolved = resolveSchemaRef(schema.$ref, document)
    if (resolved) {
      return getTypeFromSchema(resolved, document, options)
    }
    return { type: 'unknown', default: undefined }
  }

  const schemaObj = schema as OpenAPIV3_1.SchemaObject

  // Handle allOf, anyOf, oneOf
  if (schemaObj.allOf) {
    const types = schemaObj.allOf.map((s) =>
      getTypeFromSchema(s, document, options),
    )
    return {
      type:
        types.length > 0
          ? types.map((t) => formatTypeValue(t.type)).join(' & ')
          : 'unknown',
      default: schemaObj.default,
    }
  }

  if (schemaObj.anyOf || schemaObj.oneOf) {
    const types = (schemaObj.anyOf || schemaObj.oneOf || []).map((s) =>
      getTypeFromSchema(s, document, options),
    )
    return {
      type:
        types.length > 0
          ? `(${types.map((t) => formatTypeValue(t.type)).join(' | ')})`
          : 'unknown',
      default: schemaObj.default,
    }
  }

  // Handle enum
  if (schemaObj.enum) {
    return {
      type: schemaObj.enum.map((v) => `"${String(v)}"`).join(' | '),
      default: schemaObj.default,
    }
  }

  // Handle primitive types
  if (schemaObj.type === 'string') {
    if (schemaObj.format === 'date' || schemaObj.format === 'date-time') {
      return { type: 'string', default: schemaObj.default }
    }
    return { type: 'string', default: schemaObj.default }
  }

  if (schemaObj.type === 'number' || schemaObj.type === 'integer') {
    return { type: 'number', default: schemaObj.default }
  }

  if (schemaObj.type === 'boolean') {
    return { type: 'boolean', default: schemaObj.default }
  }

  // Handle array
  if (schemaObj.type === 'array') {
    const items = schemaObj.items
    if (items) {
      const itemType = getTypeFromSchema(items, document, options)
      return {
        type: `Array<${formatTypeValue(itemType.type)}>`,
        default: schemaObj.default,
      }
    }
    return { type: 'unknown[]', default: schemaObj.default }
  }

  // Handle object
  if (schemaObj.type === 'object' || schemaObj.properties) {
    const props: Record<string, { type: unknown; default?: unknown }> = {}
    const required = schemaObj.required || []

    if (schemaObj.properties) {
      for (const [key, value] of Object.entries(schemaObj.properties)) {
        const propType = getTypeFromSchema(value, document, options)
        // Check if property has default value
        // Need to resolve $ref if present to check for default
        let hasDefault = false
        if ('$ref' in value) {
          const resolved = resolveSchemaRef(value.$ref, document)
          if (resolved) {
            hasDefault = resolved.default !== undefined
          }
        } else {
          const propSchema = value as OpenAPIV3_1.SchemaObject
          hasDefault = propSchema.default !== undefined
        }
        const isInRequired = required.includes(key)

        // If defaultNonNullable is true and has default, treat as required
        // Otherwise, mark as optional if not in required array
        if (defaultNonNullable && hasDefault && !isInRequired) {
          props[key] = propType
        } else if (!isInRequired) {
          props[`${key}?`] = propType
        } else {
          props[key] = propType
        }
      }
    }

    // Handle additionalProperties
    if (schemaObj.additionalProperties) {
      if (schemaObj.additionalProperties === true) {
        props['[key: string]'] = { type: 'unknown', default: undefined }
      } else if (typeof schemaObj.additionalProperties === 'object') {
        const additionalType = getTypeFromSchema(
          schemaObj.additionalProperties,
          document,
          options,
        )
        props['[key: string]'] = {
          type: additionalType.type,
          default: additionalType.default,
        }
      }
    }

    return { type: { ...props }, default: schemaObj.default }
  }

  // Handle oneOf/anyOf already handled above, but check again for safety
  return { type: 'unknown', default: undefined }
}

/**
 * Check if a value is a ParameterDefinition
 */
function isParameterDefinition(value: unknown): value is ParameterDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'in' in value &&
    'name' in value
  )
}

/**
 * Check if all properties in an object are optional
 */
export function areAllPropertiesOptional(
  obj: Record<string, unknown>,
): boolean {
  const entries = Object.entries(obj)
  if (entries.length === 0) {
    return true
  }

  return entries.every(([key, value]) => {
    // If key ends with '?', it's optional (from getTypeFromSchema)
    if (key.endsWith('?')) {
      return true
    }

    // If it's a ParameterDefinition, check required field
    if (isParameterDefinition(value)) {
      return value.required === false
    }

    // If it's a type object, check if the type itself is optional
    if (isTypeObject(value)) {
      // For type objects, check if the type is an object with all optional properties
      if (
        typeof value.type === 'object' &&
        value.type !== null &&
        !Array.isArray(value.type)
      ) {
        return areAllPropertiesOptional(value.type as Record<string, unknown>)
      }
      return false
    }

    // For nested objects, recursively check
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return areAllPropertiesOptional(value as Record<string, unknown>)
    }

    return false
  })
}

/**
 * Format a type object to TypeScript interface/type string
 */
export function formatType(
  obj: Record<string, unknown>,
  indent: number = 0,
): string {
  const indentStr = '  '.repeat(indent)
  const nextIndent = indent + 1
  const nextIndentStr = '  '.repeat(nextIndent)

  const entries = Object.entries(obj)
    .map(([key, value]) => {
      // Handle string values (e.g., component references)
      if (typeof value === 'string') {
        return `${nextIndentStr}${key}: ${value}`
      }

      // Handle ParameterDefinition for params and query
      if (isParameterDefinition(value)) {
        const typeStr = formatTypeValue(value.type, nextIndent)
        const isOptional = value.required === false
        const keyWithOptional = isOptional ? `${key}?` : key
        let description = ''
        if (value.description) {
          description += `${nextIndentStr}/**\n${nextIndentStr} * ${value.description}`
          if (typeof value.default !== 'undefined') {
            description += `\n${nextIndentStr} * @default {${value.default}}`
          }
          description = `${description}\n${nextIndentStr} */\n${nextIndentStr}`
        } else if (typeof value.default !== 'undefined') {
          description += `${nextIndentStr}/** @default {${value.default}} */\n${nextIndentStr}`
        } else {
          description = nextIndentStr
        }
        return `${description}${keyWithOptional}: ${typeStr}`
      }

      // Handle { type: unknown, default?: unknown } structure (from getTypeFromSchema)
      if (isTypeObject(value)) {
        const formattedValue = formatTypeValue(value.type, nextIndent)
        // Key already has '?' if it's optional (from getTypeFromSchema), keep it as is
        return `${nextIndentStr}${key}: ${formattedValue}`
      }

      // Check if value is an object (like params, query) with all optional properties
      const valueAllOptional =
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        areAllPropertiesOptional(value as Record<string, unknown>)
      const optionalMarker = valueAllOptional ? '?' : ''

      const formattedValue = formatTypeValue(value, nextIndent)
      return `${nextIndentStr}${key}${optionalMarker}: ${formattedValue}`
    })
    .join(';\n')

  if (entries.length === 0) {
    return '{}'
  }

  return `{\n${entries};\n${indentStr}}`
}

/**
 * Check if a value is a type object with { type, default? } structure
 */
function isTypeObject(
  value: unknown,
): value is { type: unknown; default?: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    Object.keys(value).length <= 2 &&
    (!('default' in value) || Object.keys(value).length === 2)
  )
}

/**
 * Format a type value to TypeScript type string
 */
export function formatTypeValue(value: unknown, indent: number = 0): string {
  if (typeof value === 'string') {
    return value
  }

  // Handle { type: unknown, default?: unknown } structure
  if (isTypeObject(value)) {
    return formatTypeValue(value.type, indent)
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return formatType(value as Record<string, unknown>, indent)
  }

  return String(value)
}

/**
 * Extract parameters from OpenAPI operation
 */
export function extractParameters(
  pathItem: OpenAPIV3_1.PathItemObject | undefined,
  operation: OpenAPIV3_1.OperationObject | undefined,
  document: OpenAPIV3_1.Document,
): {
  pathParams: Record<string, ParameterDefinition>
  queryParams: Record<string, ParameterDefinition>
  headerParams: Record<string, ParameterDefinition>
} {
  const pathParams: Record<string, ParameterDefinition> = {}
  const queryParams: Record<string, ParameterDefinition> = {}
  const headerParams: Record<string, ParameterDefinition> = {}

  const allParams = [
    ...(pathItem?.parameters || []),
    ...(operation?.parameters || []),
  ]

  for (const param of allParams) {
    if ('$ref' in param) {
      // Resolve $ref parameter
      const resolved = resolveParameterRef(param.$ref, document)
      if (
        resolved &&
        'in' in resolved &&
        'name' in resolved &&
        typeof resolved.in === 'string' &&
        typeof resolved.name === 'string'
      ) {
        const paramSchema =
          'schema' in resolved && resolved.schema ? resolved.schema : {}
        const { type: paramType, default: paramDefault } = getTypeFromSchema(
          paramSchema,
          document,
          { defaultNonNullable: false },
        )
        const result = {
          ...resolved,
          type: paramType,
          default: paramDefault,
        }
        if (resolved.in === 'path') {
          pathParams[resolved.name] = result
        } else if (resolved.in === 'query') {
          queryParams[resolved.name] = result
        } else if (resolved.in === 'header') {
          headerParams[resolved.name] = result
        }
      }
      continue
    }

    const paramSchema = param.schema || {}
    const { type: paramType, default: paramDefault } = getTypeFromSchema(
      paramSchema,
      document,
      { defaultNonNullable: false },
    )
    const result = {
      ...param,
      type: paramType,
      default: paramDefault,
    }

    if (param.in === 'path') {
      pathParams[param.name] = result
    } else if (param.in === 'query') {
      queryParams[param.name] = result
    } else if (param.in === 'header') {
      headerParams[param.name] = result
    }
  }

  return { pathParams, queryParams, headerParams }
}

/**
 * Extract request body from OpenAPI operation
 */
export function extractRequestBody(
  requestBody:
    | OpenAPIV3_1.RequestBodyObject
    | OpenAPIV3_1.ReferenceObject
    | undefined,
  document: OpenAPIV3_1.Document,
): unknown {
  if (!requestBody) {
    return undefined
  }

  if ('$ref' in requestBody) {
    const resolved = resolveSchemaRef(requestBody.$ref, document)
    if (resolved && 'content' in resolved && resolved.content) {
      const content =
        resolved.content as OpenAPIV3_1.RequestBodyObject['content']
      const jsonContent = content['application/json']
      if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
        return getTypeFromSchema(jsonContent.schema, document, {
          defaultNonNullable: false,
        }).type
      }
    }
    return 'unknown'
  }

  const content = requestBody.content
  if (content) {
    const jsonContent = content['application/json']
    if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
      return getTypeFromSchema(jsonContent.schema, document, {
        defaultNonNullable: false,
      }).type
    }
  }

  return undefined
}
