import type { DevupApiServers } from './api-struct'
import type { Middleware } from './middleware'

export type Additional<
  T extends string,
  Target extends object,
> = T extends keyof Target ? Target[T] & object : object

export type RequiredOptions<T extends object> = keyof T extends undefined
  ? never
  : 'params' extends keyof T
    ? T
    : 'query' extends keyof T
      ? T
      : 'body' extends keyof T
        ? T
        : never
export type IsCold = keyof DevupApiServers extends never ? true : false
export type DevupApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: object | RequestInit['body']
  params?: Record<string, string | number | boolean | null | undefined>
  query?:
    | ConstructorParameters<typeof URLSearchParams>[0]
    | Record<
        string,
        | string
        | number
        | boolean
        | null
        | undefined
        | (number | string | boolean)[]
      >
  middleware?: Middleware[]
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type
export type ExtractValue<T, V extends string, F = any> = V extends keyof T
  ? T[V]
  : F

export type BoildApiOption<O> = Omit<DevupApiRequestInit, 'params'> &
  Omit<O, 'response' | 'error'>
export type ConditionalApiOption<O> = IsCold extends true
  ? DevupApiRequestInit
  : BoildApiOption<O>

export type ApiOption<O extends object, R extends unknown[] = []> = [
  RequiredOptions<O>,
] extends [never]
  ? [options?: ConditionalApiOption<O>, ...R]
  : [options: BoildApiOption<O>, ...R]
