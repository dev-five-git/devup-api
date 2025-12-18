import type { ExtractValue } from './additional'

export type ConditionalKeys<T, F = string> = keyof T extends undefined
  ? F
  : keyof T & string
export type ConditionalScope<T, K extends string> = ExtractValue<T, K, object>

export type PromiseOr<T> = Promise<T> | T
