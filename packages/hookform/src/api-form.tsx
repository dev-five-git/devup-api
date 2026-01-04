'use client'
import type {
  Additional,
  ConditionalKeys,
  DevupApiResponse,
  DevupApiServers,
  ExtractValue,
} from '@devup-api/fetch'
import { pathSchemas } from '@devup-api/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'
import type {
  ApiFormContextValue,
  ApiFormProps,
  ApiFormState,
  ApiFormStore,
  HttpMethod,
  MethodApiStructKey,
  MethodApiStructScope,
} from './types'

// Context stores the store object (stable reference)
const ApiFormContext = createContext<ApiFormStore | null>(null)

/**
 * Deep comparison for specific paths that were accessed
 */
function hasChangedForPaths(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
  paths: Set<string>,
): boolean {
  for (const path of paths) {
    const keys = path.split('.')
    let prevVal: unknown = prev
    let nextVal: unknown = next

    for (const key of keys) {
      prevVal = (prevVal as Record<string, unknown>)?.[key]
      nextVal = (nextVal as Record<string, unknown>)?.[key]
    }

    if (!Object.is(prevVal, nextVal)) {
      return true
    }
  }
  return false
}

/**
 * Creates a Proxy that tracks accessed property paths
 */
function createTrackedProxy<T extends object>(
  target: T,
  accessed: Set<string>,
  parentPath = '',
): T {
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === 'symbol') {
        return Reflect.get(obj, prop)
      }

      const path = parentPath ? `${parentPath}.${prop}` : prop
      const value = Reflect.get(obj, prop)

      // Track primitive values and functions
      if (
        value === null ||
        typeof value !== 'object' ||
        typeof value === 'function'
      ) {
        accessed.add(path)
        return value
      }

      // For objects, return a nested proxy
      return createTrackedProxy(value as object, accessed, path)
    },
  })
}

/**
 * Hook to access ApiForm context with optimized re-renders
 *
 * Only re-renders when accessed properties change (like react-hook-form's formState)
 *
 * @example
 * ```tsx
 * function FormFields() {
 *   const { form, mutation } = useApiFormContext()
 *   const { register } = form
 *   const { isPending } = mutation  // Only re-renders when isPending changes
 *
 *   return (
 *     <>
 *       <input {...register('name')} disabled={isPending} />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save'}
 *       </button>
 *     </>
 *   )
 * }
 * ```
 */
export function useApiFormContext<
  TFieldValues extends FieldValues = FieldValues,
  TData = unknown,
  TError = unknown,
>(): ApiFormContextValue<TFieldValues, TData, TError> {
  const store = useContext(ApiFormContext) as ApiFormStore<
    TFieldValues,
    TData,
    TError
  > | null

  if (!store) {
    throw new Error('useApiFormContext must be used within an ApiForm')
  }

  // Track which properties are accessed
  const accessedRef = useRef<Set<string>>(new Set())
  // Cache previous state for comparison
  const prevStateRef = useRef<ApiFormState<TFieldValues, TData, TError> | null>(
    null,
  )
  // Cache snapshot to return stable reference when unchanged
  const snapshotRef = useRef<ApiFormState<TFieldValues, TData, TError> | null>(
    null,
  )

  const getSnapshot = useCallback(() => {
    const currentState = store.getState()

    // First render - return current state
    if (!prevStateRef.current || !snapshotRef.current) {
      prevStateRef.current = currentState
      snapshotRef.current = currentState
      return currentState
    }

    // Check if any accessed property has changed
    if (
      accessedRef.current.size > 0 &&
      hasChangedForPaths(
        prevStateRef.current as unknown as Record<string, unknown>,
        currentState as unknown as Record<string, unknown>,
        accessedRef.current,
      )
    ) {
      prevStateRef.current = currentState
      snapshotRef.current = currentState
      return currentState
    }

    // No changes to accessed properties - return cached snapshot
    return snapshotRef.current
  }, [store])

  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)

  // Return a proxy that tracks property access
  return useMemo(
    () =>
      createTrackedProxy(state, accessedRef.current) as ApiFormContextValue<
        TFieldValues,
        TData,
        TError
      >,
    [state],
  )
}

/**
 * ApiForm - A form component that integrates with @devup-api/fetch and @devup-api/zod
 *
 * Features:
 * - Form validation using Zod schemas from OpenAPI spec
 * - Form submission via react-query mutation
 * - Auto-fetching default values
 * - Optimized re-renders (only re-renders when accessed properties change)
 *
 * @example
 * ```tsx
 * import { createApi } from '@devup-api/fetch'
 * import { ApiForm, useApiFormContext } from '@devup-api/hookform'
 *
 * const api = createApi('https://api.example.com')
 *
 * function FormFields() {
 *   const { form, mutation } = useApiFormContext()
 *   const { register } = form
 *   const { isPending } = mutation
 *
 *   return (
 *     <>
 *       <input {...register('name')} disabled={isPending} />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save'}
 *       </button>
 *     </>
 *   )
 * }
 *
 * function CreateUserForm() {
 *   return (
 *     <ApiForm
 *       api={api}
 *       method="post"
 *       path="createUser"
 *       onSuccess={(data) => console.log('Created:', data)}
 *     >
 *       <FormFields />
 *     </ApiForm>
 *   )
 * }
 * ```
 */
export function ApiForm<
  S extends ConditionalKeys<DevupApiServers>,
  M extends HttpMethod,
  P extends MethodApiStructKey<S, M>,
  O extends Additional<P, MethodApiStructScope<S, M>>,
  TFieldValues extends FieldValues = ExtractValue<O, 'body'> extends FieldValues
    ? ExtractValue<O, 'body'>
    : FieldValues,
>({
  api,
  method,
  path,
  openapi: _openapi,
  requestOptions,
  onSuccess,
  onError,
  onValidationError,
  children,
  defaultValues,
  mode = 'onSubmit',
  formOptions,
  formProps,
  resetOnSuccess = false,
  queryClient,
  fetchDefaultValues,
}: ApiFormProps<S, M, P, O, TFieldValues>) {
  type TData = ExtractValue<O, 'response'>
  type TError = ExtractValue<O, 'error'>

  // Store listeners for subscription
  const listenersRef = useRef<Set<() => void>>(new Set())

  // Refs to hold current state (for stable store.getState)
  const formRef = useRef<ReturnType<typeof useForm<TFieldValues>> | null>(null)
  const mutationRef = useRef<ReturnType<
    typeof useMutation<TData, TError, TFieldValues>
  > | null>(null)
  const isLoadingDefaultValuesRef = useRef(false)

  // Notify all listeners
  const notify = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener()
    }
  }, [])

  // Fetch default values if configured
  const defaultValuesQuery = useQuery<TFieldValues>({
    queryKey: fetchDefaultValues
      ? [
          'apiFormDefaultValues',
          fetchDefaultValues.method ?? 'get',
          fetchDefaultValues.path,
          fetchDefaultValues.options,
        ]
      : ['apiFormDefaultValues', 'disabled'],
    queryFn: fetchDefaultValues
      ? async () => {
          const fetchMethod = fetchDefaultValues.method ?? 'get'
          // biome-ignore lint/suspicious/noExplicitAny: Dynamic method call
          const result = await (api as any)[fetchMethod](
            fetchDefaultValues.path,
            fetchDefaultValues.options,
          )
          if (result.error) {
            throw result.error
          }
          const data = fetchDefaultValues.transform
            ? fetchDefaultValues.transform(result.data)
            : result.data
          return data as TFieldValues
        }
      : skipToken,
    enabled: !!fetchDefaultValues,
    ...(queryClient && { queryClient }),
  })

  // Determine actual default values
  const resolvedDefaultValues = useMemo(() => {
    if (fetchDefaultValues && defaultValuesQuery.data) {
      return defaultValuesQuery.data
    }
    return defaultValues
  }, [fetchDefaultValues, defaultValuesQuery.data, defaultValues])

  // Get the Zod schema for this path/method combination
  const schema = (
    pathSchemas as unknown as Record<string, Record<string, z.ZodType>>
  )?.[method]?.[path as string] as z.ZodType<TFieldValues> | undefined

  // Create form with optional Zod resolver
  const methods = useForm<TFieldValues>({
    // biome-ignore lint/suspicious/noExplicitAny: Complex generic type inference
    defaultValues: resolvedDefaultValues as any,
    mode,
    // biome-ignore lint/suspicious/noExplicitAny: Zod v3/v4 compatibility
    resolver: schema ? zodResolver(schema as any) : undefined,
    ...formOptions,
  })

  // Mutation for form submission
  const mutation = useMutation<TData, TError, TFieldValues>({
    mutationKey: [method, path, requestOptions],
    mutationFn: async (data: TFieldValues) => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic method call
      const result: DevupApiResponse<TData, TError> = await (api as any)[
        method
      ](path, {
        ...requestOptions,
        body: data,
      })
      if (result.error) {
        throw result.error
      }
      return result.data as TData
    },
    onSuccess: (data) => {
      onSuccess?.(data)
      if (resetOnSuccess) {
        methods.reset()
      }
    },
    onError: (error) => {
      onError?.(error)
    },
    ...(queryClient && { queryClient }),
  })

  // Update refs with current values
  formRef.current = methods
  mutationRef.current = mutation
  isLoadingDefaultValuesRef.current = defaultValuesQuery.isLoading

  // Reset form when fetchDefaultValues completes
  useEffect(() => {
    if (fetchDefaultValues && defaultValuesQuery.data) {
      methods.reset(defaultValuesQuery.data)
    }
  }, [fetchDefaultValues, defaultValuesQuery.data, methods])

  // Notify listeners when state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally trigger on state changes
  useEffect(() => {
    notify()
  }, [
    mutation.isPending,
    mutation.isSuccess,
    mutation.isError,
    mutation.error,
    mutation.data,
    defaultValuesQuery.isLoading,
    notify,
  ])

  const handleSubmit = methods.handleSubmit(
    (data) => {
      // biome-ignore lint/suspicious/noExplicitAny: Complex generic type inference
      mutation.mutate(data as any)
    },
    (errors) => {
      onValidationError?.(errors)
    },
  )

  // Create store object (stable reference - no dependencies)
  // Note: getState is only called after component renders, so refs are always set
  const store = useMemo<ApiFormStore<TFieldValues, TData, TError>>(() => {
    return {
      getState: () => {
        // biome-ignore lint/style/noNonNullAssertion: Refs are guaranteed to be set before useSyncExternalStore calls getState
        const form = formRef.current!
        // biome-ignore lint/style/noNonNullAssertion: Refs are guaranteed to be set before useSyncExternalStore calls getState
        const mut = mutationRef.current!
        return {
          form,
          mutation: {
            isPending: mut.isPending,
            isSuccess: mut.isSuccess,
            isError: mut.isError,
            error: mut.error,
            data: mut.data,
            mutate: mut.mutate,
            mutateAsync: mut.mutateAsync,
            reset: mut.reset,
          },
          isLoadingDefaultValues: isLoadingDefaultValuesRef.current,
        }
      },
      subscribe: (listener: () => void) => {
        listenersRef.current.add(listener)
        return () => {
          listenersRef.current.delete(listener)
        }
      },
    }
  }, [])

  return (
    <ApiFormContext.Provider value={store as unknown as ApiFormStore}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} {...formProps}>
          {children}
        </form>
      </FormProvider>
    </ApiFormContext.Provider>
  )
}
