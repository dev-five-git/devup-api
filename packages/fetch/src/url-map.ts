import type { UrlMapValue } from '@devup-api/core'

export const DEVUP_API_URL_MAP: Record<
  string,
  Record<string, UrlMapValue>
> = JSON.parse(process.env.DEVUP_API_URL_MAP || '{}')

export function getApiEndpointInfo(
  key: string,
  serverName: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
): UrlMapValue {
  const result = DEVUP_API_URL_MAP[serverName]?.[key] ?? {
    method,
    url: key,
  }
  result.url ||= key
  return result
}
