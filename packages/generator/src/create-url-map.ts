import type {
  DevupApiTypeGeneratorOptions,
  HttpMethod,
  UrlMapEntry,
  UrlMapStoredValue,
} from '@devup-api/core'
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
): Record<string, Record<string, UrlMapEntry>> {
  const convertCaseType = options?.convertCase ?? 'camel'
  const urlMaps: Record<string, Record<string, UrlMapEntry>> = {}

  for (const [serverName, schema] of Object.entries(schemas)) {
    const urlMap: Record<string, UrlMapEntry> = {}
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
        const methodKey = method.toUpperCase() as HttpMethod
        const value: UrlMapStoredValue = {
          url: normalizedPath,
          ...(bodyType && { bodyType }),
        }
        if (operation.operationId) {
          const opKey = convertCase(operation.operationId, convertCaseType)
          urlMap[opKey] = { ...urlMap[opKey], [methodKey]: value }
        }
        urlMap[normalizedPath] = {
          ...urlMap[normalizedPath],
          [methodKey]: value,
        }
      }
    }
    urlMaps[serverName] = urlMap
  }
  return urlMaps
}
