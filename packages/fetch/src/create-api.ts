import { devupApi } from './api'

export function createApi(baseUrl: string, defaultOptions?: RequestInit) {
  return new devupApi(baseUrl, defaultOptions).get('a')
}
