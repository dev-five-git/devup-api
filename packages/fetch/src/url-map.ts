import type { UrlMapValue } from '@devup-api/core'

export const DEVUP_API_URL_MAP: Record<string, UrlMapValue> = JSON.parse(
  process.env.DEVUP_API_URL_MAP || '{}',
)

export function getUrl(key: string): string {
  return DEVUP_API_URL_MAP[key]?.url || key
}

export function getUrlWithMethod(key: string): UrlMapValue {
  return DEVUP_API_URL_MAP[key] || { method: 'GET', url: key }
}
