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

export type DevupObject<
  R extends 'response' | 'request' | 'error' = 'response',
  T extends keyof DevupApiServers | (string & {}) = 'openapi.json',
> = ExtractValue<
  {
    response: ExtractValue<DevupResponseComponentStruct, T>
    request: ExtractValue<DevupRequestComponentStruct, T>
    error: ExtractValue<DevupErrorComponentStruct, T>
  },
  R
>

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
export type DevupApiStructScope<O extends string> = DevupGetApiStructScope<O> &
  DevupPostApiStructScope<O> &
  DevupPutApiStructScope<O> &
  DevupDeleteApiStructScope<O> &
  DevupPatchApiStructScope<O>

export type DevupApiStructKey<O extends string> = ConditionalKeys<
  DevupApiStructScope<O>
>
