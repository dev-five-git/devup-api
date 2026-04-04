import type {
  Additional,
  ApiOption,
  BoildApiOption,
  ConditionalKeys,
  DevupApiMethodKey,
  DevupApiMethodKeys,
  DevupApiRequestInit,
  DevupApiServers,
  DevupApiStructKey,
  DevupApiStructScope,
  DevupDeleteApiStructScope,
  DevupGetApiStructScope,
  DevupPatchApiStructScope,
  DevupPostApiStructScope,
  DevupPutApiStructScope,
  ExtractValue,
  HttpMethod,
  Middleware,
} from '@devup-api/core'
import { convertResponse } from './response-converter'
import { getApiEndpointInfo } from './url-map'
import {
  getApiEndpoint,
  getQueryString,
  isPlainObject,
  objectToFormData,
  objectToURLSearchParams,
} from './utils'

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type
export type DevupApiResponse<T, E = any> =
  | {
      data: T
      error?: undefined
      isOk: true
      isError: false
      response: Response
    }
  | {
      data?: undefined
      error: E
      isOk: false
      isError: true
      response: Response
    }

export class DevupApi<S extends ConditionalKeys<DevupApiServers>> {
  private baseUrl: string
  private defaultOptions: DevupApiRequestInit
  private serverName: S
  private middleware: Middleware[]

  constructor(
    baseUrl: string,
    defaultOptions: DevupApiRequestInit = {},
    serverName: S,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.defaultOptions = defaultOptions
    this.serverName = serverName as S
    this.middleware = []
  }

  get<
    T extends DevupApiMethodKey<S, 'get'>,
    O extends Additional<T, DevupGetApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as BoildApiOption<O>)
  }

  GET<
    T extends DevupApiMethodKey<S, 'get'>,
    O extends Additional<T, DevupGetApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as BoildApiOption<O>)
  }

  post<
    T extends DevupApiMethodKey<S, 'post'>,
    O extends Additional<T, DevupPostApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as BoildApiOption<O>)
  }

  POST<
    T extends DevupApiMethodKey<S, 'post'>,
    O extends Additional<T, DevupPostApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as BoildApiOption<O>)
  }

  put<
    T extends DevupApiMethodKey<S, 'put'>,
    O extends Additional<T, DevupPutApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as BoildApiOption<O>)
  }

  PUT<
    T extends DevupApiMethodKey<S, 'put'>,
    O extends Additional<T, DevupPutApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as BoildApiOption<O>)
  }

  delete<
    T extends DevupApiMethodKey<S, 'delete'>,
    O extends Additional<T, DevupDeleteApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as BoildApiOption<O>)
  }

  DELETE<
    T extends DevupApiMethodKey<S, 'delete'>,
    O extends Additional<T, DevupDeleteApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as BoildApiOption<O>)
  }

  patch<
    T extends DevupApiMethodKey<S, 'patch'>,
    O extends Additional<T, DevupPatchApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as BoildApiOption<O>)
  }

  PATCH<
    T extends DevupApiMethodKey<S, 'patch'>,
    O extends Additional<T, DevupPatchApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as BoildApiOption<O>)
  }

  async request<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, DevupApiStructScope<S>>,
  >(
    path: T,
    ...options: ApiOption<O>
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    const { method, url, bodyType } = getApiEndpointInfo(
      path,
      this.serverName,
      (options[0]?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') ||
        'GET',
    )
    const {
      middleware = [],
      query,
      headers = {},
      body,
      params,
      ...restOptions
    }: DevupApiRequestInit = options[0] || {}
    const mergedHeaders = new Headers(headers)
    const mergedOptions = {
      ...this.defaultOptions,
      ...restOptions,
    }
    const requestOptions = {
      ...mergedOptions,
      method: mergedOptions.method || method,
      headers: mergedHeaders,
    }
    if (body) {
      if (!isPlainObject(body)) {
        // Non-plain-object passthrough (FormData, Blob, string, etc.)
        requestOptions.body = body
      } else if (bodyType === 'form') {
        // URLSearchParams serialization
        requestOptions.body = objectToURLSearchParams(
          body as Record<string, unknown>,
        )
        if (!requestOptions.headers.has('Content-Type')) {
          requestOptions.headers.set(
            'Content-Type',
            'application/x-www-form-urlencoded',
          )
        }
      } else if (bodyType === 'multipart') {
        // FormData serialization — do NOT set Content-Type (browser sets it with boundary)
        requestOptions.body = objectToFormData(body as Record<string, unknown>)
      } else {
        // Default: JSON serialization (bodyType === 'json' or undefined)
        requestOptions.body = JSON.stringify(body)
        if (!requestOptions.headers.has('Content-Type')) {
          requestOptions.headers.set('Content-Type', 'application/json')
        }
      }
    }
    const queryString = query ? `?${getQueryString(query).toString()}` : ''
    let request = new Request(
      getApiEndpoint(this.baseUrl, url, params) + queryString,
      requestOptions as RequestInit,
    )

    const finalMiddleware = [...this.middleware, ...middleware]

    let tempResponse: Response | undefined

    for (const middleware of finalMiddleware) {
      if (middleware.onRequest) {
        const result = await middleware.onRequest(
          Object.freeze({
            request,
            schemaPath: url,
            params,
            query,
            headers,
            body,
          }),
        )
        if (result) {
          if (result instanceof Request) {
            request = result
          } else if (result instanceof Response) {
            tempResponse = result
            break
          } else {
            throw new Error(
              'onRequest: must return new Request() or Response() when modifying the request',
            )
          }
        }
      }
    }

    const ret = (await (tempResponse
      ? convertResponse(request, tempResponse)
      : fetch(request).then((response) =>
          convertResponse(request, response),
        ))) as DevupApiResponse<
      ExtractValue<O, 'response'>,
      ExtractValue<O, 'error'>
    >

    let response = ret.response
    const hasError = !ret.response.ok
    let error: unknown = ret.error

    for (const middleware of finalMiddleware) {
      const middlewareParams = {
        request,
        schemaPath: url,
        params: requestOptions.params,
        query: requestOptions.query,
        headers: requestOptions.headers,
        body: requestOptions.body,
      }

      let result: Response | Error | undefined

      // Call onResponse if it exists
      if (middleware.onResponse) {
        result = await middleware.onResponse({
          ...middlewareParams,
          response,
        })
      }

      // Call onError if there's an error and onResponse didn't return a result
      if (!result && hasError && middleware.onError) {
        result = await middleware.onError({
          ...middlewareParams,
          error,
        })
      }

      if (result) {
        if (result instanceof Response) {
          response = result
          break
        }
        if (result instanceof Error) {
          error = result
          break
        }
      }
    }

    return {
      data: ret.data,
      error: error,
      isOk: !hasError,
      isError: hasError,
      response,
    } as DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  }

  setDefaultOptions(options: DevupApiRequestInit): void {
    this.defaultOptions = options
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  getDefaultOptions(): DevupApiRequestInit {
    return this.defaultOptions
  }

  use(...middleware: Middleware[]): void {
    this.middleware.push(...middleware)
  }

  resolveEndpoint<M extends DevupApiMethodKeys>(
    method: M,
    key: DevupApiMethodKey<S, M>,
  ) {
    return getApiEndpointInfo(
      key,
      this.serverName,
      method.toUpperCase() as HttpMethod,
    )
  }
}
