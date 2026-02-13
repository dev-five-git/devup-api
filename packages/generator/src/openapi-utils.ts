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
