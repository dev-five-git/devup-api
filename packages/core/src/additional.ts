export type Additional<
  T extends string,
  Target extends object,
> = T extends keyof Target ? Target[T] : object

export type RequiredOptions<T extends object> = keyof T extends undefined
  ? never
  : T
export type DevupApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: object | RequestInit['body']
  params?: Record<string, string | number | boolean | null | undefined>
}
