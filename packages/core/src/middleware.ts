import type { DevupApiRequestInit } from './additional'
import type { PromiseOr } from './utils'

export interface MiddlewareCallbackParams {
  request: Request
  schemaPath: string
  params?: DevupApiRequestInit['params']
  query?: DevupApiRequestInit['query']
  headers?: DevupApiRequestInit['headers']
  body?: DevupApiRequestInit['body']
}

type MiddlewareOnRequest = (
  params: Readonly<MiddlewareCallbackParams>,
) => PromiseOr<undefined | Request | Response>
type MiddlewareOnResponse = (
  params: Readonly<MiddlewareCallbackParams & { response: Response }>,
) => PromiseOr<undefined | Error | Response>
type MiddlewareOnError = (
  params: Readonly<MiddlewareCallbackParams & { error: unknown }>,
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
