export function isPlainObject(obj: unknown): obj is object {
  if (obj === null || typeof obj !== 'object') return false

  const proto = Object.getPrototypeOf(obj)
  return proto === Object.prototype || proto === null
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
