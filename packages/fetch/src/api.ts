import type {
  Additional,
  DevupApiStruct,
  DevupApiStructKey,
  DevupDeleteApiStruct,
  DevupGetApiStruct,
  DevupPatchApiStruct,
  DevupPostApiStruct,
  DevupPutApiStruct,
} from '@devup-api/core'
import { getUrl, getUrlWithMethod } from './url-map'

export class devupApi {
  private baseUrl: string
  private defaultOptions: RequestInit

  constructor(baseUrl: string, defaultOptions: RequestInit = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = defaultOptions
  }

  get<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupGetApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  GET<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupGetApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  post<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPostApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  POST<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPostApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  put<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPutApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  PUT<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPutApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  delete<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupDeleteApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  DELETE<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupDeleteApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  patch<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPatchApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  PATCH<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupPatchApiStruct>,
  ) {
    return fetch(`${this.baseUrl}${getUrl(path)}`, {
      ...this.defaultOptions,
      ...options,
    })
  }

  request<T extends DevupApiStructKey>(
    path: T,
    options?: RequestInit & Additional<T, DevupApiStruct>,
  ) {
    const [method, url] = getUrlWithMethod(path)
    return fetch(`${this.baseUrl}${url}`, {
      method,
      ...this.defaultOptions,
      ...options,
    })
  }

  setDefaultOptions(options: RequestInit) {
    this.defaultOptions = options
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getDefaultOptions() {
    return this.defaultOptions
  }
}
