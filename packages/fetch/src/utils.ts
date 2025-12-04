import type { DevupApiRequestInit } from '@devup-api/core'

export function isPlainObject(obj: unknown): obj is object {
  if (obj === null || typeof obj !== 'object') return false

  const proto = Object.getPrototypeOf(obj)
  return proto === Object.prototype
}

export function getApiEndpoint(
  baseUrl: string,
  path: string,
  params?: object,
): string {
  let ret = `${baseUrl}${path}`
  for (const [key, value] of Object.entries(params ?? {})) {
    ret = ret.replace(`{${key}}`, value)
  }
  return ret
}

export function getQueryString(
  query: NonNullable<DevupApiRequestInit['query']>,
): URLSearchParams {
  if (typeof query === 'string') {
    return new URLSearchParams(query)
  }
  if (isPlainObject(query)) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          params.append(key, String(v))
        }
      } else {
        params.append(key, String(value))
      }
    }
    return params
  }
  return new URLSearchParams(query)
}
