import type { ConditionalKeys, DevupApiServers } from '@devup-api/core'
import { DevupApi } from './api'

// Implementation
export function createApi<
  S extends ConditionalKeys<DevupApiServers, string> = 'openapi.json',
>(
  options:
    | string
    | ({
        baseUrl?: string
        serverName?: S
      } & RequestInit),
): DevupApi<S> {
  const {
    baseUrl = '',
    serverName = 'openapi.json' as S,
    ...defaultOptions
  } = typeof options === 'string' ? { baseUrl: options } : options
  return new DevupApi(baseUrl, defaultOptions, serverName)
}
