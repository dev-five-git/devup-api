import type { ConditionalKeys, DevupApiServers } from '@devup-api/core'
import { DevupApi } from './api'

// Implementation
export function createApi<
  S extends ConditionalKeys<DevupApiServers, string> = 'openapi.json',
>(
  baseUrl: string,
  defaultOptions?: RequestInit,
  serverName: S = 'openapi.json' as S,
): DevupApi<S> {
  return new DevupApi(baseUrl, defaultOptions, serverName)
}
