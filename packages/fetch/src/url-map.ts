import type { UrlMapValue } from '@devup-api/core'

export const devup_URL_MAP: Record<string, UrlMapValue> = JSON.parse(
  process.env.DEVUP_API_URL_MAP || '{}',
)

export function getUrl(key: string): string {
  return devup_URL_MAP[key]?.url || key
}

export function getUrlWithMethod(key: string): UrlMapValue {
  return devup_URL_MAP[key] || { method: 'get', url: key }
}
