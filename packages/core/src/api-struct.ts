import type { Conditional } from './utils'

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

export type DevupApiStruct = DevupGetApiStruct &
  DevupPostApiStruct &
  DevupPutApiStruct &
  DevupDeleteApiStruct &
  DevupPatchApiStruct

export type DevupGetApiStructKey = Conditional<DevupGetApiStruct>
export type DevupPostApiStructKey = Conditional<DevupPostApiStruct>
export type DevupPutApiStructKey = Conditional<DevupPutApiStruct>
export type DevupDeleteApiStructKey = Conditional<DevupDeleteApiStruct>
export type DevupPatchApiStructKey = Conditional<DevupPatchApiStruct>

export type DevupApiStructKey = Conditional<DevupApiStruct>
