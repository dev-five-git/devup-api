export type Additional<
  T extends string,
  Target extends object,
> = T extends keyof Target ? Target[T] : object
