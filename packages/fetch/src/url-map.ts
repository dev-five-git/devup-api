export const devup_URL_MAP: Record<
  string,
  ['get' | 'post' | 'put' | 'delete' | 'patch', string]
> = JSON.parse(process.env.devup_URL_MAP || '{}')

export function getUrl(key: string): string {
  return devup_URL_MAP[key]?.[1] || key
}

export function getUrlWithMethod(
  key: string,
): ['get' | 'post' | 'put' | 'delete' | 'patch', string] {
  return devup_URL_MAP[key] || ['get', key]
}
