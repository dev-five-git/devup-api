import type {
  Additional,
  ConditionalKeys,
  DevupApiRequestInit,
  DevupApiServers,
  DevupApiStructKey,
  DevupApiStructScope,
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
  Middleware,
  RequiredOptions,
} from '@devup-api/core'
import { convertResponse } from './response-converter'
import { getApiEndpointInfo } from './url-map'
import { getApiEndpoint, getQueryString, isPlainObject } from './utils'

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type
export type DevupApiResponse<T, E = any> =
  | {
      data: T
      error?: undefined
      response: Response
    }
  | {
      data?: undefined
      error: E
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
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, DevupGetApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  GET<
    T extends DevupGetApiStructKey<S>,
    O extends Additional<T, DevupGetApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  post<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, DevupPostApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  POST<
    T extends DevupPostApiStructKey<S>,
    O extends Additional<T, DevupPostApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  put<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, DevupPutApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  PUT<
    T extends DevupPutApiStructKey<S>,
    O extends Additional<T, DevupPutApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  delete<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, DevupDeleteApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  DELETE<
    T extends DevupDeleteApiStructKey<S>,
    O extends Additional<T, DevupDeleteApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  patch<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, DevupPatchApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  PATCH<
    T extends DevupPatchApiStructKey<S>,
    O extends Additional<T, DevupPatchApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response' | 'error'>)
  }

  async request<
    T extends DevupApiStructKey<S>,
    O extends Additional<T, DevupApiStructScope<S>>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    const { method, url } = getApiEndpointInfo(path, this.serverName)
    const {
      middleware = [],
      query,
      headers = {},
      body,
      params,
      ...restOptions
    } = options[0] || {}
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
      if (isPlainObject(body)) {
        requestOptions.body = JSON.stringify(body)
        if (!requestOptions.headers.has('Content-Type')) {
          requestOptions.headers.set('Content-Type', 'application/json')
        }
      } else {
        requestOptions.body = body
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
    let error: unknown = ret.error

    for (const middleware of finalMiddleware) {
      if (response && middleware.onResponse) {
        const result = await (response && middleware.onResponse
          ? middleware.onResponse({
              request,
              schemaPath: url,
              params: requestOptions.params,
              query: requestOptions.query,
              headers: requestOptions.headers,
              body: requestOptions.body,
              response: ret.response,
            })
          : error && middleware.onError
            ? middleware.onError({
                request,
                schemaPath: url,
                params: requestOptions.params,
                query: requestOptions.query,
                headers: requestOptions.headers,
                body: requestOptions.body,
                error: ret.error,
              })
            : undefined)
        if (result) {
          if (result instanceof Response) {
            response = result
            break
          } else if (result instanceof Error) {
            error = result
            break
          }
        }
      }
    }

    return {
      data: ret.data,
      error: error,
      response,
    } as DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  }

  setDefaultOptions(options: DevupApiRequestInit) {
    this.defaultOptions = options
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getDefaultOptions() {
    return this.defaultOptions
  }

  use(...middleware: Middleware[]) {
    this.middleware.push(...middleware)
  }
}
