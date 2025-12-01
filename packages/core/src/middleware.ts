import type { DevupApiRequestInit } from './additional'
import type { PromiseOr } from './utils'

export interface MiddlewareCallbackParams {
  request: Request
  schemaPath: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  headers?: DevupApiRequestInit['headers']
  body?: DevupApiRequestInit['body']
}

type MiddlewareOnRequest = (
  params: MiddlewareCallbackParams,
) => PromiseOr<undefined | Request | Response>
type MiddlewareOnResponse = (
  params: MiddlewareCallbackParams & { response: Response },
) => PromiseOr<undefined | Error | Response>
type MiddlewareOnError = (
  params: MiddlewareCallbackParams & { error: unknown },
) => PromiseOr<undefined | Error | Response>

export type Middleware =
  | {
      onRequest: MiddlewareOnRequest
      onResponse?: MiddlewareOnResponse
      onError?: MiddlewareOnError
    }
  | {
      onRequest?: MiddlewareOnRequest
      onResponse: MiddlewareOnResponse
      onError?: MiddlewareOnError
    }
  | {
      onRequest?: MiddlewareOnRequest
      onResponse?: MiddlewareOnResponse
      onError: MiddlewareOnError
    }
