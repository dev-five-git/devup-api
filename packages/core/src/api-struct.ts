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

export type DevupApiStruct = DevupGetApiStruct &
  DevupPostApiStruct &
  DevupPutApiStruct &
  DevupDeleteApiStruct &
  DevupPatchApiStruct

export type DevupGetApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupGetApiStruct, O>
>
export type DevupPostApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupPostApiStruct, O>
>
export type DevupPutApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupPutApiStruct, O>
>
export type DevupDeleteApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupDeleteApiStruct, O>
>
export type DevupPatchApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupPatchApiStruct, O>
>

export type DevupApiStructKey<O extends string> = ConditionalKeys<
  ConditionalScope<DevupApiStruct, O>
>
