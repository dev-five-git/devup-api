import type { DevupApiTypeGeneratorOptions } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'
import { wrapInterfaceKeyGuard } from './wrap-interface-key-guard'

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize server name by removing ./ prefix
 */
function normalizeServerName(serverName: string): string {
  return serverName.replace(/^\.\//, '')
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
 * Extract schema name from $ref
 */
function extractSchemaNameFromRef(ref: string): string | null {
  if (ref.startsWith('#/components/schemas/')) {
    return ref.replace('#/components/schemas/', '')
  }
  return null
}

/**
 * Check if status code is an error response
 */
function isErrorStatusCode(statusCode: string): boolean {
  if (statusCode === 'default') return true
  const code = parseInt(statusCode, 10)
  return code >= 400 && code < 600
}

// =============================================================================
// OpenAPI to Zod Conversion
// =============================================================================

/**
 * Convert OpenAPI schema to Zod schema code string
 */
function schemaToZod(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  document: OpenAPIV3_1.Document,
  schemaRefs: Map<string, string>,
  options?: { defaultNonNullable?: boolean },
): string {
  const defaultNonNullable = options?.defaultNonNullable ?? false

  // Handle $ref
  if ('$ref' in schema) {
    const schemaName = extractSchemaNameFromRef(schema.$ref)
    if (schemaName && schemaRefs.has(schemaName)) {
      // Return lazy reference for circular dependencies
      return `z.lazy(() => ${schemaRefs.get(schemaName)})`
    }
    const resolved = resolveSchemaRef<OpenAPIV3_1.SchemaObject>(
      schema.$ref,
      document,
    )
    if (resolved) {
      return schemaToZod(resolved, document, schemaRefs, options)
    }
    return 'z.unknown()'
  }

  const schemaObj = schema as OpenAPIV3_1.SchemaObject

  // Handle nullable (OpenAPI 3.0 uses 'nullable', OpenAPI 3.1 uses type array with 'null')
  const isNullable = (): boolean => {
    // Check for OpenAPI 3.0 style nullable
    if ('nullable' in schemaObj && schemaObj.nullable === true) {
      return true
    }
    // Check for OpenAPI 3.1 style nullable (type: ["string", "null"])
    if (Array.isArray(schemaObj.type) && schemaObj.type.includes('null')) {
      return true
    }
    return false
  }

  const wrapNullable = (zodStr: string): string => {
    if (isNullable()) {
      return `${zodStr}.nullable()`
    }
    return zodStr
  }

  // Helper to get the primary type from OpenAPI 3.1 type array
  const getPrimaryType = (): string | undefined => {
    if (Array.isArray(schemaObj.type)) {
      // Filter out 'null' to get the primary type
      const nonNullTypes = schemaObj.type.filter((t) => t !== 'null')
      return nonNullTypes[0]
    }
    return schemaObj.type
  }

  const primaryType = getPrimaryType()

  // Handle allOf (intersection)
  if (schemaObj.allOf) {
    const schemas = schemaObj.allOf.map((s) =>
      schemaToZod(s, document, schemaRefs, options),
    )
    if (schemas.length === 0) return 'z.unknown()'
    if (schemas.length === 1) return wrapNullable(schemas[0] as string)
    return wrapNullable(`z.intersection(${schemas.join(', ')})`)
  }

  // Handle oneOf/anyOf (union)
  if (schemaObj.oneOf || schemaObj.anyOf) {
    const schemas = (schemaObj.oneOf || schemaObj.anyOf || []).map((s) =>
      schemaToZod(s, document, schemaRefs, options),
    )
    if (schemas.length === 0) return 'z.unknown()'
    if (schemas.length === 1) return wrapNullable(schemas[0] as string)
    return wrapNullable(`z.union([${schemas.join(', ')}])`)
  }

  // Handle enum
  if (schemaObj.enum) {
    const enumValues = schemaObj.enum.map((v) => JSON.stringify(v))
    if (enumValues.length === 1) {
      return wrapNullable(`z.literal(${enumValues[0]})`)
    }
    return wrapNullable(`z.enum([${enumValues.join(', ')}])`)
  }

  // Handle primitive types
  if (primaryType === 'string') {
    // Zod 4.0: Use top-level format validators instead of z.string().format()
    // Check format first to use top-level validators
    if (schemaObj.format === 'email') {
      let zodStr = 'z.email()'
      if (schemaObj.minLength !== undefined) {
        zodStr += `.min(${schemaObj.minLength})`
      }
      if (schemaObj.maxLength !== undefined) {
        zodStr += `.max(${schemaObj.maxLength})`
      }
      return wrapNullable(zodStr)
    }
    if (schemaObj.format === 'uri' || schemaObj.format === 'url') {
      let zodStr = 'z.url()'
      if (schemaObj.minLength !== undefined) {
        zodStr += `.min(${schemaObj.minLength})`
      }
      if (schemaObj.maxLength !== undefined) {
        zodStr += `.max(${schemaObj.maxLength})`
      }
      return wrapNullable(zodStr)
    }
    if (schemaObj.format === 'uuid') {
      return wrapNullable('z.uuid()')
    }
    if (schemaObj.format === 'date-time') {
      return wrapNullable('z.iso.datetime()')
    }

    // For strings without special format, use z.string() with constraints
    let zodStr = 'z.string()'
    if (schemaObj.minLength !== undefined) {
      zodStr += `.min(${schemaObj.minLength})`
    }
    if (schemaObj.maxLength !== undefined) {
      zodStr += `.max(${schemaObj.maxLength})`
    }
    if (schemaObj.pattern) {
      zodStr += `.regex(/${schemaObj.pattern}/)`
    }
    return wrapNullable(zodStr)
  }

  if (primaryType === 'number' || primaryType === 'integer') {
    // Zod 4.0: Use z.int() for integers instead of z.number().int()
    let zodStr = primaryType === 'integer' ? 'z.int()' : 'z.number()'
    if (schemaObj.minimum !== undefined) {
      zodStr += `.min(${schemaObj.minimum})`
    }
    if (schemaObj.maximum !== undefined) {
      zodStr += `.max(${schemaObj.maximum})`
    }
    if (schemaObj.exclusiveMinimum !== undefined) {
      zodStr += `.gt(${schemaObj.exclusiveMinimum})`
    }
    if (schemaObj.exclusiveMaximum !== undefined) {
      zodStr += `.lt(${schemaObj.exclusiveMaximum})`
    }
    return wrapNullable(zodStr)
  }

  if (primaryType === 'boolean') {
    return wrapNullable('z.boolean()')
  }

  // Handle array
  if (primaryType === 'array') {
    if ('items' in schemaObj && schemaObj.items) {
      const itemSchema = schemaToZod(
        schemaObj.items,
        document,
        schemaRefs,
        options,
      )
      let zodStr = `z.array(${itemSchema})`
      if (schemaObj.minItems !== undefined) {
        zodStr += `.min(${schemaObj.minItems})`
      }
      if (schemaObj.maxItems !== undefined) {
        zodStr += `.max(${schemaObj.maxItems})`
      }
      return wrapNullable(zodStr)
    }
    return wrapNullable('z.array(z.unknown())')
  }

  // Handle object
  if (primaryType === 'object' || schemaObj.properties) {
    const required = new Set(schemaObj.required || [])
    const properties: string[] = []

    if (schemaObj.properties) {
      for (const [key, value] of Object.entries(schemaObj.properties)) {
        const propSchema = schemaToZod(value, document, schemaRefs, options)
        const isRequired = required.has(key)

        // Check for default value
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
          hasDefault = (value as OpenAPIV3_1.SchemaObject).default !== undefined
        }

        let propStr = propSchema
        if (!isRequired && !(defaultNonNullable && hasDefault)) {
          propStr += '.optional()'
        }

        properties.push(`${wrapInterfaceKeyGuard(key)}: ${propStr}`)
      }
    }

    let zodStr =
      properties.length > 0
        ? `z.object({\n    ${properties.join(',\n    ')}\n  })`
        : 'z.object({})'

    // Handle additionalProperties
    if (schemaObj.additionalProperties === true) {
      zodStr += '.passthrough()'
    } else if (
      typeof schemaObj.additionalProperties === 'object' &&
      schemaObj.additionalProperties !== null
    ) {
      // For typed additional properties, we can't perfectly represent this in Zod
      // We use passthrough() as an approximation
      zodStr += '.passthrough()'
    }

    return wrapNullable(zodStr)
  }

  return 'z.unknown()'
}

// =============================================================================
// OpenAPI to Zod Type Conversion (for TypeScript type declarations)
// =============================================================================

/**
 * Convert OpenAPI schema to Zod TypeScript type string
 * Unlike schemaToZod which generates runtime code like z.object({...}),
 * this generates TypeScript types like z.ZodObject<{...}>
 */
function schemaToZodType(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  document: OpenAPIV3_1.Document,
  options?: { defaultNonNullable?: boolean },
): string {
  const defaultNonNullable = options?.defaultNonNullable ?? false

  // Handle $ref
  if ('$ref' in schema) {
    const schemaName = extractSchemaNameFromRef(schema.$ref)
    if (schemaName) {
      // Return a lazy type reference
      return `z.ZodLazy<z.ZodTypeAny>`
    }
    const resolved = resolveSchemaRef<OpenAPIV3_1.SchemaObject>(
      schema.$ref,
      document,
    )
    if (resolved) {
      return schemaToZodType(resolved, document, options)
    }
    return 'z.ZodUnknown'
  }

  const schemaObj = schema as OpenAPIV3_1.SchemaObject

  // Handle nullable
  const isNullable = (): boolean => {
    if ('nullable' in schemaObj && schemaObj.nullable === true) {
      return true
    }
    if (Array.isArray(schemaObj.type) && schemaObj.type.includes('null')) {
      return true
    }
    return false
  }

  const wrapNullable = (zodType: string): string => {
    if (isNullable()) {
      return `z.ZodNullable<${zodType}>`
    }
    return zodType
  }

  // Helper to get the primary type from OpenAPI 3.1 type array
  const getPrimaryType = (): string | undefined => {
    if (Array.isArray(schemaObj.type)) {
      // Filter out 'null' to get the primary type
      const nonNullTypes = schemaObj.type.filter((t) => t !== 'null')
      return nonNullTypes[0]
    }
    return schemaObj.type
  }

  const primaryType = getPrimaryType()

  // Handle allOf (intersection)
  if (schemaObj.allOf) {
    const types = schemaObj.allOf.map((s) =>
      schemaToZodType(s, document, options),
    )
    if (types.length === 0) return 'z.ZodUnknown'
    if (types.length === 1) return wrapNullable(types[0] as string)
    // Zod intersection only takes 2 args, so we need to nest
    let result = types[0] as string
    for (let i = 1; i < types.length; i++) {
      result = `z.ZodIntersection<${result}, ${types[i]}>`
    }
    return wrapNullable(result)
  }

  // Handle oneOf/anyOf (union)
  if (schemaObj.oneOf || schemaObj.anyOf) {
    const types = (schemaObj.oneOf || schemaObj.anyOf || []).map((s) =>
      schemaToZodType(s, document, options),
    )
    if (types.length === 0) return 'z.ZodUnknown'
    if (types.length === 1) return wrapNullable(types[0] as string)
    return wrapNullable(`z.ZodUnion<[${types.join(', ')}]>`)
  }

  // Handle enum
  if (schemaObj.enum) {
    const enumValues = schemaObj.enum.map((v) => JSON.stringify(v))
    if (enumValues.length === 1) {
      return wrapNullable(`z.ZodLiteral<${enumValues[0]}>`)
    }
    return wrapNullable(`z.ZodEnum<[${enumValues.join(', ')}]>`)
  }

  // Handle primitive types
  if (primaryType === 'string') {
    return wrapNullable('z.ZodString')
  }

  if (primaryType === 'number' || primaryType === 'integer') {
    return wrapNullable('z.ZodNumber')
  }

  if (primaryType === 'boolean') {
    return wrapNullable('z.ZodBoolean')
  }

  // Handle array
  if (primaryType === 'array') {
    if ('items' in schemaObj && schemaObj.items) {
      const itemType = schemaToZodType(schemaObj.items, document, options)
      return wrapNullable(`z.ZodArray<${itemType}>`)
    }
    return wrapNullable('z.ZodArray<z.ZodUnknown>')
  }

  // Handle object
  if (primaryType === 'object' || schemaObj.properties) {
    const required = new Set(schemaObj.required || [])
    const properties: string[] = []

    if (schemaObj.properties) {
      for (const [key, value] of Object.entries(schemaObj.properties)) {
        const propType = schemaToZodType(value, document, options)
        const isRequired = required.has(key)

        // Check for default value
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
          hasDefault = (value as OpenAPIV3_1.SchemaObject).default !== undefined
        }

        let finalType = propType
        if (!isRequired && !(defaultNonNullable && hasDefault)) {
          finalType = `z.ZodOptional<${propType}>`
        }

        properties.push(`${wrapInterfaceKeyGuard(key)}: ${finalType}`)
      }
    }

    const objectType =
      properties.length > 0
        ? `z.ZodObject<{ ${properties.join('; ')} }>`
        : 'z.ZodObject<Record<string, never>>'

    return wrapNullable(objectType)
  }

  return 'z.ZodUnknown'
}

// =============================================================================
// Schema Collection
// =============================================================================

interface SchemaInfo {
  code: string // Runtime Zod code
  type: string // TypeScript Zod type
}

interface PathSchemaMapping {
  schemaName: string | null
  operationId: string | null
}

interface CollectedSchemas {
  requestSchemas: Record<string, SchemaInfo>
  responseSchemas: Record<string, SchemaInfo>
  errorSchemas: Record<string, SchemaInfo>
  pathMappings: Record<
    'get' | 'post' | 'put' | 'delete' | 'patch',
    Record<string, PathSchemaMapping>
  >
}

/**
 * Collect schema names used in request, response, and error positions
 * Also collects path to schema mappings for hookform integration
 */
function collectSchemaUsage(
  schema: OpenAPIV3_1.Document,
  options?: DevupApiTypeGeneratorOptions,
): {
  requestSchemaNames: Set<string>
  responseSchemaNames: Set<string>
  errorSchemaNames: Set<string>
  pathMappings: Record<
    'get' | 'post' | 'put' | 'delete' | 'patch',
    Record<string, PathSchemaMapping>
  >
} {
  const requestSchemaNames = new Set<string>()
  const responseSchemaNames = new Set<string>()
  const errorSchemaNames = new Set<string>()
  const pathMappings: Record<
    'get' | 'post' | 'put' | 'delete' | 'patch',
    Record<string, PathSchemaMapping>
  > = {
    get: {},
    post: {},
    put: {},
    delete: {},
    patch: {},
  }
  const convertCaseType = options?.convertCase ?? 'camel'

  const collectSchemaNames = (
    schemaObj: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
    targetSet: Set<string>,
  ): void => {
    if ('$ref' in schemaObj) {
      const schemaName = extractSchemaNameFromRef(schemaObj.$ref)
      if (schemaName) {
        targetSet.add(schemaName)
      }
      return
    }

    const s = schemaObj as OpenAPIV3_1.SchemaObject

    if (s.allOf)
      s.allOf.forEach((sub) => {
        collectSchemaNames(sub, targetSet)
      })
    if (s.anyOf)
      s.anyOf.forEach((sub) => {
        collectSchemaNames(sub, targetSet)
      })
    if (s.oneOf)
      s.oneOf.forEach((sub) => {
        collectSchemaNames(sub, targetSet)
      })
    if (s.properties) {
      Object.values(s.properties).forEach((prop) => {
        collectSchemaNames(prop, targetSet)
      })
    }
    if (s.type === 'array' && 'items' in s && s.items) {
      collectSchemaNames(s.items, targetSet)
    }
  }

  // Helper to get direct schema name from request body
  const getRequestBodySchemaName = (
    requestBody: OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject,
  ): string | null => {
    if ('$ref' in requestBody) {
      return extractSchemaNameFromRef(requestBody.$ref)
    }
    const content = requestBody.content
    const jsonContent = content?.['application/json']
    if (jsonContent?.schema && '$ref' in jsonContent.schema) {
      return extractSchemaNameFromRef(jsonContent.schema.$ref)
    }
    return null
  }

  if (schema.paths) {
    for (const [path, pathItem] of Object.entries(schema.paths)) {
      if (!pathItem) continue

      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const
      for (const method of methods) {
        const operation = pathItem[method]
        if (!operation) continue

        // Normalize path for case conversion
        const normalizedPath = path.replace(/\{([^}]+)\}/g, (_, param) => {
          return `{${convertCase(param, convertCaseType)}}`
        })

        // Get operationId if exists
        const operationId = operation.operationId
          ? convertCase(operation.operationId, convertCaseType)
          : null

        // Collect request body schemas and path mappings
        let requestSchemaName: string | null = null
        if (operation.requestBody) {
          requestSchemaName = getRequestBodySchemaName(operation.requestBody)

          if ('$ref' in operation.requestBody) {
            const schemaName = extractSchemaNameFromRef(
              operation.requestBody.$ref,
            )
            if (schemaName) {
              requestSchemaNames.add(schemaName)
            }
          } else {
            const content = operation.requestBody.content
            const jsonContent = content?.['application/json']
            if (jsonContent?.schema) {
              collectSchemaNames(jsonContent.schema, requestSchemaNames)
            }
          }
        }

        // Store path mapping
        const mapping: PathSchemaMapping = {
          schemaName: requestSchemaName,
          operationId,
        }
        pathMappings[method][normalizedPath] = mapping
        if (operationId) {
          pathMappings[method][operationId] = mapping
        }

        // Collect response and error schemas
        if (operation.responses) {
          for (const [statusCode, response] of Object.entries(
            operation.responses,
          )) {
            const isError = isErrorStatusCode(statusCode)
            if ('$ref' in response) {
              const schemaName = extractSchemaNameFromRef(response.$ref)
              if (schemaName) {
                if (isError) {
                  errorSchemaNames.add(schemaName)
                } else {
                  responseSchemaNames.add(schemaName)
                }
              }
            } else if ('content' in response) {
              const content = response.content
              const jsonContent = content?.['application/json']
              if (jsonContent?.schema) {
                if (isError) {
                  collectSchemaNames(jsonContent.schema, errorSchemaNames)
                } else {
                  collectSchemaNames(jsonContent.schema, responseSchemaNames)
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    requestSchemaNames,
    responseSchemaNames,
    errorSchemaNames,
    pathMappings,
  }
}

/**
 * Generate Zod schemas for a single OpenAPI document
 */
function generateSchemasForDocument(
  schema: OpenAPIV3_1.Document,
  _serverName: string,
  options?: DevupApiTypeGeneratorOptions,
): CollectedSchemas {
  const {
    requestSchemaNames,
    responseSchemaNames,
    errorSchemaNames,
    pathMappings,
  } = collectSchemaUsage(schema, options)

  const requestSchemas: Record<string, SchemaInfo> = {}
  const responseSchemas: Record<string, SchemaInfo> = {}
  const errorSchemas: Record<string, SchemaInfo> = {}

  // Create a map of schema references for lazy loading
  const schemaRefs = new Map<string, string>()
  if (schema.components?.schemas) {
    for (const schemaName of Object.keys(schema.components.schemas)) {
      schemaRefs.set(schemaName, `_${schemaName}`)
    }
  }

  if (schema.components?.schemas) {
    for (const [schemaName, schemaObj] of Object.entries(
      schema.components.schemas,
    )) {
      if (!schemaObj) continue

      const requestDefaultNonNullable =
        options?.requestDefaultNonNullable ?? false
      const responseDefaultNonNullable =
        options?.responseDefaultNonNullable ?? true

      const isRequest = requestSchemaNames.has(schemaName)
      const isResponse = responseSchemaNames.has(schemaName)
      const isError = errorSchemaNames.has(schemaName)

      const schemaRef = schemaObj as
        | OpenAPIV3_1.SchemaObject
        | OpenAPIV3_1.ReferenceObject

      if (isRequest) {
        requestSchemas[schemaName] = {
          code: schemaToZod(schemaRef, schema, schemaRefs, {
            defaultNonNullable: requestDefaultNonNullable,
          }),
          type: schemaToZodType(schemaRef, schema, {
            defaultNonNullable: requestDefaultNonNullable,
          }),
        }
      }

      if (isResponse) {
        responseSchemas[schemaName] = {
          code: schemaToZod(schemaRef, schema, schemaRefs, {
            defaultNonNullable: responseDefaultNonNullable,
          }),
          type: schemaToZodType(schemaRef, schema, {
            defaultNonNullable: responseDefaultNonNullable,
          }),
        }
      }

      if (isError) {
        errorSchemas[schemaName] = {
          code: schemaToZod(schemaRef, schema, schemaRefs, {
            defaultNonNullable: responseDefaultNonNullable,
          }),
          type: schemaToZodType(schemaRef, schema, {
            defaultNonNullable: responseDefaultNonNullable,
          }),
        }
      }
    }
  }

  return { requestSchemas, responseSchemas, errorSchemas, pathMappings }
}

// =============================================================================
// Main Generator Function
// =============================================================================

/**
 * Generate Zod schema code from OpenAPI documents
 *
 * @param schemas - Map of server names to OpenAPI documents
 * @param options - Generator options
 * @returns Generated JavaScript/TypeScript code string
 */
export function generateZodSchemas(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiTypeGeneratorOptions,
): string {
  const serverSchemas: Record<string, CollectedSchemas> = {}

  for (const [originalServerName, schema] of Object.entries(schemas)) {
    const normalizedServerName = normalizeServerName(originalServerName)
    serverSchemas[normalizedServerName] = generateSchemasForDocument(
      schema,
      normalizedServerName,
      options,
    )
  }

  // Generate the output code
  const lines: string[] = ['import { z } from "zod";', '']

  // Generate schema definitions for each server
  for (const [serverName, collected] of Object.entries(serverSchemas)) {
    const safeServerName = serverName.replace(/[^a-zA-Z0-9]/g, '_')

    // Request schemas
    if (Object.keys(collected.requestSchemas).length > 0) {
      lines.push(`// Request schemas for ${serverName}`)
      for (const [name, schemaInfo] of Object.entries(
        collected.requestSchemas,
      )) {
        lines.push(
          `const ${safeServerName}_request_${name} = ${schemaInfo.code};`,
        )
      }
      lines.push('')
    }

    // Response schemas
    if (Object.keys(collected.responseSchemas).length > 0) {
      lines.push(`// Response schemas for ${serverName}`)
      for (const [name, schemaInfo] of Object.entries(
        collected.responseSchemas,
      )) {
        lines.push(
          `const ${safeServerName}_response_${name} = ${schemaInfo.code};`,
        )
      }
      lines.push('')
    }

    // Error schemas
    if (Object.keys(collected.errorSchemas).length > 0) {
      lines.push(`// Error schemas for ${serverName}`)
      for (const [name, schemaInfo] of Object.entries(collected.errorSchemas)) {
        lines.push(
          `const ${safeServerName}_error_${name} = ${schemaInfo.code};`,
        )
      }
      lines.push('')
    }
  }

  // Generate exports
  lines.push('// Exported schemas')

  // Build schemas object for each server
  for (const [serverName, collected] of Object.entries(serverSchemas)) {
    const safeServerName = serverName.replace(/[^a-zA-Z0-9]/g, '_')

    // Request schemas object
    const requestEntries = Object.keys(collected.requestSchemas)
      .map(
        (name) =>
          `  ${wrapInterfaceKeyGuard(name)}: ${safeServerName}_request_${name}`,
      )
      .join(',\n')
    lines.push(`export const ${safeServerName}_requestSchemas = {`)
    lines.push(requestEntries || '')
    lines.push('};')
    lines.push('')

    // Response schemas object
    const responseEntries = Object.keys(collected.responseSchemas)
      .map(
        (name) =>
          `  ${wrapInterfaceKeyGuard(name)}: ${safeServerName}_response_${name}`,
      )
      .join(',\n')
    lines.push(`export const ${safeServerName}_responseSchemas = {`)
    lines.push(responseEntries || '')
    lines.push('};')
    lines.push('')

    // Error schemas object
    const errorEntries = Object.keys(collected.errorSchemas)
      .map(
        (name) =>
          `  ${wrapInterfaceKeyGuard(name)}: ${safeServerName}_error_${name}`,
      )
      .join(',\n')
    lines.push(`export const ${safeServerName}_errorSchemas = {`)
    lines.push(errorEntries || '')
    lines.push('};')
    lines.push('')

    // Path schemas object (maps path/operationId to request schema)
    const methods = ['post', 'put', 'patch', 'delete'] as const
    for (const method of methods) {
      const pathEntries: string[] = []
      const methodMappings = collected.pathMappings[method]

      for (const [pathKey, mapping] of Object.entries(methodMappings)) {
        if (
          mapping.schemaName &&
          collected.requestSchemas[mapping.schemaName]
        ) {
          pathEntries.push(
            `  ${wrapInterfaceKeyGuard(pathKey)}: ${safeServerName}_request_${mapping.schemaName}`,
          )
        }
      }

      if (pathEntries.length > 0) {
        lines.push(`export const ${safeServerName}_${method}PathSchemas = {`)
        lines.push(pathEntries.join(',\n'))
        lines.push('};')
        lines.push('')
      } else {
        lines.push(`export const ${safeServerName}_${method}PathSchemas = {};`)
        lines.push('')
      }
    }
  }

  // Generate combined schemas export
  const serverNames = Object.keys(serverSchemas)
  if (serverNames.length === 1) {
    // Single server - export directly
    const safeServerName = (serverNames[0] as string).replace(
      /[^a-zA-Z0-9]/g,
      '_',
    )
    lines.push('export const schemas = {')
    lines.push(`  request: ${safeServerName}_requestSchemas,`)
    lines.push(`  response: ${safeServerName}_responseSchemas,`)
    lines.push(`  error: ${safeServerName}_errorSchemas,`)
    lines.push('};')
    lines.push('')
    lines.push(
      `export const requestSchemas = ${safeServerName}_requestSchemas;`,
    )
    lines.push(
      `export const responseSchemas = ${safeServerName}_responseSchemas;`,
    )
    lines.push(`export const errorSchemas = ${safeServerName}_errorSchemas;`)
    lines.push('')
    lines.push('// Path to schema mappings')
    lines.push(
      `export const postPathSchemas = ${safeServerName}_postPathSchemas;`,
    )
    lines.push(
      `export const putPathSchemas = ${safeServerName}_putPathSchemas;`,
    )
    lines.push(
      `export const patchPathSchemas = ${safeServerName}_patchPathSchemas;`,
    )
    lines.push(
      `export const deletePathSchemas = ${safeServerName}_deletePathSchemas;`,
    )
    lines.push('')
    lines.push('export const pathSchemas = {')
    lines.push('  post: postPathSchemas,')
    lines.push('  put: putPathSchemas,')
    lines.push('  patch: patchPathSchemas,')
    lines.push('  delete: deletePathSchemas,')
    lines.push('};')
  } else {
    // Multiple servers - export as nested object
    lines.push('export const schemas = {')
    for (const serverName of serverNames) {
      const safeServerName = serverName.replace(/[^a-zA-Z0-9]/g, '_')
      lines.push(`  ${wrapInterfaceKeyGuard(serverName)}: {`)
      lines.push(`    request: ${safeServerName}_requestSchemas,`)
      lines.push(`    response: ${safeServerName}_responseSchemas,`)
      lines.push(`    error: ${safeServerName}_errorSchemas,`)
      lines.push('  },')
    }
    lines.push('};')

    // Also export flat versions for single-server convenience
    if (serverNames.length > 0) {
      const defaultServer = serverNames[0] as string
      const safeDefaultServer = defaultServer.replace(/[^a-zA-Z0-9]/g, '_')
      lines.push('')
      lines.push('// Default server exports (first server)')
      lines.push(
        `export const requestSchemas = ${safeDefaultServer}_requestSchemas;`,
      )
      lines.push(
        `export const responseSchemas = ${safeDefaultServer}_responseSchemas;`,
      )
      lines.push(
        `export const errorSchemas = ${safeDefaultServer}_errorSchemas;`,
      )
      lines.push('')
      lines.push('// Path to schema mappings (first server)')
      lines.push(
        `export const postPathSchemas = ${safeDefaultServer}_postPathSchemas;`,
      )
      lines.push(
        `export const putPathSchemas = ${safeDefaultServer}_putPathSchemas;`,
      )
      lines.push(
        `export const patchPathSchemas = ${safeDefaultServer}_patchPathSchemas;`,
      )
      lines.push(
        `export const deletePathSchemas = ${safeDefaultServer}_deletePathSchemas;`,
      )
      lines.push('')
      lines.push('export const pathSchemas = {')
      lines.push('  post: postPathSchemas,')
      lines.push('  put: putPathSchemas,')
      lines.push('  patch: patchPathSchemas,')
      lines.push('  delete: deletePathSchemas,')
      lines.push('};')
    }
  }

  return lines.join('\n')
}

/**
 * Generate Zod schema type declarations for module augmentation
 */
export function generateZodTypeDeclarations(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiTypeGeneratorOptions,
): string {
  const serverSchemas: Record<string, CollectedSchemas> = {}

  for (const [originalServerName, schema] of Object.entries(schemas)) {
    const normalizedServerName = normalizeServerName(originalServerName)
    serverSchemas[normalizedServerName] = generateSchemasForDocument(
      schema,
      normalizedServerName,
      options,
    )
  }

  const lines: string[] = [
    'import "@devup-api/zod";',
    'import type { z } from "zod";',
    '',
    'declare module "@devup-api/zod" {',
  ]

  // Generate interface declarations for each server
  for (const [serverName, collected] of Object.entries(serverSchemas)) {
    // Request schemas interface
    if (Object.keys(collected.requestSchemas).length > 0) {
      lines.push(`  interface DevupZodRequestSchemas {`)
      lines.push(`    ${wrapInterfaceKeyGuard(serverName)}: {`)
      for (const [name, schemaInfo] of Object.entries(
        collected.requestSchemas,
      )) {
        lines.push(`      ${wrapInterfaceKeyGuard(name)}: ${schemaInfo.type};`)
      }
      lines.push('    };')
      lines.push('  }')
      lines.push('')
    }

    // Response schemas interface
    if (Object.keys(collected.responseSchemas).length > 0) {
      lines.push(`  interface DevupZodResponseSchemas {`)
      lines.push(`    ${wrapInterfaceKeyGuard(serverName)}: {`)
      for (const [name, schemaInfo] of Object.entries(
        collected.responseSchemas,
      )) {
        lines.push(`      ${wrapInterfaceKeyGuard(name)}: ${schemaInfo.type};`)
      }
      lines.push('    };')
      lines.push('  }')
      lines.push('')
    }

    // Error schemas interface
    if (Object.keys(collected.errorSchemas).length > 0) {
      lines.push(`  interface DevupZodErrorSchemas {`)
      lines.push(`    ${wrapInterfaceKeyGuard(serverName)}: {`)
      for (const [name, schemaInfo] of Object.entries(collected.errorSchemas)) {
        lines.push(`      ${wrapInterfaceKeyGuard(name)}: ${schemaInfo.type};`)
      }
      lines.push('    };')
      lines.push('  }')
      lines.push('')
    }
  }

  lines.push('}')

  return lines.join('\n')
}
