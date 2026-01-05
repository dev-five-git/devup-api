import type { OpenAPIV3_1 } from 'openapi-types'
import type {
  CrudConfig,
  CrudEndpoint,
  CrudField,
  CrudMode,
  DevupOperation,
  ParsedDevupTag,
} from './crud-types'

/**
 * Regex pattern for devup tags: devup:{name}:{mode}
 * Examples: devup:user:one, devup:post:create, devup:comment:edit
 */
const DEVUP_TAG_PATTERN = /^devup:([a-zA-Z][a-zA-Z0-9_-]*):(\w+)$/

/**
 * Valid CRUD modes
 */
const VALID_MODES: CrudMode[] = ['one', 'create', 'edit', 'fix']

/**
 * Parse a single tag string into a ParsedDevupTag if it matches the pattern
 */
export function parseDevupTag(tag: string): ParsedDevupTag | null {
  const match = tag.match(DEVUP_TAG_PATTERN)
  if (!match) {
    return null
  }

  const [, name, modeStr] = match
  const mode = modeStr as CrudMode

  if (!VALID_MODES.includes(mode)) {
    return null
  }

  return {
    raw: tag,
    name: name as string,
    mode,
  }
}

/**
 * Extract path parameters from a path string
 * Example: '/users/{id}/posts/{postId}' -> ['id', 'postId']
 */
export function extractPathParams(path: string): string[] {
  const params: string[] = []
  const regex = /\{([^}]+)\}/g
  let match = regex.exec(path)

  while (match !== null) {
    params.push(match[1] as string)
    match = regex.exec(path)
  }

  return params
}

/**
 * Map HTTP method to expected CRUD mode
 */
function getExpectedModeForMethod(method: string): CrudMode | null {
  switch (method) {
    case 'get':
      return 'one'
    case 'post':
      return 'create'
    case 'put':
      return 'edit'
    case 'patch':
      return 'fix'
    default:
      return null
  }
}

/**
 * Resolve a schema reference
 */
function resolveSchemaRef(
  ref: string,
  document: OpenAPIV3_1.Document,
): OpenAPIV3_1.SchemaObject | null {
  // Format: #/components/schemas/SchemaName
  const parts = ref.split('/')
  if (
    parts.length !== 4 ||
    parts[1] !== 'components' ||
    parts[2] !== 'schemas'
  ) {
    return null
  }
  const schemaName = parts[3]
  return (
    (document.components?.schemas?.[
      schemaName as string
    ] as OpenAPIV3_1.SchemaObject) ?? null
  )
}

/**
 * Extract fields from an OpenAPI schema
 */
function extractFieldsFromSchema(
  schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  document: OpenAPIV3_1.Document,
): CrudField[] {
  // Resolve reference if needed
  let resolvedSchema: OpenAPIV3_1.SchemaObject
  if ('$ref' in schema) {
    const resolved = resolveSchemaRef(schema.$ref, document)
    if (!resolved) return []
    resolvedSchema = resolved
  } else {
    resolvedSchema = schema
  }

  if (resolvedSchema.type !== 'object' || !resolvedSchema.properties) {
    return []
  }

  const requiredFields = new Set(resolvedSchema.required ?? [])
  const fields: CrudField[] = []

  for (const [name, propSchema] of Object.entries(resolvedSchema.properties)) {
    // Skip if it's a reference we can't resolve
    if ('$ref' in propSchema) continue

    const prop = propSchema as OpenAPIV3_1.SchemaObject
    const field: CrudField = {
      name,
      type: (prop.type as CrudField['type']) ?? 'string',
      required: requiredFields.has(name),
    }

    if (prop.format) field.format = prop.format
    if (prop.description) field.description = prop.description
    if (prop.minimum !== undefined) field.minimum = prop.minimum
    if (prop.maximum !== undefined) field.maximum = prop.maximum
    if (prop.minLength !== undefined) field.minLength = prop.minLength
    if (prop.maxLength !== undefined) field.maxLength = prop.maxLength
    if (prop.pattern) field.pattern = prop.pattern
    if (prop.enum) field.enum = prop.enum as string[]

    fields.push(field)
  }

  return fields
}

/**
 * Extract request body fields from an operation
 */
function extractRequestBodyFields(
  operation: OpenAPIV3_1.OperationObject,
  document: OpenAPIV3_1.Document,
): CrudField[] {
  const requestBody = operation.requestBody
  if (!requestBody) return []

  // Resolve reference if needed
  let resolvedBody: OpenAPIV3_1.RequestBodyObject
  if ('$ref' in requestBody) {
    // RequestBody reference - not common but possible
    return []
  } else {
    resolvedBody = requestBody
  }

  // Get JSON content schema
  const jsonContent = resolvedBody.content?.['application/json']
  if (!jsonContent?.schema) return []

  return extractFieldsFromSchema(jsonContent.schema, document)
}

/**
 * Extended operation with OpenAPI operation object for field extraction
 */
interface ExtendedDevupOperation extends DevupOperation {
  operation: OpenAPIV3_1.OperationObject
}

/**
 * Parse all operations from an OpenAPI document and extract devup-tagged operations
 */
export function parseDevupOperations(
  document: OpenAPIV3_1.Document,
): ExtendedDevupOperation[] {
  const operations: ExtendedDevupOperation[] = []

  if (!document.paths) {
    return operations
  }

  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const

  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!pathItem) continue

    for (const method of methods) {
      const operation = pathItem[method]
      if (!operation) continue

      // Parse tags
      const devupTags: ParsedDevupTag[] = []
      if (operation.tags) {
        for (const tag of operation.tags) {
          const parsed = parseDevupTag(tag)
          if (parsed) {
            // Validate that the mode matches the HTTP method
            const expectedMode = getExpectedModeForMethod(method)
            if (expectedMode && parsed.mode === expectedMode) {
              devupTags.push(parsed)
            }
          }
        }
      }

      // Only include operations with devup tags
      if (devupTags.length > 0) {
        operations.push({
          method,
          path,
          operationId: operation.operationId,
          tags: devupTags,
          params: extractPathParams(path),
          operation,
        })
      }
    }
  }

  return operations
}

/**
 * Group operations by their devup API name and build CrudConfig objects
 */
export function buildCrudConfigs(
  operations: ExtendedDevupOperation[],
  document: OpenAPIV3_1.Document,
): Record<string, CrudConfig> {
  const configs: Record<string, Partial<CrudConfig>> = {}

  for (const op of operations) {
    for (const tag of op.tags) {
      if (!configs[tag.name]) {
        configs[tag.name] = { name: tag.name }
      }

      // Skip operations without operationId (required for ApiForm)
      if (!op.operationId) {
        console.warn(
          `Skipping ${op.method.toUpperCase()} ${op.path} - missing operationId`,
        )
        continue
      }

      // Extract fields for POST/PUT/PATCH operations
      const fields = ['post', 'put', 'patch'].includes(op.method)
        ? extractRequestBodyFields(op.operation, document)
        : undefined

      const endpoint: CrudEndpoint = {
        method: op.method as 'get' | 'post' | 'put' | 'patch',
        operationId: op.operationId,
        fields,
      }

      const config = configs[tag.name] as Partial<CrudConfig>
      switch (tag.mode) {
        case 'one':
          config.one = endpoint
          break
        case 'create':
          config.create = endpoint
          break
        case 'edit':
          config.edit = endpoint
          break
        case 'fix':
          config.fix = endpoint
          break
      }
    }
  }

  // Filter out incomplete configs (must have at least one and create)
  const validConfigs: Record<string, CrudConfig> = {}

  for (const [name, config] of Object.entries(configs)) {
    if (config.one && config.create) {
      validConfigs[name] = config as CrudConfig
    }
  }

  return validConfigs
}

/**
 * Parse OpenAPI document and extract all CRUD configurations
 */
export function parseCrudConfigs(
  document: OpenAPIV3_1.Document,
): Record<string, CrudConfig> {
  const operations = parseDevupOperations(document)
  return buildCrudConfigs(operations, document)
}

/**
 * Parse multiple OpenAPI documents and merge their CRUD configurations
 */
export function parseCrudConfigsFromMultiple(
  documents: Record<string, OpenAPIV3_1.Document>,
): Record<string, CrudConfig> {
  const allConfigs: Record<string, CrudConfig> = {}

  for (const document of Object.values(documents)) {
    const configs = parseCrudConfigs(document)
    Object.assign(allConfigs, configs)
  }

  return allConfigs
}
