import type { ExtractValue } from './additional'
import type { ConditionalKeys, ConditionalScope } from './utils'

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupApiServers {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupGetApiStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupPostApiStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupPutApiStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupDeleteApiStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupPatchApiStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupRequestComponentStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupResponseComponentStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface
export interface DevupErrorComponentStruct {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation by generator
export interface DevupPrecomputedMethodKeys {}

// biome-ignore lint/suspicious/noEmptyInterface: empty interface for augmentation by generator
export interface DevupPrecomputedScopes {}

type LowercaseMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

type DevupComponentStructByRole = {
  response: DevupResponseComponentStruct
  request: DevupRequestComponentStruct
  error: DevupErrorComponentStruct
}

type DevupObjectAll<T extends string> = ExtractValue<
  DevupResponseComponentStruct,
  T,
  unknown
> &
  ExtractValue<DevupRequestComponentStruct, T, unknown> &
  ExtractValue<DevupErrorComponentStruct, T, unknown>

type DevupObjectSpecific<
  R extends keyof DevupComponentStructByRole,
  T extends string,
> = ExtractValue<DevupComponentStructByRole[R], T>

export type DevupObject<
  R extends keyof DevupComponentStructByRole = keyof DevupComponentStructByRole,
  T extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = [keyof DevupComponentStructByRole] extends [R]
  ? DevupObjectAll<T & string>
  : DevupObjectSpecific<R, T & string>

export type DevupGetApiStructScope<O extends string> = ConditionalScope<
  DevupGetApiStruct,
  O
>
export type DevupPostApiStructScope<O extends string> = ConditionalScope<
  DevupPostApiStruct,
  O
>
export type DevupPutApiStructScope<O extends string> = ConditionalScope<
  DevupPutApiStruct,
  O
>
export type DevupDeleteApiStructScope<O extends string> = ConditionalScope<
  DevupDeleteApiStruct,
  O
>
export type DevupPatchApiStructScope<O extends string> = ConditionalScope<
  DevupPatchApiStruct,
  O
>

export type DevupGetApiStructKey<O extends string> = ConditionalKeys<
  DevupGetApiStructScope<O>
>
export type DevupPostApiStructKey<O extends string> = ConditionalKeys<
  DevupPostApiStructScope<O>
>
export type DevupPutApiStructKey<O extends string> = ConditionalKeys<
  DevupPutApiStructScope<O>
>
export type DevupDeleteApiStructKey<O extends string> = ConditionalKeys<
  DevupDeleteApiStructScope<O>
>
export type DevupPatchApiStructKey<O extends string> = ConditionalKeys<
  DevupPatchApiStructScope<O>
>
export type DevupApiMethodKeys =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'

export type DevupApiMethodScope<
  S extends string,
  M extends DevupApiMethodKeys,
> = M extends 'get' | 'GET'
  ? DevupGetApiStructScope<S>
  : M extends 'post' | 'POST'
    ? DevupPostApiStructScope<S>
    : M extends 'put' | 'PUT'
      ? DevupPutApiStructScope<S>
      : M extends 'delete' | 'DELETE'
        ? DevupDeleteApiStructScope<S>
        : M extends 'patch' | 'PATCH'
          ? DevupPatchApiStructScope<S>
          : never

export type DevupApiMethodKey<
  S extends string,
  M extends DevupApiMethodKeys,
> = S extends keyof DevupPrecomputedMethodKeys
  ? ExtractValue<
      ExtractValue<DevupPrecomputedMethodKeys, S>,
      Lowercase<M> & LowercaseMethod,
      never
    >
  : ConditionalKeys<DevupApiMethodScope<S, M>>

export type DevupApiStructScope<O extends string> = DevupGetApiStructScope<O> &
  DevupPostApiStructScope<O> &
  DevupPutApiStructScope<O> &
  DevupDeleteApiStructScope<O> &
  DevupPatchApiStructScope<O>

export type DevupApiStructKey<O extends string> =
  | DevupGetApiStructKey<O>
  | DevupPostApiStructKey<O>
  | DevupPutApiStructKey<O>
  | DevupDeleteApiStructKey<O>
  | DevupPatchApiStructKey<O>
