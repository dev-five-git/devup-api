import type { ConditionalKeys } from '@devup-api/core'
import type { DevupApi, DevupApiServers } from '@devup-api/fetch'
import { DevupQueryClient } from './query-client'

export function createQueryClient<S extends ConditionalKeys<DevupApiServers>>(
  api: DevupApi<S>,
): DevupQueryClient<S> {
  return new DevupQueryClient(api)
}
