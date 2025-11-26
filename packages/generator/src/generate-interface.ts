import type { DevupApiTypeGeneratorOptions } from '@devup-api/core'
import { toPascal } from '@devup-api/utils'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'
import {
  extractParameters,
  extractRequestBody,
  formatTypeValue,
  getTypeFromSchema,
} from './generate-schema'
import { wrapInterfaceKeyGuard } from './wrap-interface-key-guard'

export type ParameterDefinition = Omit<
  OpenAPIV3_1.ParameterObject,
  'schema'
> & {
  type: unknown
  default?: unknown
}

export interface EndpointDefinition {
  params?: Record<string, ParameterDefinition>
  body?: unknown
  query?: Record<string, ParameterDefinition>
  response?: unknown
}

// Helper function to extract schema names from $ref
function extractSchemaNameFromRef(ref: string): string | null {
  if (ref.startsWith('#/components/schemas/')) {
    return ref.replace('#/components/schemas/', '')
  }
  return null
}
export function generateInterface(
  schema: OpenAPIV3_1.Document,
  options?: DevupApiTypeGeneratorOptions,
): string {
  const endpoints: Record<
    'get' | 'post' | 'put' | 'delete' | 'patch',
    Record<string, EndpointDefinition>
  > = {
    get: {},
    post: {},
    put: {},
    delete: {},
    patch: {},
  } as const
  const convertCaseType = options?.convertCase ?? 'camel'

  // Helper function to collect schema names from a schema object
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

    const schema = schemaObj as OpenAPIV3_1.SchemaObject

    // Check allOf, anyOf, oneOf
    if (schema.allOf) {
      schema.allOf.forEach((s) => {
        collectSchemaNames(s, targetSet)
      })
    }
    if (schema.anyOf) {
      schema.anyOf.forEach((s) => {
        collectSchemaNames(s, targetSet)
      })
    }
    if (schema.oneOf) {
      schema.oneOf.forEach((s) => {
        collectSchemaNames(s, targetSet)
      })
    }

    // Check properties
    if (schema.properties) {
      Object.values(schema.properties).forEach((prop) => {
        collectSchemaNames(prop, targetSet)
      })
    }

    // Check items (for arrays)
    if (schema.type === 'array' && 'items' in schema && schema.items) {
      collectSchemaNames(schema.items, targetSet)
    }
  }

  // Track which schemas are used in request body and responses
  const requestSchemaNames = new Set<string>()
  const responseSchemaNames = new Set<string>()

  // First, collect schema names used in request body and responses
  if (schema.paths) {
    for (const pathItem of Object.values(schema.paths)) {
      if (!pathItem) continue

      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const
      for (const method of methods) {
        const operation = pathItem[method]
        if (!operation) continue

        // Collect request body schemas
        if (operation.requestBody) {
          if ('$ref' in operation.requestBody) {
            // Extract schema name from $ref if it's a schema reference
            const schemaName = extractSchemaNameFromRef(
              operation.requestBody.$ref,
            )
            if (schemaName) {
              requestSchemaNames.add(schemaName)
            }
          } else {
            const content = operation.requestBody.content
            const jsonContent = content?.['application/json']
            if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
              collectSchemaNames(jsonContent.schema, requestSchemaNames)
            }
          }
        }

        // Collect response schemas
        if (operation.responses) {
          for (const response of Object.values(operation.responses)) {
            if ('$ref' in response) {
              // Extract schema name from $ref if it's a schema reference
              const schemaName = extractSchemaNameFromRef(response.$ref)
              if (schemaName) {
                responseSchemaNames.add(schemaName)
              }
            } else if ('content' in response) {
              const content = response.content
              const jsonContent = content?.['application/json']
              if (
                jsonContent &&
                'schema' in jsonContent &&
                jsonContent.schema
              ) {
                collectSchemaNames(jsonContent.schema, responseSchemaNames)
              }
            }
          }
        }
      }
    }
  }

  // Iterate through OpenAPI paths and extract each endpoint
  if (schema.paths) {
    for (const [path, pathItem] of Object.entries(schema.paths)) {
      if (!pathItem) continue

      // Process each HTTP method
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const

      for (const method of methods) {
        const operation = pathItem[method]
        if (!operation) continue

        const endpoint: EndpointDefinition = {}

        // Extract parameters (path, query, header)
        const { pathParams, queryParams } = extractParameters(
          pathItem,
          operation,
          schema,
        )

        // Apply case conversion to parameter names
        const convertedPathParams: Record<string, ParameterDefinition> = {}
        for (const [key, value] of Object.entries(pathParams)) {
          const convertedKey = convertCase(key, convertCaseType)
          convertedPathParams[convertedKey] = value
        }

        const convertedQueryParams: Record<string, ParameterDefinition> = {}
        for (const [key, value] of Object.entries(queryParams)) {
          const convertedKey = convertCase(key, convertCaseType)
          convertedQueryParams[convertedKey] = value
        }

        if (Object.keys(convertedPathParams).length > 0) {
          endpoint.params = convertedPathParams
        }
        if (Object.keys(convertedQueryParams).length > 0) {
          endpoint.query = convertedQueryParams
        }

        // Extract request body
        // Check if request body uses a component schema
        let requestBodyType: unknown
        if (operation.requestBody) {
          if ('$ref' in operation.requestBody) {
            // RequestBodyObject reference - skip for now
            const requestBody = extractRequestBody(
              operation.requestBody,
              schema,
            )
            if (requestBody !== undefined) {
              requestBodyType = requestBody
            }
          } else {
            const content = operation.requestBody.content
            const jsonContent = content?.['application/json']
            if (jsonContent && 'schema' in jsonContent && jsonContent.schema) {
              // Check if schema is a direct reference to components.schemas
              if ('$ref' in jsonContent.schema) {
                const schemaName = extractSchemaNameFromRef(
                  jsonContent.schema.$ref,
                )
                // Check if schema exists in components.schemas and is used in request body
                if (
                  schemaName &&
                  schema.components?.schemas?.[schemaName] &&
                  requestSchemaNames.has(schemaName)
                ) {
                  // Use component reference
                  requestBodyType = `DevupRequestComponentStruct['${schemaName}']`
                } else {
                  const requestBody = extractRequestBody(
                    operation.requestBody,
                    schema,
                  )
                  if (requestBody !== undefined) {
                    requestBodyType = requestBody
                  }
                }
              } else {
                const requestBody = extractRequestBody(
                  operation.requestBody,
                  schema,
                )
                if (requestBody !== undefined) {
                  requestBodyType = requestBody
                }
              }
            }
          }
        }
        if (requestBodyType !== undefined) {
          endpoint.body = requestBodyType
        }

        // Extract response
        // Check if response uses a component schema
        let responseType: unknown
        if (operation.responses) {
          // Prefer 200 response, fallback to first available response
          const successResponse =
            operation.responses['200'] ||
            operation.responses['201'] ||
            Object.values(operation.responses)[0]

          if (successResponse) {
            if ('$ref' in successResponse) {
              // ResponseObject reference - skip for now
              // Could resolve if needed
            } else if ('content' in successResponse) {
              const content = successResponse.content
              const jsonContent = content?.['application/json']
              if (
                jsonContent &&
                'schema' in jsonContent &&
                jsonContent.schema
              ) {
                // Check if schema is a direct reference to components.schemas
                if ('$ref' in jsonContent.schema) {
                  const schemaName = extractSchemaNameFromRef(
                    jsonContent.schema.$ref,
                  )
                  // Check if schema exists in components.schemas and is used in response
                  if (
                    schemaName &&
                    schema.components?.schemas?.[schemaName] &&
                    responseSchemaNames.has(schemaName)
                  ) {
                    // Use component reference
                    responseType = `DevupResponseComponentStruct['${schemaName}']`
                  } else {
                    // Extract schema type with response options
                    const responseDefaultNonNullable =
                      options?.responseDefaultNonNullable ?? true
                    const { type: schemaType } = getTypeFromSchema(
                      jsonContent.schema,
                      schema,
                      { defaultNonNullable: responseDefaultNonNullable },
                    )
                    responseType = schemaType
                  }
                } else {
                  // Check if it's an array with items referencing a component schema
                  const schemaObj =
                    jsonContent.schema as OpenAPIV3_1.SchemaObject
                  if (
                    schemaObj.type === 'array' &&
                    schemaObj.items &&
                    '$ref' in schemaObj.items
                  ) {
                    const schemaName = extractSchemaNameFromRef(
                      schemaObj.items.$ref,
                    )
                    // Check if schema exists in components.schemas and is used in response
                    if (
                      schemaName &&
                      schema.components?.schemas?.[schemaName] &&
                      responseSchemaNames.has(schemaName)
                    ) {
                      // Use component reference for array items
                      responseType = `Array<DevupResponseComponentStruct['${schemaName}']>`
                    } else {
                      // Extract schema type with response options
                      const responseDefaultNonNullable =
                        options?.responseDefaultNonNullable ?? true
                      const { type: schemaType } = getTypeFromSchema(
                        jsonContent.schema,
                        schema,
                        { defaultNonNullable: responseDefaultNonNullable },
                      )
                      responseType = schemaType
                    }
                  } else {
                    // Extract schema type with response options
                    const responseDefaultNonNullable =
                      options?.responseDefaultNonNullable ?? true
                    const { type: schemaType } = getTypeFromSchema(
                      jsonContent.schema,
                      schema,
                      { defaultNonNullable: responseDefaultNonNullable },
                    )
                    responseType = schemaType
                  }
                }
              }
            }
          }
        }
        if (responseType !== undefined) {
          endpoint.response = responseType
        }

        // Generate path key (normalize path by replacing {param} with converted param and removing slashes)
        const normalizedPath = path.replace(/\{([^}]+)\}/g, (_, param) => {
          // Convert param name based on case type
          return `{${convertCase(param, convertCaseType)}}`
        })

        endpoints[method][normalizedPath] = endpoint
        if (operation.operationId) {
          // If operationId exists, create both operationId and path keys
          const operationIdKey = convertCase(
            operation.operationId,
            convertCaseType,
          )
          endpoints[method][operationIdKey] = endpoint
        }
      }
    }
  }

  // Extract components schemas
  const requestComponents: Record<string, unknown> = {}
  const responseComponents: Record<string, unknown> = {}
  if (schema.components?.schemas) {
    for (const [schemaName, schemaObj] of Object.entries(
      schema.components.schemas,
    )) {
      if (schemaObj) {
        const requestDefaultNonNullable =
          options?.requestDefaultNonNullable ?? false
        const responseDefaultNonNullable =
          options?.responseDefaultNonNullable ?? true

        const { type: schemaType } = getTypeFromSchema(
          schemaObj as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
          schema,
          requestSchemaNames.has(schemaName)
            ? { defaultNonNullable: requestDefaultNonNullable }
            : { defaultNonNullable: responseDefaultNonNullable },
        )
        // Keep original schema name as-is
        if (requestSchemaNames.has(schemaName)) {
          requestComponents[schemaName] = schemaType
        }
        if (responseSchemaNames.has(schemaName)) {
          responseComponents[schemaName] = schemaType
        }
      }
    }
  }

  // Generate TypeScript interface string
  const interfaceContent = Object.entries(endpoints)
    .flatMap(([method, value]) => {
      const entries = Object.entries(value)
      if (entries.length > 0) {
        const interfaceEntries = entries
          .map(([key, endpointValue]) => {
            const formattedValue = formatTypeValue(endpointValue, 2)
            // Top-level keys in ApiStruct should never be optional
            // Only params, query, body etc. can be optional if all their properties are optional
            return `    ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
          })
          .join(';\n')

        return [
          `  interface Devup${toPascal(method)}ApiStruct {\n${interfaceEntries};\n  }`,
        ]
      }
      return []
    })
    .join('\n')

  // Generate RequestComponentStruct interface
  const requestComponentEntries = Object.entries(requestComponents)
    .map(([key, value]) => {
      const formattedValue = formatTypeValue(value, 2)
      return `    ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
    })
    .join(';\n')

  const requestComponentInterface =
    requestComponentEntries.length > 0
      ? `  interface DevupRequestComponentStruct {\n${requestComponentEntries};\n  }`
      : '  interface DevupRequestComponentStruct {}'

  // Generate ResponseComponentStruct interface
  const responseComponentEntries = Object.entries(responseComponents)
    .map(([key, value]) => {
      const formattedValue = formatTypeValue(value, 2)
      return `    ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
    })
    .join(';\n')

  const responseComponentInterface =
    responseComponentEntries.length > 0
      ? `  interface DevupResponseComponentStruct {\n${responseComponentEntries};\n  }`
      : '  interface DevupResponseComponentStruct {}'

  const allInterfaces = interfaceContent
    ? `${interfaceContent}\n\n${requestComponentInterface}\n\n${responseComponentInterface}`
    : `${requestComponentInterface}\n\n${responseComponentInterface}`

  return `import "@devup-api/fetch";\n\ndeclare module "@devup-api/fetch" {\n${allInterfaces}\n}`
}
