import type {
  Additional,
  ConditionalKeys,
  DevupApi,
  DevupApiServers,
  DevupDeleteApiStructKey,
  DevupDeleteApiStructScope,
  DevupGetApiStructKey,
  DevupGetApiStructScope,
  DevupPatchApiStructKey,
  DevupPatchApiStructScope,
  DevupPostApiStructKey,
  DevupPostApiStructScope,
  DevupPutApiStructKey,
  DevupPutApiStructScope,
  ExtractValue,
} from '@devup-api/fetch'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type {
  DefaultValues,
  FieldValues,
  Mode,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form'

export type HttpMethod = 'post' | 'put' | 'patch' | 'delete'
export type FetchMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type MethodApiStructScope<
  S extends string,
  M extends HttpMethod,
> = M extends 'post'
  ? DevupPostApiStructScope<S>
  : M extends 'put'
    ? DevupPutApiStructScope<S>
    : M extends 'patch'
      ? DevupPatchApiStructScope<S>
      : M extends 'delete'
        ? DevupDeleteApiStructScope<S>
        : never

export type MethodApiStructKey<
  S extends string,
  M extends HttpMethod,
> = M extends 'post'
  ? DevupPostApiStructKey<S>
  : M extends 'put'
    ? DevupPutApiStructKey<S>
    : M extends 'patch'
      ? DevupPatchApiStructKey<S>
      : M extends 'delete'
        ? DevupDeleteApiStructKey<S>
        : never

export type FetchMethodApiStructScope<
  S extends string,
  M extends FetchMethod,
> = M extends 'get'
  ? DevupGetApiStructScope<S>
  : M extends 'post'
    ? DevupPostApiStructScope<S>
    : M extends 'put'
      ? DevupPutApiStructScope<S>
      : M extends 'patch'
        ? DevupPatchApiStructScope<S>
        : M extends 'delete'
          ? DevupDeleteApiStructScope<S>
          : never

export type FetchMethodApiStructKey<
  S extends string,
  M extends FetchMethod,
> = M extends 'get'
  ? DevupGetApiStructKey<S>
  : M extends 'post'
    ? DevupPostApiStructKey<S>
    : M extends 'put'
      ? DevupPutApiStructKey<S>
      : M extends 'patch'
        ? DevupPatchApiStructKey<S>
        : M extends 'delete'
          ? DevupDeleteApiStructKey<S>
          : never

/**
 * Configuration for auto-fetching default values
 */
export interface FetchDefaultValuesConfig<
  S extends ConditionalKeys<DevupApiServers>,
  FM extends FetchMethod = 'get',
  FP extends FetchMethodApiStructKey<S, FM> = FetchMethodApiStructKey<S, FM>,
  FO extends Additional<FP, FetchMethodApiStructScope<S, FM>> = Additional<
    FP,
    FetchMethodApiStructScope<S, FM>
  >,
> {
  /**
   * HTTP method for fetching default values
   * @default 'get'
   */
  method?: FM
  /**
   * API path or operationId for fetching default values
   */
  path: FP
  /**
   * Request options for fetching (params, query, headers)
   */
  options?: Omit<FO, 'body'>
  /**
   * Transform the fetched response to form default values
   */
  transform?: (response: ExtractValue<FO, 'response'>) => unknown
}

/**
 * Mutation state and methods
 */
export interface ApiFormMutation<
  TFieldValues extends FieldValues = FieldValues,
  TData = unknown,
  TError = unknown,
> {
  /**
   * Whether the mutation is pending
   */
  isPending: boolean
  /**
   * Whether the mutation succeeded
   */
  isSuccess: boolean
  /**
   * Whether the mutation failed
   */
  isError: boolean
  /**
   * The error from the mutation
   */
  error: TError | null
  /**
   * The data returned from the mutation
   */
  data: TData | undefined
  /**
   * Execute the mutation with form data
   */
  mutateAsync: UseMutationResult<TData, TError, TFieldValues>['mutateAsync']
  /**
   * Execute the mutation with form data (non-throwing)
   */
  mutate: UseMutationResult<TData, TError, TFieldValues>['mutate']
  /**
   * Reset the mutation state
   */
  reset: UseMutationResult<TData, TError, TFieldValues>['reset']
}

/**
 * State snapshot for ApiForm
 */
export interface ApiFormState<
  TFieldValues extends FieldValues = FieldValues,
  TData = unknown,
  TError = unknown,
> {
  /**
   * Form methods from react-hook-form
   */
  form: UseFormReturn<TFieldValues>
  /**
   * Mutation state and methods
   */
  mutation: ApiFormMutation<TFieldValues, TData, TError>
  /**
   * Whether default values are being fetched
   */
  isLoadingDefaultValues: boolean
}

/**
 * Store interface for ApiForm (internal use)
 */
export interface ApiFormStore<
  TFieldValues extends FieldValues = FieldValues,
  TData = unknown,
  TError = unknown,
> {
  /**
   * Get current state snapshot
   */
  getState: () => ApiFormState<TFieldValues, TData, TError>
  /**
   * Subscribe to state changes
   */
  subscribe: (listener: () => void) => () => void
}

/**
 * Context value provided by useApiFormContext
 * Uses Proxy to track accessed properties for optimized re-renders
 */
export type ApiFormContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TData = unknown,
  TError = unknown,
> = ApiFormState<TFieldValues, TData, TError>

export interface ApiFormProps<
  S extends ConditionalKeys<DevupApiServers>,
  M extends HttpMethod,
  P extends MethodApiStructKey<S, M>,
  O extends Additional<P, MethodApiStructScope<S, M>>,
  TFieldValues extends FieldValues = ExtractValue<O, 'body'> extends FieldValues
    ? ExtractValue<O, 'body'>
    : FieldValues,
> {
  /**
   * The API client instance from @devup-api/fetch
   */
  api: DevupApi<S>

  /**
   * HTTP method for the form submission
   */
  method: M

  /**
   * API path or operationId for the endpoint
   */
  path: P

  /**
   * Optional server name for multi-server setups
   * @default 'openapi.json'
   */
  openapi?: S

  /**
   * Additional request options (params, query, headers)
   */
  requestOptions?: Omit<O, 'body'>

  /**
   * Called when the API request succeeds
   */
  onSuccess?: (data: ExtractValue<O, 'response'>) => void

  /**
   * Called when the API request fails
   */
  onError?: (error: ExtractValue<O, 'error'>) => void

  /**
   * Called when form validation fails (before API request)
   */
  onValidationError?: (errors: Record<string, unknown>) => void

  /**
   * Form children - can access form context via useFormContext
   */
  children: ReactNode

  /**
   * Default values for form fields
   */
  defaultValues?: DefaultValues<TFieldValues>

  /**
   * Validation mode
   * @default 'onSubmit'
   */
  mode?: Mode

  /**
   * Additional react-hook-form options
   */
  formOptions?: Omit<
    UseFormProps<TFieldValues>,
    'defaultValues' | 'mode' | 'resolver'
  >

  /**
   * HTML form element props
   */
  formProps?: Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    'onSubmit' | 'children'
  >

  /**
   * Whether to reset form after successful submission
   * @default false
   */
  resetOnSuccess?: boolean

  /**
   * Optional TanStack Query client for mutation management
   * If not provided, will try to use QueryClientProvider context
   * Falls back to basic state management if react-query is not available
   */
  queryClient?: QueryClient

  /**
   * Configuration for auto-fetching default values
   * Uses the api client to fetch initial form values
   */
  fetchDefaultValues?: FetchDefaultValuesConfig<S>
}
