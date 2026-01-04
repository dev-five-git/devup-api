export * from '@devup-api/fetch'
export * from './schema-struct'

import type {
  DevupZodAllSchemas,
  DevupZodPathSchemas,
  DevupZodSchemas,
} from './schema-struct'

// =============================================================================
// Runtime Exports (will be replaced by virtual file from bundler plugins)
// =============================================================================

// Note: These exports are placeholders. The actual Zod schemas are provided
// by bundler plugins as virtual files. When you import from '@devup-api/zod',
// the bundler intercepts the import and provides the generated schemas.

/**
 * All Zod schemas organized by server and category (response, request, error)
 * @example
 * import { schemas } from '@devup-api/zod'
 * const userSchema = schemas['openapi.json'].response.User
 * const result = userSchema.safeParse(data)
 */
export const schemas: DevupZodAllSchemas = {} as DevupZodAllSchemas

/**
 * Response schemas - Zod schemas for API response types (default server: openapi.json)
 * @example
 * import { responseSchemas } from '@devup-api/zod'
 * const userSchema = responseSchemas.User
 * const result = userSchema.safeParse(responseData)
 */
export const responseSchemas: DevupZodSchemas['response'] =
  {} as DevupZodSchemas['response']

/**
 * Request schemas - Zod schemas for API request body types (default server: openapi.json)
 * @example
 * import { requestSchemas } from '@devup-api/zod'
 * const createUserSchema = requestSchemas.CreateUserRequest
 * const result = createUserSchema.safeParse(requestBody)
 */
export const requestSchemas: DevupZodSchemas['request'] =
  {} as DevupZodSchemas['request']

/**
 * Error schemas - Zod schemas for API error response types (default server: openapi.json)
 * @example
 * import { errorSchemas } from '@devup-api/zod'
 * const errorSchema = errorSchemas.ApiError
 * const result = errorSchema.safeParse(errorResponse)
 */
export const errorSchemas: DevupZodSchemas['error'] =
  {} as DevupZodSchemas['error']

/**
 * Path schemas - Zod schemas mapped by path/operationId for each HTTP method
 * Used by @devup-api/hookform for automatic form validation
 * @example
 * import { pathSchemas } from '@devup-api/zod'
 * const createUserSchema = pathSchemas.post['createUser']
 * // or pathSchemas.post['/users']
 */
export const pathSchemas: DevupZodPathSchemas = {} as DevupZodPathSchemas

/**
 * POST path schemas - Zod schemas for POST request bodies
 */
export const postPathSchemas: DevupZodPathSchemas['post'] =
  {} as DevupZodPathSchemas['post']

/**
 * PUT path schemas - Zod schemas for PUT request bodies
 */
export const putPathSchemas: DevupZodPathSchemas['put'] =
  {} as DevupZodPathSchemas['put']

/**
 * PATCH path schemas - Zod schemas for PATCH request bodies
 */
export const patchPathSchemas: DevupZodPathSchemas['patch'] =
  {} as DevupZodPathSchemas['patch']

/**
 * DELETE path schemas - Zod schemas for DELETE request bodies
 */
export const deletePathSchemas: DevupZodPathSchemas['delete'] =
  {} as DevupZodPathSchemas['delete']
