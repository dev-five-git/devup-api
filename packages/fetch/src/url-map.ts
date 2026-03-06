import type { HttpMethod, UrlMapEntry, UrlMapValue } from '@devup-api/core'

export const DEVUP_API_URL_MAP: Record<
  string,
  Record<string, UrlMapEntry>
> = JSON.parse(process.env.DEVUP_API_URL_MAP || '{}')

export function getApiEndpointInfo(
  key: string,
  serverName: string,
  method: HttpMethod,
): UrlMapValue {
  const stored = DEVUP_API_URL_MAP[serverName]?.[key]?.[method]
  return { method, url: key, ...stored }
}
