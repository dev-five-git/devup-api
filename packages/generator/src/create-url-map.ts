import type { DevupApiTypeGeneratorOptions, UrlMapValue } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'

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
        if (operation.operationId) {
          urlMap[convertCase(operation.operationId, convertCaseType)] = {
            method: method.toUpperCase() as
              | 'GET'
              | 'POST'
              | 'PUT'
              | 'DELETE'
              | 'PATCH',
            url: normalizedPath,
          }
        }
        urlMap[normalizedPath] = {
          method: method.toUpperCase() as
            | 'GET'
            | 'POST'
            | 'PUT'
            | 'DELETE'
            | 'PATCH',
          url: normalizedPath,
        }
      }
    }
    urlMaps[serverName] = urlMap
  }
  return urlMaps
}
