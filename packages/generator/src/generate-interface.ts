import type { DevupApiTypeGeneratorOptions } from '@devup-api/core'
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
  const endpoints: Record<string, EndpointDefinition> = {}
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
          endpoints[operationIdKey] = endpoint

          // Add path key if different from operationId key
          if (pathKey && pathKey !== operationIdKey) {
            endpoints[pathKey] = endpoint
          }
        } else {
          // If operationId doesn't exist, only use path key
          if (pathKey) {
            endpoints[pathKey] = endpoint
          }
        }
      }
    }
  }

  // Generate TypeScript interface string
  const interfaceContent = Object.entries(endpoints)
    .map(([key, value]) => {
      const props: string[] = []

      if (value.params) {
        props.push(`params?: ${formatType(value.params)}`)
      }
      if (value.body) {
        props.push(`body?: ${formatTypeValue(value.body)}`)
      }
      if (value.query) {
        props.push(`query?: ${formatType(value.query)}`)
      }

      return `  ${key}: {\n    ${props.join(';\n    ')}${props.length > 0 ? ';' : ''}\n  }`
    })
    .join(';\n\n')

  return `import "@devup-api/fetch";
declare module "@devup-api/fetch" {
  interface devupApiStruct {
${interfaceContent}
  }
}`
}
