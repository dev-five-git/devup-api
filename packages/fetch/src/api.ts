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
  ExtractValue,
  RequiredOptions,
} from '@devup-api/core'
import { convertResponse } from './response-converter'
import { getApiEndpointInfo } from './url-map'
import { getApiEndpoint, isPlainObject } from './utils'

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type
type DevupApiResponse<T, E = any> =
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
      : [options: DevupApiRequestInit & Omit<O, 'response' | 'error'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  GET<
    T extends DevupGetApiStructKey,
    O extends Additional<T, DevupGetApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'GET',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  post<
    T extends DevupPostApiStructKey,
    O extends Additional<T, DevupPostApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  POST<
    T extends DevupPostApiStructKey,
    O extends Additional<T, DevupPostApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'POST',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  put<
    T extends DevupPutApiStructKey,
    O extends Additional<T, DevupPutApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  PUT<
    T extends DevupPutApiStructKey,
    O extends Additional<T, DevupPutApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PUT',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  delete<
    T extends DevupDeleteApiStructKey,
    O extends Additional<T, DevupDeleteApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  DELETE<
    T extends DevupDeleteApiStructKey,
    O extends Additional<T, DevupDeleteApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'DELETE',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  patch<
    T extends DevupPatchApiStructKey,
    O extends Additional<T, DevupPatchApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  PATCH<
    T extends DevupPatchApiStructKey,
    O extends Additional<T, DevupPatchApiStruct>,
  >(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    return this.request(path, {
      method: 'PATCH',
      ...options[0],
    } as DevupApiRequestInit & Omit<O, 'response'>)
  }

  request<T extends DevupApiStructKey, O extends Additional<T, DevupApiStruct>>(
    path: T,
    ...options: [RequiredOptions<O>] extends [never]
      ? [options?: DevupApiRequestInit]
      : [options: DevupApiRequestInit & Omit<O, 'response'>]
  ): Promise<
    DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
  > {
    const { method, url } = getApiEndpointInfo(path)
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
    const request = new Request(
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
    return fetch(request).then((response) =>
      convertResponse(request, response),
    ) as Promise<
      DevupApiResponse<ExtractValue<O, 'response'>, ExtractValue<O, 'error'>>
    >
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
