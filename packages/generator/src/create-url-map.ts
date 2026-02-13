import type { DevupApiTypeGeneratorOptions, UrlMapValue } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'
import { resolveRef } from './openapi-utils'

function getBodyType(
  operation: OpenAPIV3_1.OperationObject,
  document: OpenAPIV3_1.Document,
): 'form' | 'multipart' | undefined {
  const requestBody = operation.requestBody
  if (!requestBody) return undefined

  let content: OpenAPIV3_1.RequestBodyObject['content'] | undefined
  if ('$ref' in requestBody) {
    const resolved = resolveRef<OpenAPIV3_1.RequestBodyObject>(
      requestBody.$ref,
      document,
    )
    content = resolved?.content
  } else {
    content = requestBody.content
  }

  if (!content) return undefined
  if (content['application/x-www-form-urlencoded']) return 'form'
  if (content['multipart/form-data']) return 'multipart'
  return undefined
}

export function createUrlMap(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiTypeGeneratorOptions,
): Record<string, Record<string, UrlMapValue>> {
  const convertCaseType = options?.convertCase ?? 'camel'
  const urlMaps: Record<string, Record<string, UrlMapValue>> = {}

  for (const [serverName, schema] of Object.entries(schemas)) {
    const urlMap: Record<string, UrlMapValue> = {}
    for (const [path, pathItem] of Object.entries(schema.paths ?? {})) {
      if (!pathItem) continue
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const operation = pathItem[method]
        if (!operation) continue
        const normalizedPath = path.replace(/\{([^}]+)\}/g, (_, param) => {
          // Convert param name based on case type
          return `{${convertCase(param, convertCaseType)}}`
        })
        const bodyType = getBodyType(operation, schema)
        const value: UrlMapValue = {
          method: method.toUpperCase() as
            | 'GET'
            | 'POST'
            | 'PUT'
            | 'DELETE'
            | 'PATCH',
          url: normalizedPath,
          ...(bodyType && { bodyType }),
        }
        if (operation.operationId) {
          urlMap[convertCase(operation.operationId, convertCaseType)] = value
        }
        urlMap[normalizedPath] = value
      }
    }
    urlMaps[serverName] = urlMap
  }
  return urlMaps
}
