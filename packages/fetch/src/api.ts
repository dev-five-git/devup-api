import type {
  Additional,
  DevupApiRequestInit,
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
  RequiredOptions,
} from '@devup-api/core'
import { getUrlWithMethod } from './url-map'
import { getApiEndpoint, isPlainObject } from './utils'

export class DevupApi {
  private baseUrl: string
  private defaultOptions: DevupApiRequestInit

  constructor(baseUrl: string, defaultOptions: DevupApiRequestInit = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.defaultOptions = defaultOptions
  }

  get<
    T extends DevupGetApiStructKey,
    O extends Additional<T, DevupGetApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  GET<
    T extends DevupGetApiStructKey,
    O extends Additional<T, DevupGetApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  post<
    T extends DevupPostApiStructKey,
    O extends Additional<T, DevupPostApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  POST<
    T extends DevupPostApiStructKey,
    O extends Additional<T, DevupPostApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  put<
    T extends DevupPutApiStructKey,
    O extends Additional<T, DevupPutApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  PUT<
    T extends DevupPutApiStructKey,
    O extends Additional<T, DevupPutApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  delete<
    T extends DevupDeleteApiStructKey,
    O extends Additional<T, DevupDeleteApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  DELETE<
    T extends DevupDeleteApiStructKey,
    O extends Additional<T, DevupDeleteApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  patch<
    T extends DevupPatchApiStructKey,
    O extends Additional<T, DevupPatchApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  PATCH<
    T extends DevupPatchApiStructKey,
    O extends Additional<T, DevupPatchApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & O)
  }

  request<
    T extends DevupApiStructKey,
    O extends Additional<T, DevupApiStruct> & {
      params?: Record<string, string | number | boolean | null | undefined>
    },
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & O]
  ) {
    const { method, url } = getUrlWithMethod(path)
    const mergedOptions = {
      ...this.defaultOptions,
      ...options[0],
    }
    const requestOptions = {
      ...mergedOptions,
      method: mergedOptions.method || method,
    }
    if (requestOptions.body && isPlainObject(requestOptions.body)) {
      requestOptions.body = JSON.stringify(requestOptions.body)
    }
    return fetch(
      getApiEndpoint(
        this.baseUrl,
        url,
        (
          requestOptions as {
            params?: Record<
              string,
              string | number | boolean | null | undefined
            >
          }
        ).params,
      ),
      requestOptions as RequestInit,
    )
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
}
