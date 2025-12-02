import type {
  Additional,
  ConditionalKeys,
  ConditionalScope,
  DevupApi,
  DevupApiRequestInit,
  DevupApiResponse,
  DevupApiServers,
  DevupApiStruct,
  DevupApiStructKey,
  DevupDeleteApiStruct,
  DevupDeleteApiStructKey,
  DevupGetApiStruct,
  DevupGetApiStructKey,
  DevupPatchApiStruct,
  DevupPatchApiStructKey,
  DevupPostApiStruct,
  DevupPostApiStructKey,
  DevupPutApiStruct,
  DevupPutApiStructKey,
  ExtractValue,
  RequiredOptions,
} from '@devup-api/fetch'
import {
  useInfiniteQuery,
  useMutation,
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
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupGetApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'get' | 'GET',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useQuery<D, E>>

  useQuery<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPostApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'post' | 'POST',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useQuery<D, E>>

  useQuery<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPutApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'put' | 'PUT',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useQuery<D, E>>

  useQuery<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPatchApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'patch' | 'PATCH',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useQuery<D, E>>

  useQuery<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupDeleteApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'delete' | 'DELETE',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useQuery<D, E>>

  useQuery<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method:
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
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useQuery<D, E>>[1],
        ]
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
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupGetApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method: 'get' | 'GET',
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>>

  useMutation<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPostApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method: 'post' | 'POST',
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>>

  useMutation<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPutApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method: 'put' | 'PUT',
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>>

  useMutation<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPatchApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method: 'patch' | 'PATCH',
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>>

  useMutation<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupDeleteApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method: 'delete' | 'DELETE',
    path: T,
    queryOptions?: Omit<
      Parameters<typeof useMutation<D, E, V>>[0],
      'mutationFn' | 'mutationKey'
    >,
    queryClient?: Parameters<typeof useMutation<D, E, V>>[1],
  ): ReturnType<typeof useMutation<D, E, V>>

  useMutation<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    V extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method:
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
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupGetApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'get' | 'GET',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useSuspenseQuery<D, E>>

  useSuspenseQuery<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPostApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'post' | 'POST',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useSuspenseQuery<D, E>>

  useSuspenseQuery<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPutApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'put' | 'PUT',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useSuspenseQuery<D, E>>

  useSuspenseQuery<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPatchApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'patch' | 'PATCH',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useSuspenseQuery<D, E>>

  useSuspenseQuery<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupDeleteApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'delete' | 'DELETE',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useSuspenseQuery<D, E>>

  useSuspenseQuery<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
    OP extends [RequiredOptions<O>] extends [never]
      ? DevupApiRequestInit | undefined
      : DevupApiRequestInit & Omit<O, 'response' | 'error'>,
  >(
    method:
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
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: OP,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
      : [
          options: OP,
          queryOptions?: Omit<
            Parameters<typeof useSuspenseQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useSuspenseQuery<D, E>>[1],
        ]
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
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupGetApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'get' | 'GET',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>>

  useInfiniteQuery<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPostApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'post' | 'POST',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>>

  useInfiniteQuery<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPutApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'put' | 'PUT',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>>

  useInfiniteQuery<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupPatchApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'patch' | 'PATCH',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>>

  useInfiniteQuery<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupDeleteApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method: 'delete' | 'DELETE',
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>>

  useInfiniteQuery<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, ConditionalScope<DevupApiStruct, S>>,
    D extends ExtractValue<O, 'response'>,
    E extends ExtractValue<O, 'error'>,
  >(
    method:
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
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [
          options?: DevupApiRequestInit,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
      : [
          options: DevupApiRequestInit & Omit<O, 'response' | 'error'>,
          queryOptions?: Omit<
            Parameters<typeof useInfiniteQuery<D, E>>[0],
            'queryFn' | 'queryKey'
          >,
          queryClient?: Parameters<typeof useInfiniteQuery<D, E>>[1],
        ]
  ): ReturnType<typeof useInfiniteQuery<D, E>> {
    return useInfiniteQuery<D, E>(
      {
        queryKey: getQueryKey(method, path, options[0]),
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
}
