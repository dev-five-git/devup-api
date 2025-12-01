import type { ConditionalKeys, DevupApiServers } from '@devup-api/core'
import { DevupApi } from './api'

// Implementation
export function createApi<
  S extends ConditionalKeys<DevupApiServers, string> = 'openapi.json',
>({
  baseUrl = '',
  serverName = 'openapi.json' as S,
  ...defaultOptions
}: {
  baseUrl?: string
  serverName?: S
} & RequestInit = {}): DevupApi<S> {
  return new DevupApi(baseUrl, defaultOptions, serverName)
}
