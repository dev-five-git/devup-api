export type Additional<
  T extends string,
  Target extends object,
> = T extends keyof Target ? Target[T] & object : object

export type RequiredOptions<T extends object> = keyof T extends undefined
  ? never
  : T
export type DevupApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: object | RequestInit['body']
  params?: Record<string, string | number | boolean | null | undefined>
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type
export type ExtractValue<T, V extends string, F = any> = V extends keyof T
  ? T[V]
  : F
