'use client'

// Virtual module - generated at build time by bundler plugins
import crudComponents from '@devup-api/ui/crud'
import type { ComponentType } from 'react'
import type { CrudApiName, CrudComponentProps } from './types'

/**
 * Props for ApiCrud component
 */
export interface ApiCrudProps {
  /** Which CRUD to use (matches devup:{api}:* tag in OpenAPI spec) */
  api: CrudApiName
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
 * ApiCrud - Entry point for all CRUD operations
 *
 * Uses the `api` prop to select which generated CRUD component to render.
 * The actual components are generated at build time from your OpenAPI spec's
 * `devup:{api}:{mode}` tags.
 *
 * @example
 * ```tsx
 * import { ApiCrud } from '@devup-api/ui'
 *
 * // Create mode
 * <ApiCrud api="user" apiClient={api} onSuccess={() => navigate('/users')} />
 *
 * // Edit mode (params provided)
 * <ApiCrud api="user" apiClient={api} params={{ id: '123' }} />
 * ```
 */
export function ApiCrud({ api, ...props }: ApiCrudProps) {
  const Component = (
    crudComponents as Record<string, ComponentType<CrudComponentProps>>
  )[api]

  if (!Component) {
    throw new Error(
      `ApiCrud: No CRUD component found for "${api}". ` +
        `Check your OpenAPI spec for devup:${api}:* tags.`,
    )
  }

  return <Component {...props} />
}
