export type ConditionalKeys<T, F = string> = keyof T extends undefined
  ? F
  : keyof T & string
export type ConditionalScope<T, K extends string> = K extends keyof T
  ? T[K]
  : object

export type PromiseOr<T> = Promise<T> | T
