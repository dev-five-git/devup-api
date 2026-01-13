import type {
  Additional,
  ApiOption,
  ConditionalApiOption,
  ConditionalKeys,
  DevupApi,
  DevupApiRequestInit,
  DevupApiResponse,
  DevupApiServers,
  DevupDeleteApiStructScope,
  DevupGetApiStructScope,
  DevupPatchApiStructScope,
  DevupPostApiStructScope,
  DevupPutApiStructScope,
  ExtractValue,
} from '@devup-api/fetch'
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'

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
    M extends
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'patch'
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'PATCH',
    ST extends {
      get: DevupGetApiStructScope<S>
      post: DevupPostApiStructScope<S>
      put: DevupPutApiStructScope<S>
      delete: DevupDeleteApiStructScope<S>
      patch: DevupPatchApiStructScope<S>
      GET: DevupGetApiStructScope<S>
      POST: DevupPostApiStructScope<S>
      PUT: DevupPutApiStructScope<S>
      DELETE: DevupDeleteApiStructScope<S>
      PATCH: DevupPatchApiStructScope<S>
    }[M],
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
  ): ReturnType<typeof useQuery<D, E>> {
    return useQuery<D, E>(
      {
        queryKey: getQueryKey(method, path, options[0]),
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
            .then(({ data, error }: DevupApiResponse<D, E>) => {
              if (error) throw error
              return data
            }),
        ...options[1],
      },
      options[2],
    )
  }

  useMutation<
    M extends
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'patch'
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'PATCH',
    ST extends {
      get: DevupGetApiStructScope<S>
      post: DevupPostApiStructScope<S>
      put: DevupPutApiStructScope<S>
      delete: DevupDeleteApiStructScope<S>
      patch: DevupPatchApiStructScope<S>
      GET: DevupGetApiStructScope<S>
      POST: DevupPostApiStructScope<S>
      PUT: DevupPutApiStructScope<S>
      DELETE: DevupDeleteApiStructScope<S>
      PATCH: DevupPatchApiStructScope<S>
    }[M],
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
            .then(({ data, error }: DevupApiResponse<D, E>) => {
              if (error) throw error
              return data
            }),
        ...queryOptions,
      },
      queryClient,
    )
  }

  useSuspenseQuery<
    M extends
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'patch'
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'PATCH',
    ST extends {
      get: DevupGetApiStructScope<S>
      post: DevupPostApiStructScope<S>
      put: DevupPutApiStructScope<S>
      delete: DevupDeleteApiStructScope<S>
      patch: DevupPatchApiStructScope<S>
      GET: DevupGetApiStructScope<S>
      POST: DevupPostApiStructScope<S>
      PUT: DevupPutApiStructScope<S>
      DELETE: DevupDeleteApiStructScope<S>
      PATCH: DevupPatchApiStructScope<S>
    }[M],
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
  ): ReturnType<typeof useSuspenseQuery<D, E>> {
    return useSuspenseQuery<D, E, D>(
      {
        queryKey: getQueryKey(method, path, options[0]),
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
            .then(({ data, error }: DevupApiResponse<D, E>) => {
              if (error) throw error
              return data
            }),
        ...options[1],
      },
      options[2],
    )
  }

  useInfiniteQuery<
    M extends
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'patch'
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'PATCH',
    ST extends {
      get: DevupGetApiStructScope<S>
      post: DevupPostApiStructScope<S>
      put: DevupPutApiStructScope<S>
      delete: DevupDeleteApiStructScope<S>
      patch: DevupPatchApiStructScope<S>
      GET: DevupGetApiStructScope<S>
      POST: DevupPostApiStructScope<S>
      PUT: DevupPutApiStructScope<S>
      DELETE: DevupDeleteApiStructScope<S>
      PATCH: DevupPatchApiStructScope<S>
    }[M],
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
  ): ReturnType<typeof useInfiniteQuery<D, E>> {
    const { getNextPageParam, initialPageParam, ...apiOptions } = options[0]
    return useInfiniteQuery<D, E>(
      {
        getNextPageParam,
        initialPageParam,
        queryKey: getQueryKey(method, path, apiOptions),
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
            .then(({ data, error }: DevupApiResponse<D, E>) => {
              if (error) throw error
              return data as D
            })
        },
        ...options[1],
      } as Parameters<typeof useInfiniteQuery<D, E>>[0],
      options[2],
    )
  }

  useQueries<
    M extends
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'patch'
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'PATCH',
    ST extends {
      get: DevupGetApiStructScope<S>
      post: DevupPostApiStructScope<S>
      put: DevupPutApiStructScope<S>
      delete: DevupDeleteApiStructScope<S>
      patch: DevupPatchApiStructScope<S>
      GET: DevupGetApiStructScope<S>
      POST: DevupPostApiStructScope<S>
      PUT: DevupPutApiStructScope<S>
      DELETE: DevupDeleteApiStructScope<S>
      PATCH: DevupPatchApiStructScope<S>
    }[M],
    T extends ConditionalKeys<ST>,
    O extends Additional<T, ST>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    TCombinedResult = Array<ReturnType<typeof useQuery<D, E>>>,
  >(
    queries: Array<
      [
        method: M,
        path: T,
        options?: ConditionalApiOption<O>,
        queryOptions?: Omit<
          Parameters<typeof useQuery<D, E>>[0],
          'queryFn' | 'queryKey'
        >,
      ]
    >,
    options?: {
      combine?: (
        results: Array<ReturnType<typeof useQuery<D, E>>>,
      ) => TCombinedResult
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
            queryKey: [M, T, ...unknown[]]
            signal: AbortSignal
          }): Promise<D> =>
            // biome-ignore lint/suspicious/noExplicitAny: can't use method as a function
            (this.api as any)
              [methodKey as string](pathKey, {
                signal,
                ...(restOptions[0] as DevupApiRequestInit),
              })
              .then(({ data, error }: DevupApiResponse<D, E>) => {
                if (error) throw error
                return data
              }),
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
