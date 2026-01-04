// Import from @devup-api/fetch to get the augmented DevupApiServers
// (api.d.ts augments @devup-api/fetch, not @devup-api/core)
import type { DevupApiServers, ExtractValue } from '@devup-api/fetch'
import type { z } from 'zod'

// =============================================================================
// Zod Schema Structure Interfaces (augmented by generated code)
// =============================================================================

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodRequestSchemas {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodResponseSchemas {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodErrorSchemas {}

// =============================================================================
// Schema Access Types
// =============================================================================

/**
 * Get Zod schemas for a specific category and server
 * @example
 * type UserSchema = DevupZodSchema<'response', 'openapi.json'>['User']
 */
export type DevupZodSchema<
  Category extends 'response' | 'request' | 'error' = 'response',
  Server extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = ExtractValue<
  {
    response: ExtractValue<
      DevupZodResponseSchemas,
      Server,
      Record<string, z.ZodType>
    >
    request: ExtractValue<
      DevupZodRequestSchemas,
      Server,
      Record<string, z.ZodType>
    >
    error: ExtractValue<DevupZodErrorSchemas, Server, Record<string, z.ZodType>>
  },
  Category,
  Record<string, z.ZodType>
>

/**
 * Access Zod schemas by category for a specific server
 * This matches the runtime structure of responseSchemas, requestSchemas, errorSchemas
 * @example
 * const userSchema: DevupZodSchemas['response']['User']
 */
export type DevupZodSchemas<
  T extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = {
  response: ExtractValue<DevupZodResponseSchemas, T, Record<string, z.ZodType>>
  request: ExtractValue<DevupZodRequestSchemas, T, Record<string, z.ZodType>>
  error: ExtractValue<DevupZodErrorSchemas, T, Record<string, z.ZodType>>
}

/**
 * All schemas indexed by server name
 * This matches the runtime structure of the schemas export
 * @example
 * const userSchema = schemas['openapi.json'].response.User
 */
export type DevupZodAllSchemas = {
  [K in keyof DevupApiServers | (string & {})]: DevupZodSchemas<K>
}

/**
 * Inferred types from Zod schemas
 * @example
 * type User = DevupZodSchemaTypes['response']['User']
 */
export type DevupZodSchemaTypes<
  T extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = {
  response: {
    [K in keyof ExtractValue<
      DevupZodResponseSchemas,
      T,
      Record<string, z.ZodType>
    >]: z.infer<
      ExtractValue<DevupZodResponseSchemas, T, Record<string, z.ZodType>>[K]
    >
  }
  request: {
    [K in keyof ExtractValue<
      DevupZodRequestSchemas,
      T,
      Record<string, z.ZodType>
    >]: z.infer<
      ExtractValue<DevupZodRequestSchemas, T, Record<string, z.ZodType>>[K]
    >
  }
  error: {
    [K in keyof ExtractValue<
      DevupZodErrorSchemas,
      T,
      Record<string, z.ZodType>
    >]: z.infer<
      ExtractValue<DevupZodErrorSchemas, T, Record<string, z.ZodType>>[K]
    >
  }
}

// =============================================================================
// Path Schema Types (for hookform integration)
// =============================================================================

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodPostPathSchemas {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodPutPathSchemas {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodPatchPathSchemas {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation
export interface DevupZodDeletePathSchemas {}

/**
 * Path schemas organized by HTTP method
 * Maps path/operationId to request body Zod schema
 */
export type DevupZodPathSchemas<
  T extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = {
  post: ExtractValue<DevupZodPostPathSchemas, T, Record<string, z.ZodType>>
  put: ExtractValue<DevupZodPutPathSchemas, T, Record<string, z.ZodType>>
  patch: ExtractValue<DevupZodPatchPathSchemas, T, Record<string, z.ZodType>>
  delete: ExtractValue<DevupZodDeletePathSchemas, T, Record<string, z.ZodType>>
}

// =============================================================================
// Cold Typing Support
// =============================================================================

/**
 * Check if Zod schemas are available (boild typing)
 */
export type IsZodCold = keyof DevupApiServers extends never ? true : false

/**
 * Cold type fallback for schemas - returns any when schemas are not generated
 */
export type ColdZodSchemas = Record<string, Record<string, z.ZodType>>
