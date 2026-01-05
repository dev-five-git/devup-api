import type { ComponentType } from 'react'

/**
 * Empty interface for module augmentation
 * Generated types will extend this interface with CRUD API names
 *
 * @example
 * ```ts
 * // Generated devup-api.d.ts
 * declare module '@devup-api/ui' {
 *   interface DevupCrudApiNames {
 *     user: true
 *     post: true
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: Module augmentation target
export interface DevupCrudApiNames {}

/**
 * Valid API names for CRUD operations
 * Falls back to string if no types are generated
 */
export type CrudApiName = keyof DevupCrudApiNames extends never
  ? string
  : keyof DevupCrudApiNames

/**
 * Props for generated CRUD components
 */
export interface CrudComponentProps {
  /** API client instance from @devup-api/fetch */
  apiClient: unknown
  /** Path parameters - if provided, enables edit mode */
  params?: Record<string, string>
  /** Called when form submission succeeds */
  onSuccess?: (data: unknown) => void
  /** Called when form submission fails */
  onError?: (error: unknown) => void
}

/**
 * Map of generated CRUD components by API name
 */
export type CrudComponents = Record<
  CrudApiName,
  ComponentType<CrudComponentProps>
>
