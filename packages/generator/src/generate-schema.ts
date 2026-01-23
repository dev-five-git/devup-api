import type { OpenAPIV3_1 } from 'openapi-types'
import type { ParameterDefinition } from './generate-interface'
import { wrapInterfaceKeyGuard } from './wrap-interface-key-guard'

/**
 * Enum definition collected during schema processing
 */
export interface EnumDefinition {
  /** Unique key for the enum (e.g., "UserStatus", "OrderType") */
  name: string
  /** Enum values */
  values: (string | number)[]
  /** Whether the enum is nullable */
  nullable: boolean
}

/**
 * Context for tracking enums during schema processing
 */
export interface SchemaProcessingContext {
  /** Map of enum key to enum definition */
  enums: Map<string, EnumDefinition>
  /** Current property path for naming enums */
  propertyPath: string[]
  /** Schema name if processing a component schema */
  schemaName?: string
}

/**
 * Create a new schema processing context
 */
export function createSchemaContext(
  schemaName?: string,
): SchemaProcessingContext {
  return {
    enums: new Map(),
    propertyPath: [],
    schemaName,
  }
}

/**
 * Generate a unique enum name based on context
 */
function generateEnumName(
  context: SchemaProcessingContext,
  values: (string | number)[],
): string {
  // Use schema name + property path for naming
  const parts: string[] = []

  if (context.schemaName) {
    parts.push(context.schemaName)
  }

  if (context.propertyPath.length > 0) {
    parts.push(...context.propertyPath)
  }

  if (parts.length === 0) {
    // Fallback: generate name from values
    const valueBasedName = values
      .slice(0, 3)
      .map((v) => String(v).charAt(0).toUpperCase() + String(v).slice(1))
      .join('')
    return `${valueBasedName}Enum`
  }

  // Convert to PascalCase
  const name = parts
    .map((p) => {
      // Remove special characters and convert to PascalCase
      return p
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    })
    .join('')

  return name
}

/**
 * Check if a schema is nullable (OpenAPI 3.0 or 3.1)
 * OpenAPI 3.0: uses `nullable: true`
 * OpenAPI 3.1: uses type array like `["string", "null"]`
 */
function isNullable(schema: OpenAPIV3_1.SchemaObject): boolean {
  // OpenAPI 3.0 style: nullable: true
  if ('nullable' in schema && schema.nullable === true) {
    return true
  }

  // OpenAPI 3.1 style: type is an array containing "null"
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    return true
  }

  return false
}

/**
 * Get the non-null type from OpenAPI 3.1 type array
 * e.g., ["string", "null"] -> "string"
 */
function getNonNullType(
  types: (OpenAPIV3_1.NonArraySchemaObjectType | 'array')[],
): OpenAPIV3_1.NonArraySchemaObjectType | 'array' | undefined {
  return types.find((t) => t !== 'null')
}

/**
 * Resolve $ref reference in OpenAPI schema
 */
function resolveSchemaRef<
  T extends OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ParameterObject,
>(ref: string, document: OpenAPIV3_1.Document): T | null {
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
    return current as T
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
    context?: SchemaProcessingContext
    propertyName?: string
  },
): { type: unknown; default?: unknown } {
  const defaultNonNullable = options?.defaultNonNullable ?? false
  const context = options?.context

  // Push property name to path if provided
  if (context && options?.propertyName) {
    context.propertyPath.push(options.propertyName)
  }

  try {
    // Handle $ref
    if ('$ref' in schema) {
      const resolved = resolveSchemaRef<OpenAPIV3_1.SchemaObject>(
        schema.$ref,
        document,
      )
      if (resolved) {
        return getTypeFromSchema(resolved, document, {
          ...options,
          propertyName: undefined, // Don't double-push property name
        })
      }
      return { type: 'unknown', default: undefined }
    }

    const schemaObj = schema as OpenAPIV3_1.SchemaObject

    // Handle allOf, anyOf, oneOf
    if (schemaObj.allOf) {
      const types = schemaObj.allOf.map((s) =>
        getTypeFromSchema(s, document, {
          ...options,
          propertyName: undefined,
        }),
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
        getTypeFromSchema(s, document, {
          ...options,
          propertyName: undefined,
        }),
      )
      return {
        type:
          types.length > 0
            ? `(${types.map((t) => formatTypeValue(t.type)).join(' | ')})`
            : 'unknown',
        default: schemaObj.default,
      }
    }

    // Check if schema is nullable
    const nullable = isNullable(schemaObj)

    // Handle enum
    if (schemaObj.enum) {
      // If context is provided, register the enum and return a reference
      if (context) {
        const enumName = generateEnumName(context, schemaObj.enum)
        const existingEnum = context.enums.get(enumName)

        if (!existingEnum) {
          context.enums.set(enumName, {
            name: enumName,
            values: schemaObj.enum as (string | number)[],
            nullable,
          })
        }

        return {
          type: nullable ? `${enumName} | null` : enumName,
          default: schemaObj.default,
        }
      }

      // Fallback: inline enum type (for backward compatibility)
      const enumType = schemaObj.enum.map((v) => `"${String(v)}"`).join(' | ')
      return {
        type: nullable ? `${enumType} | null` : enumType,
        default: schemaObj.default,
      }
    }

    // Get the actual type (handle OpenAPI 3.1 type arrays)
    const actualType = Array.isArray(schemaObj.type)
      ? getNonNullType(schemaObj.type)
      : schemaObj.type

    // Handle primitive types
    if (actualType === 'string') {
      return {
        type: nullable ? 'string | null' : 'string',
        default: schemaObj.default,
      }
    }

    if (actualType === 'number' || actualType === 'integer') {
      return {
        type: nullable ? 'number | null' : 'number',
        default: schemaObj.default,
      }
    }

    if (actualType === 'boolean') {
      return {
        type: nullable ? 'boolean | null' : 'boolean',
        default: schemaObj.default,
      }
    }

    // Handle array
    if (actualType === 'array') {
      const items = 'items' in schemaObj ? schemaObj.items : undefined
      if (items) {
        const itemType = getTypeFromSchema(items, document, {
          ...options,
          propertyName: undefined,
        })
        return {
          type: nullable
            ? { __isArray: true, items: itemType.type, __nullable: true }
            : { __isArray: true, items: itemType.type },
          default: schemaObj.default,
        }
      }
      return {
        type: nullable ? 'unknown[] | null' : 'unknown[]',
        default: schemaObj.default,
      }
    }

    // Handle object
    if (actualType === 'object' || schemaObj.properties) {
      const props: Record<string, { type: unknown; default?: unknown }> = {}
      const required = schemaObj.required || []

      if (schemaObj.properties) {
        for (const [key, value] of Object.entries(schemaObj.properties)) {
          const propType = getTypeFromSchema(value, document, {
            ...options,
            propertyName: key,
          })
          // Check if property has default value
          // Need to resolve $ref if present to check for default
          let hasDefault = false
          if ('$ref' in value) {
            const resolved = resolveSchemaRef<OpenAPIV3_1.SchemaObject>(
              value.$ref,
              document,
            )
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
            {
              ...options,
              propertyName: undefined,
            },
          )
          props['[key: string]'] = {
            type: additionalType.type,
            default: additionalType.default,
          }
        }
      }

      return {
        type: nullable ? { ...props, __nullable: true } : { ...props },
        default: schemaObj.default,
      }
    }

    // Handle oneOf/anyOf already handled above, but check again for safety
    return { type: 'unknown', default: undefined }
  } finally {
    // Pop property name from path
    if (context && options?.propertyName) {
      context.propertyPath.pop()
    }
  }
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
function areAllPropertiesOptional(obj: Record<string, unknown>): boolean {
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
      // // For type objects, check if the type is an object with all optional properties
      // if (
      //   typeof value.type === 'object' &&
      //   value.type !== null &&
      //   !Array.isArray(value.type)
      // ) {
      //   return areAllPropertiesOptional(value.type as Record<string, unknown>)
      // }
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
function formatType(obj: Record<string, unknown>, indent: number = 0): string {
  const indentStr = '  '.repeat(indent)
  const nextIndent = indent + 1
  const nextIndentStr = '  '.repeat(nextIndent)

  const entries = Object.entries(obj)
    .map(([key, value]) => {
      // Handle string values (e.g., component references)
      if (typeof value === 'string') {
        return `${nextIndentStr}${wrapInterfaceKeyGuard(key)}: ${value}`
      }

      // Handle ParameterDefinition for params and query
      if (isParameterDefinition(value)) {
        const typeStr = formatTypeValue(value.type, nextIndent)
        const isOptional = value.required === false
        const wrappedKey = wrapInterfaceKeyGuard(key)
        const keyWithOptional = isOptional ? `${wrappedKey}?` : wrappedKey
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
        return `${nextIndentStr}${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
      }

      // Check if value is an object (like params, query) with all optional properties
      const valueAllOptional =
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        areAllPropertiesOptional(value as Record<string, unknown>)
      const optionalMarker = valueAllOptional ? '?' : ''

      const formattedValue = formatTypeValue(value, nextIndent)
      return `${nextIndentStr}${wrapInterfaceKeyGuard(key)}${optionalMarker}: ${formattedValue}`
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
 * Check if a value is an array type marker
 */
function isArrayType(
  value: unknown,
): value is { __isArray: true; items: unknown; __nullable?: boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__isArray' in value &&
    (value as Record<string, unknown>).__isArray === true
  )
}

/**
 * Check if a value is a nullable object type marker
 */
function isNullableObject(
  value: unknown,
): value is Record<string, unknown> & { __nullable: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__nullable' in value &&
    (value as Record<string, unknown>).__nullable === true
  )
}

/**
 * Format a type value to TypeScript type string
 */
export function formatTypeValue(value: unknown, indent: number = 0): string {
  if (typeof value === 'string') {
    return value
  }

  // Handle array type marker
  if (isArrayType(value)) {
    const itemsFormatted = formatTypeValue(value.items, indent)
    const arrayType = `Array<${itemsFormatted}>`
    return value.__nullable ? `${arrayType} | null` : arrayType
  }

  // Handle { type: unknown, default?: unknown } structure
  if (isTypeObject(value)) {
    return formatTypeValue(value.type, indent)
  }

  // Handle nullable object type marker
  if (isNullableObject(value)) {
    // Remove __nullable from the object before formatting
    const { __nullable, ...rest } = value
    const objectType = formatType(rest as Record<string, unknown>, indent)
    return `${objectType} | null`
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
      const resolved = resolveSchemaRef<OpenAPIV3_1.ParameterObject>(
        param.$ref,
        document,
      )
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
