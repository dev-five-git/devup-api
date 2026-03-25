import type {
  Additional,
  ApiOption,
  ConditionalApiOption,
  ConditionalKeys,
  DevupApi,
  DevupApiMethodKey,
  DevupApiMethodKeys,
  DevupApiMethodScope,
  DevupApiRequestInit,
  DevupApiResponse,
  DevupApiServers,
  DevupPrecomputedScopes,
  ExtractValue,
} from '@devup-api/fetch'
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'

type LowercaseMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

type ResolveScopePrecomputed<
  S extends string,
  M extends string,
  P extends string,
> = S extends keyof DevupPrecomputedScopes
  ? P extends keyof ExtractValue<
      ExtractValue<DevupPrecomputedScopes, S>,
      M & LowercaseMethod
    >
    ? ExtractValue<
        ExtractValue<DevupPrecomputedScopes, S>,
        M & LowercaseMethod
      >[P] &
        object
    : object
  : never

type ResolveScope<
  S extends ConditionalKeys<DevupApiServers>,
  M extends DevupApiMethodKeys,
  P extends string,
> = S extends keyof DevupPrecomputedScopes
  ? ResolveScopePrecomputed<S, Lowercase<M>, P>
  : Additional<P, DevupApiMethodScope<S, M>>

type UseQueryOptions<O> = Omit<
  Parameters<
    typeof useQuery<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  >[0],
  'queryFn' | 'queryKey'
>

type UseQueriesTuple<O, P, M> = [
  method: M,
  path: P,
  options?: ConditionalApiOption<O>,
  queryOptions?: UseQueryOptions<O>,
]

type LowercaseMethodKeys = 'get' | 'post' | 'put' | 'delete' | 'patch'

type UseQueriesEntry<S extends ConditionalKeys<DevupApiServers>> = {
  [M in LowercaseMethodKeys]: {
    [P in DevupApiMethodKey<S, M>]:
      | UseQueriesTuple<ResolveScope<S, M, P>, P, M>
      | UseQueriesTuple<ResolveScope<S, M, P>, P, Uppercase<M>>
  }[DevupApiMethodKey<S, M>]
}[LowercaseMethodKeys]

type InferUseQueryResult<
  S extends ConditionalKeys<DevupApiServers>,
  Q,
> = Q extends [
  infer M extends DevupApiMethodKeys,
  infer P extends string,
  ...unknown[],
]
  ? ReturnType<
      typeof useQuery<
        ExtractValue<ResolveScope<S, M, P>, 'response'>,
        ExtractValue<ResolveScope<S, M, P>, 'error'>
      >
    >
  : ReturnType<typeof useQuery>

type UseQueriesResults<
  S extends ConditionalKeys<DevupApiServers>,
  T extends readonly unknown[],
> = { -readonly [K in keyof T]: InferUseQueryResult<S, T[K]> }

export function getQueryKey<M, P, OP>(
  method: M,
  path: P,
  options: OP,
): [M, P, NonNullable<OP>] | [M, P] {
  return options === undefined
    ? ([method, path] as [M, P])
    : ([method, path, options] as [M, P, NonNullable<OP>])
}

export class DevupQueryClient<S extends ConditionalKeys<DevupApiServers>> {
  private api: DevupApi<S>

  constructor(api: DevupApi<S>) {
    this.api = api
  }

  useQuery<M extends DevupApiMethodKeys, T extends DevupApiMethodKey<S, M>>(
    method: M,
    path: T,
    ...options: ApiOption<
      ResolveScope<S, M, T>,
      [
        queryOptions?: UseQueryOptions<ResolveScope<S, M, T>>,
        queryClient?: Parameters<typeof useQuery>[1],
      ]
    >
  ): ReturnType<
    typeof useQuery<
      ExtractValue<ResolveScope<S, M, T>, 'response'>,
      ExtractValue<ResolveScope<S, M, T>, 'error'>
    >
  > & {
    queryKey: [M, T, ...unknown[]]
  } {
    const queryKey = getQueryKey(method, path, options[0])
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    const result = useQuery<any, any>(
      {
        queryKey,
        queryFn: ({ queryKey: [method, path, ...options], signal }) =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [method as string](path, {
              signal,
              ...(options[0] as DevupApiRequestInit),
            })
            .then(
              ({
                data,
                error,
                isError,
              }: DevupApiResponse<unknown, unknown>) => {
                if (isError) throw error
                return data
              },
            ),
        ...options[1],
      },
      options[2],
    )
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    return Object.assign(result, { queryKey }) as any
  }

  useMutation<M extends DevupApiMethodKeys, T extends DevupApiMethodKey<S, M>>(
    method: M,
    path: T,
    queryOptions?: Omit<
      Parameters<
        typeof useMutation<
          ExtractValue<ResolveScope<S, M, T>, 'response'>,
          ExtractValue<ResolveScope<S, M, T>, 'error'>,
          ApiOption<ResolveScope<S, M, T>>[0]
        >
      >[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation>[1],
  ): ReturnType<
    typeof useMutation<
      ExtractValue<ResolveScope<S, M, T>, 'response'>,
      ExtractValue<ResolveScope<S, M, T>, 'error'>,
      ApiOption<ResolveScope<S, M, T>>[0]
    >
  > {
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    return useMutation<any, any, any>(
      {
        mutationKey: [method, path],
        mutationFn: (variables, { mutationKey }) =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [mutationKey?.[0] as string](mutationKey?.[1] as T, variables)
            .then(
              ({
                data,
                error,
                isError,
              }: DevupApiResponse<unknown, unknown>) => {
                if (isError) throw error
                return data
              },
            ),
        ...queryOptions,
      },
      queryClient,
    )
  }

  useSuspenseQuery<
    M extends DevupApiMethodKeys,
    T extends DevupApiMethodKey<S, M>,
  >(
    method: M,
    path: T,
    ...options: ApiOption<
      ResolveScope<S, M, T>,
      [
        queryOptions?: Omit<
          Parameters<
            typeof useSuspenseQuery<
              ExtractValue<ResolveScope<S, M, T>, 'response'>,
              ExtractValue<ResolveScope<S, M, T>, 'error'>
            >
          >[0],
          'queryFn' | 'queryKey'
        >,
        queryClient?: Parameters<typeof useSuspenseQuery>[1],
      ]
    >
  ): ReturnType<
    typeof useSuspenseQuery<
      ExtractValue<ResolveScope<S, M, T>, 'response'>,
      ExtractValue<ResolveScope<S, M, T>, 'error'>
    >
  > & {
    queryKey: [M, T, ...unknown[]]
  } {
    const queryKey = getQueryKey(method, path, options[0])
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    const result = useSuspenseQuery<any, any, any>(
      {
        queryKey,
        queryFn: ({ queryKey: [method, path, ...options], signal }) =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [method as string](path, {
              signal,
              ...(options[0] as DevupApiRequestInit),
            })
            .then(
              ({
                data,
                error,
                isError,
              }: DevupApiResponse<unknown, unknown>) => {
                if (isError) throw error
                return data
              },
            ),
        ...options[1],
      },
      options[2],
    )
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    return Object.assign(result, { queryKey }) as any
  }

  useInfiniteQuery<
    M extends DevupApiMethodKeys,
    T extends DevupApiMethodKey<S, M>,
  >(
    method: M,
    path: T,
    ...options: [
      options: ConditionalApiOption<ResolveScope<S, M, T>> &
        Pick<
          Parameters<
            typeof useInfiniteQuery<
              ExtractValue<ResolveScope<S, M, T>, 'response'>,
              ExtractValue<ResolveScope<S, M, T>, 'error'>
            >
          >[0],
          'getNextPageParam' | 'initialPageParam'
        >,
      queryOptions?: Omit<
        Parameters<
          typeof useInfiniteQuery<
            ExtractValue<ResolveScope<S, M, T>, 'response'>,
            ExtractValue<ResolveScope<S, M, T>, 'error'>
          >
        >[0],
        'queryFn' | 'queryKey' | 'getNextPageParam' | 'initialPageParam'
      >,
      queryClient?: Parameters<typeof useInfiniteQuery>[1],
    ]
  ): ReturnType<
    typeof useInfiniteQuery<
      ExtractValue<ResolveScope<S, M, T>, 'response'>,
      ExtractValue<ResolveScope<S, M, T>, 'error'>
    >
  > & {
    queryKey: [M, T, ...unknown[]]
  } {
    const { getNextPageParam, initialPageParam, ...apiOptions } = options[0]
    const queryKey = getQueryKey(method, path, apiOptions)
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    const result = useInfiniteQuery<any, any>(
      {
        getNextPageParam,
        initialPageParam,
        queryKey,
        queryFn: ({
          queryKey,
          pageParam,
          signal,
        }: {
          queryKey: unknown[]
          pageParam: unknown
          signal: AbortSignal
        }) => {
          const [methodKey, pathKey, ...restOptions] = queryKey
          const apiOptions = restOptions[0] as DevupApiRequestInit | undefined
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          return (this.api as any)
            [methodKey as string](
              pathKey as T,
              {
                signal,
                ...apiOptions,
                query: {
                  ...(apiOptions as { query?: Record<string, unknown> })?.query,
                  page: pageParam,
                },
              } as DevupApiRequestInit,
            )
            .then(
              ({
                data,
                error,
                isError,
              }: DevupApiResponse<unknown, unknown>) => {
                if (isError) throw error
                return data
              },
            )
        },
        ...options[1],
        // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
      } as any,
      options[2],
    )
    // biome-ignore lint/suspicious/noExplicitAny: internal cast - type safety from signature
    return Object.assign(result, { queryKey }) as any
  }

  useQueries<
    T extends UseQueriesEntry<S>[],
    TCombinedResult = UseQueriesResults<S, T>,
  >(
    queries: [...T],
    options?: {
      combine?: (results: UseQueriesResults<S, T>) => TCombinedResult
      queryClient?: Parameters<typeof useQueries>[1]
    },
  ): TCombinedResult {
    return useQueries(
      {
        queries: queries.map(([method, path, apiOptions, queryOptions]) => ({
          queryKey: getQueryKey(method, path, apiOptions),
          queryFn: ({
            queryKey: [methodKey, pathKey, ...restOptions],
            signal,
          }: {
            queryKey: [string, string, ...unknown[]]
            signal: AbortSignal
          }): Promise<unknown> =>
            // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
            (this.api as any)
              [methodKey as string](pathKey, {
                signal,
                ...(restOptions[0] as DevupApiRequestInit),
              })
              .then(
                ({
                  data,
                  error,
                  isError,
                }: DevupApiResponse<unknown, unknown>) => {
                  if (isError) throw error
                  return data
                },
              ),
          ...queryOptions,
        })) as Parameters<typeof useQueries>[0]['queries'],
        combine: options?.combine as Parameters<
          typeof useQueries
        >[0]['combine'],
      },
      options?.queryClient,
    ) as TCombinedResult
  }
}
