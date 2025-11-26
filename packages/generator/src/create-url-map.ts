import type { DevupApiTypeGeneratorOptions, UrlMapValue } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'

export function createUrlMap(
  schema: OpenAPIV3_1.Document,

  options?: DevupApiTypeGeneratorOptions,
) {
  const convertCaseType = options?.convertCase ?? 'camel'
  const urlMap: Record<string, UrlMapValue> = {}
  for (const [path, pathItem] of Object.entries(schema.paths ?? {})) {
    if (!pathItem) continue
    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const operation = pathItem[method]
      if (!operation) continue
      urlMap[convertCase(path, convertCaseType)] = { method, url: path }
    }
  }
  return urlMap
}
