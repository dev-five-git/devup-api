import { DevupApi } from './api'

export function createApi(
  baseUrl: string,
  defaultOptions?: RequestInit,
): DevupApi {
  return new DevupApi(baseUrl, defaultOptions)
}
