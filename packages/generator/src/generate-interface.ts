import type { DevupApiTypeGeneratorOptions } from '@devup-api/core'
import { toPascal } from '@devup-api/utils'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'
import {
  extractParameters,
  extractRequestBody,
  formatType,
  formatTypeValue,
} from './generate-schema'

interface EndpointDefinition {
  params?: Record<string, unknown>
  body?: unknown
  query?: Record<string, unknown>
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
        const convertedPathParams: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(pathParams)) {
          const convertedKey = convertCase(key, convertCaseType)
          convertedPathParams[convertedKey] = value
        }

        const convertedQueryParams: Record<string, unknown> = {}
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
        const requestBody = extractRequestBody(operation.requestBody, schema)
        if (requestBody !== undefined) {
          endpoint.body = requestBody
        }

        // Generate path key (normalize path by replacing {param} with converted param and removing slashes)
        const normalizedPath = path
          .replace(/\{([^}]+)\}/g, (_, param) => {
            // Convert param name based on case type
            return convertCase(param, convertCaseType)
          })
          .replace(/^\//, '')
          .replace(/\//g, '')
        const pathKey = convertCase(normalizedPath, convertCaseType)

        if (operation.operationId) {
          // If operationId exists, create both operationId and path keys
          const operationIdKey = convertCase(
            operation.operationId,
            convertCaseType,
          )
          endpoints[method][operationIdKey] = endpoint

          // Add path key if different from operationId key
          if (pathKey && pathKey !== operationIdKey) {
            endpoints[method][pathKey] = endpoint
          }
        } else {
          // If operationId doesn't exist, only use path key
          if (pathKey) {
            endpoints[method][pathKey] = endpoint
          }
        }
      }
    }
  }

  // Generate TypeScript interface string
  const interfaceContent = Object.entries(endpoints)
    .flatMap(([method, value]) => {
      const entries = Object.entries(value)
      if (entries.length > 0) {
        return [
          `interface Devup${toPascal(method)}ApiStruct{${entries
            .map(([key, value]) => {
              return `${key}:${formatTypeValue(value)}`
            })
            .join(';')}}`,
        ]
      }
      return []
    })
    .flat()
  return `import "@devup-api/fetch";declare module "@devup-api/fetch"{${interfaceContent.join('')}}`
}
