export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface UrlMapValue {
  method: HttpMethod
  url: string
  bodyType?: 'json' | 'form' | 'multipart'
}

export type UrlMapStoredValue = Omit<UrlMapValue, 'method'>

export type UrlMapEntry = Partial<Record<HttpMethod, UrlMapStoredValue>>
