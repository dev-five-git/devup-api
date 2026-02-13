import type { DevupApiTypeGeneratorOptions } from '@devup-api/core'
import { toPascal } from '@devup-api/utils'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'
import {
  createSchemaContext,
  type EnumDefinition,
  extractParameters,
  extractRequestBody,
  formatTypeValue,
  getTypeFromSchema,
} from './generate-schema'
import {
  collectSchemaNames,
  extractSchemaNameFromRef,
  getRequestBodyContent,
  isErrorStatusCode,
  normalizeServerName,
} from './openapi-utils'
import { wrapInterfaceKeyGuard } from './wrap-interface-key-guard'

export interface ParameterDefinition
  extends Omit<OpenAPIV3_1.ParameterObject, 'schema'> {
  type: unknown
  default?: unknown
}

export interface EndpointDefinition {
  params?: Record<string, ParameterDefinition>
  body?: unknown
  query?: Record<string, ParameterDefinition>
  response?: unknown
  error?: unknown
}

// Extract schema type from a response/error object's JSON content.
// Shared logic for both success response and error response extraction.
function extractContentType(
  responseObj:
    | OpenAPIV3_1.ResponseObject
    | OpenAPIV3_1.ReferenceObject
    | undefined,
  componentType: 'response' | 'error',
  schemaNames: Set<string>,
  schema: OpenAPIV3_1.Document,
  serverName: string,
  enumContext: ReturnType<typeof createSchemaContext>,
  options?: DevupApiTypeGeneratorOptions,
): unknown {
  if (!responseObj) return undefined
  if ('$ref' in responseObj) {
    // ResponseObject reference - skip for now
    return undefined
  }
  if (!('content' in responseObj)) return undefined

  const content = responseObj.content
  const jsonContent = content?.['application/json']
  if (!jsonContent || !('schema' in jsonContent) || !jsonContent.schema) {
    return undefined
  }

  const contextLabel = componentType === 'response' ? 'Response' : 'Error'
  const responseDefaultNonNullable = options?.responseDefaultNonNullable ?? true

  const extractInlineType = (
    schemaRef: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  ): unknown => {
    const inlineContext = createSchemaContext(contextLabel)
    const { type: schemaType } = getTypeFromSchema(schemaRef, schema, {
      defaultNonNullable: responseDefaultNonNullable,
      context: inlineContext,
      serverName,
      componentType,
      usedSchemaNames: schemaNames,
    })
    for (const [enumName, enumDef] of inlineContext.enums) {
      if (!enumContext.enums.has(enumName)) {
        enumContext.enums.set(enumName, enumDef)
      }
    }
    return schemaType
  }

  // Check if schema is a direct reference to components.schemas
  if ('$ref' in jsonContent.schema) {
    const schemaName = extractSchemaNameFromRef(jsonContent.schema.$ref)
    if (
      schemaName &&
      schema.components?.schemas?.[schemaName] &&
      schemaNames.has(schemaName)
    ) {
      return `DevupObject<'${componentType}', '${serverName}'>['${schemaName}']`
    }
    return extractInlineType(jsonContent.schema)
  }

  // Check if it's an array with items referencing a component schema
  const schemaObj = jsonContent.schema as OpenAPIV3_1.SchemaObject
  if (
    schemaObj.type === 'array' &&
    schemaObj.items &&
    '$ref' in schemaObj.items
  ) {
    const schemaName = extractSchemaNameFromRef(schemaObj.items.$ref)
    if (
      schemaName &&
      schema.components?.schemas?.[schemaName] &&
      schemaNames.has(schemaName)
    ) {
      return `Array<DevupObject<'${componentType}', '${serverName}'>['${schemaName}']>`
    }
    return extractInlineType(jsonContent.schema)
  }

  // Extract schema type (inline schema)
  return extractInlineType(jsonContent.schema)
}

// Generate interface for a single schema
function generateSchemaInterface(
  schema: OpenAPIV3_1.Document,
  serverName: string,
  options?: DevupApiTypeGeneratorOptions,
): {
  endpoints: Record<
    'get' | 'post' | 'put' | 'delete' | 'patch',
    Record<string, EndpointDefinition>
  >
  requestComponents: Record<string, unknown>
  responseComponents: Record<string, unknown>
  errorComponents: Record<string, unknown>
  enumDefinitions: Map<string, EnumDefinition>
} {
  // Create context for tracking enums
  const enumContext = createSchemaContext()
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

  const collectOpts = {
    followComponentRefs: true,
    document: schema,
  } as const

  // Track which schemas are used in request body and responses
  const requestSchemaNames = new Set<string>()
  const responseSchemaNames = new Set<string>()
  const errorSchemaNames = new Set<string>()

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
            const bodyContent = getRequestBodyContent(content)
            if (bodyContent && 'schema' in bodyContent && bodyContent.schema) {
              collectSchemaNames(
                bodyContent.schema,
                requestSchemaNames,
                collectOpts,
              )
            }
          }
        }

        // Collect response and error schemas
        if (operation.responses) {
          for (const [statusCode, response] of Object.entries(
            operation.responses,
          )) {
            const isError = isErrorStatusCode(statusCode)
            if ('$ref' in response) {
              // Extract schema name from $ref if it's a schema reference
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
              if (
                jsonContent &&
                'schema' in jsonContent &&
                jsonContent.schema
              ) {
                if (isError) {
                  collectSchemaNames(
                    jsonContent.schema,
                    errorSchemaNames,
                    collectOpts,
                  )
                } else {
                  collectSchemaNames(
                    jsonContent.schema,
                    responseSchemaNames,
                    collectOpts,
                  )
                }
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
            const bodyContent = getRequestBodyContent(content)
            if (bodyContent && 'schema' in bodyContent && bodyContent.schema) {
              // Check if schema is a direct reference to components.schemas
              if ('$ref' in bodyContent.schema) {
                const schemaName = extractSchemaNameFromRef(
                  bodyContent.schema.$ref,
                )
                // Check if schema exists in components.schemas and is used in request body
                if (
                  schemaName &&
                  schema.components?.schemas?.[schemaName] &&
                  requestSchemaNames.has(schemaName)
                ) {
                  // Use component reference
                  requestBodyType = `DevupObject<'request', '${serverName}'>['${schemaName}']`
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
                // Check for raw multipart: multipart/form-data with empty/generic object schema
                const schemaObj = bodyContent.schema as OpenAPIV3_1.SchemaObject
                const isMultipart =
                  content?.['multipart/form-data'] !== undefined &&
                  !content?.['application/json'] &&
                  !content?.['application/x-www-form-urlencoded']
                const isEmptyObject =
                  schemaObj.type === 'object' &&
                  (!schemaObj.properties ||
                    Object.keys(schemaObj.properties).length === 0) &&
                  !schemaObj.allOf &&
                  !schemaObj.anyOf &&
                  !schemaObj.oneOf

                if (isMultipart && isEmptyObject) {
                  // Raw multipart with no typed schema
                  requestBodyType = 'FormData | Record<string, unknown>'
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
        }
        if (requestBodyType !== undefined) {
          endpoint.body = requestBodyType
        }

        // Extract response
        // Check if response uses a component schema
        if (operation.responses) {
          // Prefer 200 response, fallback to first available response
          const successResponse =
            operation.responses['200'] ||
            operation.responses['201'] ||
            Object.values(operation.responses)[0]

          const responseType = extractContentType(
            successResponse,
            'response',
            responseSchemaNames,
            schema,
            serverName,
            enumContext,
            options,
          )
          if (responseType !== undefined) {
            endpoint.response = responseType
          }
        }

        // Extract error
        // Check if error uses a component schema
        if (operation.responses) {
          // Find error responses (4xx, 5xx, or default)
          const errorResponse =
            operation.responses['400'] ||
            operation.responses['401'] ||
            operation.responses['403'] ||
            operation.responses['404'] ||
            operation.responses['422'] ||
            operation.responses['500'] ||
            operation.responses.default ||
            Object.entries(operation.responses).find(([statusCode]) =>
              isErrorStatusCode(statusCode),
            )?.[1]

          const errorType = extractContentType(
            errorResponse,
            'error',
            errorSchemaNames,
            schema,
            serverName,
            enumContext,
            options,
          )
          if (errorType !== undefined) {
            endpoint.error = errorType
          }
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
  // Generate separately for each context (request/response/error) to:
  // 1. Apply correct defaultNonNullable per context
  // 2. Use appropriate usedSchemaNames for nested $ref resolution
  const requestComponents: Record<string, unknown> = {}
  const responseComponents: Record<string, unknown> = {}
  const errorComponents: Record<string, unknown> = {}
  if (schema.components?.schemas) {
    const requestDefaultNonNullable =
      options?.requestDefaultNonNullable ?? false
    const responseDefaultNonNullable =
      options?.responseDefaultNonNullable ?? true

    for (const [schemaName, schemaObj] of Object.entries(
      schema.components.schemas,
    )) {
      if (schemaObj) {
        // Skip enum schemas - they are defined as top-level type aliases
        // and referenced directly by type name (e.g., Gender instead of DevupObject<...>['Gender'])
        const typedSchemaObj = schemaObj as OpenAPIV3_1.SchemaObject
        if ('enum' in typedSchemaObj && typedSchemaObj.enum) {
          // Still need to collect enum definition for top-level type alias
          const schemaContext = createSchemaContext(schemaName)
          getTypeFromSchema(typedSchemaObj, schema, { context: schemaContext })
          for (const [enumName, enumDef] of schemaContext.enums) {
            if (!enumContext.enums.has(enumName)) {
              enumContext.enums.set(enumName, enumDef)
            }
          }
          continue
        }

        // Generate for request context
        if (requestSchemaNames.has(schemaName)) {
          const schemaContext = createSchemaContext(schemaName)
          const { type: schemaType } = getTypeFromSchema(
            schemaObj as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
            schema,
            {
              defaultNonNullable: requestDefaultNonNullable,
              context: schemaContext,
              serverName,
              componentType: 'request',
              usedSchemaNames: requestSchemaNames,
            },
          )
          // Merge enums
          for (const [enumName, enumDef] of schemaContext.enums) {
            if (!enumContext.enums.has(enumName)) {
              enumContext.enums.set(enumName, enumDef)
            }
          }
          requestComponents[schemaName] = schemaType
        }

        // Generate for response context
        if (responseSchemaNames.has(schemaName)) {
          const schemaContext = createSchemaContext(schemaName)
          const { type: schemaType } = getTypeFromSchema(
            schemaObj as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
            schema,
            {
              defaultNonNullable: responseDefaultNonNullable,
              context: schemaContext,
              serverName,
              componentType: 'response',
              usedSchemaNames: responseSchemaNames,
            },
          )
          // Merge enums
          for (const [enumName, enumDef] of schemaContext.enums) {
            if (!enumContext.enums.has(enumName)) {
              enumContext.enums.set(enumName, enumDef)
            }
          }
          responseComponents[schemaName] = schemaType
        }

        // Generate for error context
        if (errorSchemaNames.has(schemaName)) {
          const schemaContext = createSchemaContext(schemaName)
          const { type: schemaType } = getTypeFromSchema(
            schemaObj as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
            schema,
            {
              defaultNonNullable: responseDefaultNonNullable,
              context: schemaContext,
              serverName,
              componentType: 'error',
              usedSchemaNames: errorSchemaNames,
            },
          )
          // Merge enums
          for (const [enumName, enumDef] of schemaContext.enums) {
            if (!enumContext.enums.has(enumName)) {
              enumContext.enums.set(enumName, enumDef)
            }
          }
          errorComponents[schemaName] = schemaType
        }
      }
    }
  }

  return {
    endpoints,
    requestComponents,
    responseComponents,
    errorComponents,
    enumDefinitions: enumContext.enums,
  }
}

export function generateInterface(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiTypeGeneratorOptions,
): string {
  // Collect all server names for DevupApiServers (normalized without ./ prefix)
  const serverNames: string[] = []
  const serverNameMap = new Map<string, string>() // normalized -> original

  // Collect endpoints, components for each server
  const serverEndpoints: Record<
    string,
    Record<
      'get' | 'post' | 'put' | 'delete' | 'patch',
      Record<string, EndpointDefinition>
    >
  > = {}
  const serverRequestComponents: Record<string, Record<string, unknown>> = {}
  const serverResponseComponents: Record<string, Record<string, unknown>> = {}
  const serverErrorComponents: Record<string, Record<string, unknown>> = {}

  // Collect all enum definitions across all servers
  const allEnumDefinitions = new Map<string, EnumDefinition>()

  for (const [originalServerName, schema] of Object.entries(schemas)) {
    const normalizedServerName = normalizeServerName(originalServerName)
    serverNames.push(normalizedServerName)
    serverNameMap.set(normalizedServerName, originalServerName)
    const {
      endpoints,
      requestComponents,
      responseComponents,
      errorComponents,
      enumDefinitions,
    } = generateSchemaInterface(schema, normalizedServerName, options)

    serverEndpoints[normalizedServerName] = endpoints
    serverRequestComponents[normalizedServerName] = requestComponents
    serverResponseComponents[normalizedServerName] = responseComponents
    serverErrorComponents[normalizedServerName] = errorComponents

    // Merge enum definitions
    for (const [enumName, enumDef] of enumDefinitions) {
      if (!allEnumDefinitions.has(enumName)) {
        allEnumDefinitions.set(enumName, enumDef)
      }
    }
  }

  // Generate DevupApiServers interface (just server names with never)
  const serverKeys = serverNames
    .map((name) => `    ${wrapInterfaceKeyGuard(name)}: never`)
    .join(';\n')
  const serversInterface = `  interface DevupApiServers {\n${serverKeys}\n  }`

  // Generate HTTP method interfaces (each server as a key)
  const methodInterfaces: string[] = []
  const methods: Array<'get' | 'post' | 'put' | 'delete' | 'patch'> = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
  ]

  for (const method of methods) {
    const methodEntries: string[] = []

    for (const serverName of serverNames) {
      const endpoints = serverEndpoints[serverName]?.[method]
      if (endpoints && Object.keys(endpoints).length > 0) {
        const endpointEntries = Object.entries(endpoints)
          .map(([key, endpointValue]) => {
            const formattedValue = formatTypeValue(endpointValue, 3)
            return `      ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
          })
          .join(';\n')

        const serverKey = wrapInterfaceKeyGuard(serverName)
        methodEntries.push(`    ${serverKey}: {\n${endpointEntries};\n    }`)
      }
      // Skip empty endpoints - don't add empty objects
    }

    if (methodEntries.length > 0) {
      const interfaceName = `Devup${toPascal(method)}ApiStruct`
      methodInterfaces.push(
        `  interface ${interfaceName} {\n${methodEntries.join(';\n')}\n  }`,
      )
    }
  }

  // Generate component interfaces (each server as a key)
  const requestComponentEntries: string[] = []
  const responseComponentEntries: string[] = []
  const errorComponentEntries: string[] = []

  for (const serverName of serverNames) {
    const serverKey = wrapInterfaceKeyGuard(serverName)

    // Request components
    const reqComponents = serverRequestComponents[serverName] || {}
    if (Object.keys(reqComponents).length > 0) {
      const reqEntries = Object.entries(reqComponents)
        .map(([key, value]) => {
          const formattedValue = formatTypeValue(value, 3)
          return `      ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
        })
        .join(';\n')
      requestComponentEntries.push(`    ${serverKey}: {\n${reqEntries};\n    }`)
    }
    // Skip empty components - don't add empty objects

    // Response components
    const resComponents = serverResponseComponents[serverName] || {}
    if (Object.keys(resComponents).length > 0) {
      const resEntries = Object.entries(resComponents)
        .map(([key, value]) => {
          const formattedValue = formatTypeValue(value, 3)
          return `      ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
        })
        .join(';\n')
      responseComponentEntries.push(
        `    ${serverKey}: {\n${resEntries};\n    }`,
      )
    }
    // Skip empty components - don't add empty objects

    // Error components
    const errComponents = serverErrorComponents[serverName] || {}
    if (Object.keys(errComponents).length > 0) {
      const errEntries = Object.entries(errComponents)
        .map(([key, value]) => {
          const formattedValue = formatTypeValue(value, 2)
          return `      ${wrapInterfaceKeyGuard(key)}: ${formattedValue}`
        })
        .join(';\n')
      errorComponentEntries.push(`    ${serverKey}: {\n${errEntries};\n    }`)
    }
    // Skip empty components - don't add empty objects
  }

  const requestComponentInterface =
    requestComponentEntries.length > 0
      ? `  interface DevupRequestComponentStruct {\n${requestComponentEntries.join(';\n')}\n  }`
      : '  interface DevupRequestComponentStruct {}'

  const responseComponentInterface =
    responseComponentEntries.length > 0
      ? `  interface DevupResponseComponentStruct {\n${responseComponentEntries.join(';\n')}\n  }`
      : '  interface DevupResponseComponentStruct {}'

  const errorComponentInterface =
    errorComponentEntries.length > 0
      ? `  interface DevupErrorComponentStruct {\n${errorComponentEntries.join(';\n')}\n  }`
      : '  interface DevupErrorComponentStruct {}'

  // Generate enum type aliases
  const enumTypeAliases: string[] = []
  for (const [enumName, enumDef] of allEnumDefinitions) {
    const values = enumDef.values.map((v) => `"${String(v)}"`).join(' | ')
    enumTypeAliases.push(`  type ${enumName} = ${values}`)
  }

  // Combine all interfaces
  const allInterfaces = [
    serversInterface,
    ...methodInterfaces,
    requestComponentInterface,
    responseComponentInterface,
    errorComponentInterface,
  ].join('\n\n')

  // Generate enum types outside the module declaration (global types)
  const enumTypesBlock =
    enumTypeAliases.length > 0 ? `${enumTypeAliases.join('\n')}\n\n` : ''

  return `import "@devup-api/fetch";\nimport type { DevupObject } from "@devup-api/fetch";\n\ndeclare module "@devup-api/fetch" {\n${enumTypesBlock}${allInterfaces}\n}`
}
