import type { UrlMapValue } from '@devup-api/core'

export const DEVUP_API_URL_MAP: Record<string, UrlMapValue> = JSON.parse(
  process.env.DEVUP_API_URL_MAP || '{}',
)

export function getApiEndpointInfo(key: string): UrlMapValue {
  const result = DEVUP_API_URL_MAP[key] ?? { method: 'GET', url: key }
  result.url ||= key
  return result
}
