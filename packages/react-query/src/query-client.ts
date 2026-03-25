import type {
  Additional,
  ApiOption,
  ConditionalApiOption,
  ConditionalKeys,
  DevupApi,
  DevupApiMethodKeys,
  DevupApiMethodScope,
  DevupApiRequestInit,
  DevupApiResponse,
  DevupApiServers,
  ExtractValue,
} from '@devup-api/fetch'
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'

type ResolveScope<
  S extends ConditionalKeys<DevupApiServers>,
  M extends DevupApiMethodKeys,
  P extends string,
> = Additional<P, DevupApiMethodScope<S, M>>

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

type UseQueriesEntry<S extends ConditionalKeys<DevupApiServers>> = {
  [M in DevupApiMethodKeys]: {
    [P in ConditionalKeys<DevupApiMethodScope<S, M>>]: UseQueriesTuple<
      ResolveScope<S, M, P>,
      P,
      M
    >
  }[ConditionalKeys<DevupApiMethodScope<S, M>>]
}[DevupApiMethodKeys]

type InferUseQueryResult<
  S extends ConditionalKeys<DevupApiServers>,
  Q,
> = Q extends [infer M extends DevupApiMethodKeys, infer P, ...unknown[]]
  ? P extends ConditionalKeys<DevupApiMethodScope<S, M>>
    ? ReturnType<
        typeof useQuery<
          ExtractValue<ResolveScope<S, M, P>, 'response'>,
          ExtractValue<ResolveScope<S, M, P>, 'error'>
        >
      >
    : ReturnType<typeof useQuery>
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

  useQuery<
    M extends DevupApiMethodKeys,
    ST extends DevupApiMethodScope<S, M>,
    T extends ConditionalKeys<ST>,
    O extends Additional<T, ST>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: M,
    path: T,
    ...options: ApiOption<
      O,
      [
        queryOptions?: Omit<
          Parameters<typeof useQuery<D, E>>[0],
          'queryFn' | 'queryKey'
        >,
        queryClient?: Parameters<typeof useQuery<D, E>>[1],
      ]
    >
  ): ReturnType<typeof useQuery<D, E>> & {
    queryKey: [M, T, ...unknown[]]
  } {
    const queryKey = getQueryKey(method, path, options[0])
    const result = useQuery<D, E>(
      {
        queryKey,
        queryFn: ({
          queryKey: [method, path, ...options],
          signal,
        }): Promise<D> =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [method as string](path, {
              signal,
              ...(options[0] as DevupApiRequestInit),
            })
            .then(({ data, error, isError }: DevupApiResponse<D, E>) => {
              if (isError) throw error
              return data
            }),
        ...options[1],
      },
      options[2],
    )
    return Object.assign(result, { queryKey })
  }

  useMutation<
    M extends DevupApiMethodKeys,
    ST extends DevupApiMethodScope<S, M>,
    T extends ConditionalKeys<ST>,
    O extends Additional<T, ST>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends ApiOption<O>[0],
  >(
    method: M,
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>> {
    return useMutation<D, E, V>(
      {
        mutationKey: [method, path],
        mutationFn: (variables: V, { mutationKey }): Promise<D> =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [mutationKey?.[0] as string](mutationKey?.[1] as T, variables)
            .then(({ data, error, isError }: DevupApiResponse<D, E>) => {
              if (isError) throw error
              return data
            }),
        ...queryOptions,
      },
      queryClient,
    )
  }

  useSuspenseQuery<
    M extends DevupApiMethodKeys,
    ST extends DevupApiMethodScope<S, M>,
    T extends ConditionalKeys<ST>,
    O extends Additional<T, ST>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: M,
    path: T,
    ...options: ApiOption<
      O,
      [
        queryOptions?: Omit<
          Parameters<typeof useSuspenseQuery<D, E>>[0],
          'queryFn' | 'queryKey'
        >,
        queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
      ]
    >
  ): ReturnType<typeof useSuspenseQuery<D, E>> & {
    queryKey: [M, T, ...unknown[]]
  } {
    const queryKey = getQueryKey(method, path, options[0])
    const result = useSuspenseQuery<D, E, D>(
      {
        queryKey,
        queryFn: ({
          queryKey: [method, path, ...options],
          signal,
        }): Promise<D> =>
          // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
          (this.api as any)
            [method as string](path, {
              signal,
              ...(options[0] as DevupApiRequestInit),
            })
            .then(({ data, error, isError }: DevupApiResponse<D, E>) => {
              if (isError) throw error
              return data
            }),
        ...options[1],
      },
      options[2],
    )
    return Object.assign(result, { queryKey })
  }

  useInfiniteQuery<
    M extends DevupApiMethodKeys,
    ST extends DevupApiMethodScope<S, M>,
    T extends ConditionalKeys<ST>,
    O extends Additional<T, ST>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: M,
    path: T,
    ...options: [
      options: ConditionalApiOption<O> &
        Pick<
          Parameters<typeof useInfiniteQuery<D, E>>[0],
          'getNextPageParam' | 'initialPageParam'
        >,
      queryOptions?: Omit<
        Parameters<typeof useInfiniteQuery<D, E>>[0],
        'queryFn' | 'queryKey' | 'getNextPageParam' | 'initialPageParam'
      >,
      queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
    ]
  ): ReturnType<typeof useInfiniteQuery<D, E>> & {
    queryKey: [M, T, ...unknown[]]
  } {
    const { getNextPageParam, initialPageParam, ...apiOptions } = options[0]
    const queryKey = getQueryKey(method, path, apiOptions)
    const result = useInfiniteQuery<D, E>(
      {
        getNextPageParam,
        initialPageParam,
        queryKey,
        queryFn: ({ queryKey, pageParam, signal }): Promise<D> => {
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
            .then(({ data, error, isError }: DevupApiResponse<D, E>) => {
              if (isError) throw error
              return data as D
            })
        },
        ...options[1],
      } as Parameters<typeof useInfiniteQuery<D, E>>[0],
      options[2],
    )
    return Object.assign(result, { queryKey })
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
