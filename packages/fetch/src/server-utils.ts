import type { DevupApiResponse } from './api'

export type SerializedResponse = {
  headers: Record<string, string>
  redirected: boolean
  status: number
  statusText: string
  type: string
  url: string
}

export type SerializedDevupApiResponse<T, E = unknown> = DevupApiResponse<
  T,
  E,
  SerializedResponse
>

function serializeResponse(response: Response): SerializedResponse {
  return {
    headers: Object.fromEntries(
      [...response.headers.entries()].map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    ),
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
  }
}

export function serializeApiResponse<T, E = unknown>(
  result: DevupApiResponse<T, E>,
): DevupApiResponse<T, E, SerializedResponse> {
  if (result.isOk) {
    return {
      data: result.data,
      isOk: true,
      isError: false,
      response: serializeResponse(result.response),
    }
  }

  return {
    error: result.error,
    isOk: false,
    isError: true,
    response: serializeResponse(result.response),
  }
}
