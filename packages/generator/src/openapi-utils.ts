import type { OpenAPIV3_1 } from 'openapi-types'

// =============================================================================
// Constants
// =============================================================================

/**
 * Content type priority order: json > urlencoded > multipart.
 * Used to determine which content type to use when multiple are available.
 */
export const CONTENT_TYPE_PRIORITY = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
] as const

// =============================================================================
// $ref Resolution
// =============================================================================

/**
 * Resolve a JSON `$ref` reference within an OpenAPI document.
 * Handles `#/` prefix stripping, path segment traversal, and null safety.
 */
export function resolveRef<T>(
  ref: string,
  document: OpenAPIV3_1.Document,
): T | null {
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

// =============================================================================
// Content Type Helpers
// =============================================================================

/**
 * Get the first matching request body content from priority-ordered content types.
 * Returns the `MediaTypeObject` for the highest-priority content type found.
 */
export function getRequestBodyContent(
  content: OpenAPIV3_1.RequestBodyObject['content'] | undefined,
): OpenAPIV3_1.MediaTypeObject | undefined {
  if (!content) return undefined
  for (const ct of CONTENT_TYPE_PRIORITY) {
    if (content[ct]) return content[ct]
  }
  return undefined
}

// =============================================================================
// Schema Name Extraction
// =============================================================================

/**
 * Extract the schema name from a `$ref` string pointing to `#/components/schemas/`.
 */
export function extractSchemaNameFromRef(ref: string): string | null {
  if (ref.startsWith('#/components/schemas/')) {
    return ref.replace('#/components/schemas/', '')
  }
  return null
}

// =============================================================================
// Server Name Normalization
// =============================================================================

/**
 * Normalize server name by removing the `./` prefix.
 */
export function normalizeServerName(serverName: string): string {
  return serverName.replace(/^\.\//, '')
}

// =============================================================================
// Status Code Classification
// =============================================================================

/**
 * Check if an HTTP status code represents an error response (4xx, 5xx, or 'default').
 */
export function isErrorStatusCode(statusCode: string): boolean {
  if (statusCode === 'default') return true
  const code = parseInt(statusCode, 10)
  return code >= 400 && code < 600
}

// =============================================================================
// Nullable Detection
// =============================================================================

/**
 * Check if a schema is nullable (OpenAPI 3.0 or 3.1).
 * OpenAPI 3.0: uses `nullable: true`
 * OpenAPI 3.1: uses type array like `["string", "null"]`
 */
export function isNullableSchema(schema: OpenAPIV3_1.SchemaObject): boolean {
  if ('nullable' in schema && schema.nullable === true) {
    return true
  }
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    return true
  }
  return false
}

// =============================================================================
// Type Extraction
// =============================================================================

/**
 * Get the primary (non-null) type from an OpenAPI schema.
 * For OpenAPI 3.1 type arrays like `["string", "null"]`, returns `"string"`.
 * For simple type strings, returns the type directly.
 */
export function getPrimaryType(
  schema: OpenAPIV3_1.SchemaObject,
): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find((t) => t !== 'null')
  }
  return schema.type
}

// =============================================================================
// Schema Name Collection
// =============================================================================

/**
 * Recursively collect component schema names referenced by a schema object.
 *
 * When `followComponentRefs` is true (and `document` is provided), follows
 * `$ref` into `components.schemas` to discover transitive dependencies,
 * with circular-reference protection via the `visited` set.
 *
 * When `followComponentRefs` is false (default), only collects the direct
 * schema name from `$ref` without following into the referenced schema.
 */
export function collectSchemaNames(
  schemaObj: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  targetSet: Set<string>,
  options?: {
    followComponentRefs?: boolean
    document?: OpenAPIV3_1.Document
    visited?: Set<string>
  },
): void {
  if ('$ref' in schemaObj) {
    const schemaName = extractSchemaNameFromRef(schemaObj.$ref)
    if (schemaName) {
      targetSet.add(schemaName)

      if (options?.followComponentRefs && options.document) {
        const visited = options.visited ?? new Set<string>()
        if (visited.has(schemaName)) return
        visited.add(schemaName)

        const referencedSchema = options.document.components?.schemas?.[
          schemaName
        ] as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined
        if (referencedSchema) {
          collectSchemaNames(referencedSchema, targetSet, {
            ...options,
            visited,
          })
        }
      }
    }
    return
  }

  const s = schemaObj as OpenAPIV3_1.SchemaObject

  if (s.allOf) {
    for (const sub of s.allOf) {
      collectSchemaNames(sub, targetSet, options)
    }
  }
  if (s.anyOf) {
    for (const sub of s.anyOf) {
      collectSchemaNames(sub, targetSet, options)
    }
  }
  if (s.oneOf) {
    for (const sub of s.oneOf) {
      collectSchemaNames(sub, targetSet, options)
    }
  }
  if (s.properties) {
    for (const prop of Object.values(s.properties)) {
      collectSchemaNames(prop, targetSet, options)
    }
  }
  if (s.type === 'array' && 'items' in s && s.items) {
    collectSchemaNames(s.items, targetSet, options)
  }
}
