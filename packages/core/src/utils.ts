import type { ExtractValue } from './additional'
import type { DevupApiServers } from './api-struct'

export type ConditionalKeys<T, F = string> = keyof DevupApiServers extends never
  ? F
  : keyof T & string
export type ConditionalScope<T, K extends string> = ExtractValue<T, K, object>

export type PromiseOr<T> = Promise<T> | T
