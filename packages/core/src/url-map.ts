export interface UrlMapValue {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  bodyType?: 'json' | 'form' | 'multipart'
}
