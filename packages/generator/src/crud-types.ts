/**
 * CRUD operation modes
 * - one: GET single item (required)
 * - create: POST new item (required)
 * - edit: PUT update item (optional)
 * - fix: PATCH partial update (optional)
 */
export type CrudMode = 'one' | 'create' | 'edit' | 'fix'

/**
 * Field information extracted from OpenAPI schema
 */
export interface CrudField {
  /** Field name */
  name: string
  /** Field type (string, number, boolean, etc.) */
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  /** Format (email, date, date-time, uri, etc.) */
  format?: string
  /** Is field required */
  required: boolean
  /** Field description */
  description?: string
  /** Minimum value (for numbers) */
  minimum?: number
  /** Maximum value (for numbers) */
  maximum?: number
  /** Minimum length (for strings) */
  minLength?: number
  /** Maximum length (for strings) */
  maxLength?: number
  /** Pattern (for strings) */
  pattern?: string
  /** Enum values */
  enum?: string[]
}

/**
 * Single API endpoint configuration
 * Uses operationId for API calls (works with @devup-api/fetch)
 */
export interface CrudEndpoint {
  /** HTTP method */
  method: 'get' | 'post' | 'put' | 'patch'
  /** Operation ID from OpenAPI (required) */
  operationId: string
  /** Request body fields (for POST/PUT/PATCH) */
  fields?: CrudField[]
}

/**
 * Complete CRUD API group configuration
 * Generated from OpenAPI tags (devup:{name}:{mode})
 */
export interface CrudConfig {
  /** API group name (from devup:{name}:*) */
  name: string
  /** GET endpoint - required */
  one: CrudEndpoint
  /** POST endpoint - required */
  create: CrudEndpoint
  /** PUT endpoint - optional */
  edit?: CrudEndpoint
  /** PATCH endpoint - optional */
  fix?: CrudEndpoint
}

/**
 * Parsed devup tag from OpenAPI
 */
export interface ParsedDevupTag {
  /** Full tag string */
  raw: string
  /** API group name */
  name: string
  /** CRUD mode */
  mode: CrudMode
}

/**
 * OpenAPI operation with devup tags
 */
export interface DevupOperation {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  path: string
  operationId?: string
  tags: ParsedDevupTag[]
  params: string[]
}
