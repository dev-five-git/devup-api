import { describe, expect, test } from 'bun:test'
import type { DevupApiResponse } from '../api'
import { serializeApiResponse } from '../server-utils'

describe('serializeApiResponse', () => {
  test('converts successful responses to Server Action-safe plain objects', () => {
    const response = new Response(JSON.stringify({ id: 1 }), {
      status: 201,
      statusText: 'Created',
      headers: { 'X-Test': 'yes' },
    })
    const result: DevupApiResponse<{ id: number }, { message: string }> = {
      data: { id: 1 },
      isOk: true,
      isError: false,
      response,
    }

    expect(serializeApiResponse(result)).toEqual({
      data: { id: 1 },
      isOk: true,
      isError: false,
      response: {
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          'x-test': 'yes',
        },
        redirected: false,
        status: 201,
        statusText: 'Created',
        type: response.type,
        url: '',
      },
    })
  })

  test('converts error responses to Server Action-safe plain objects', () => {
    const response = new Response('missing', { status: 404 })
    const result: DevupApiResponse<{ id: number }, { message: string }> = {
      error: { message: 'Not found' },
      isOk: false,
      isError: true,
      response,
    }

    expect(serializeApiResponse(result)).toEqual({
      error: { message: 'Not found' },
      isOk: false,
      isError: true,
      response: {
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        redirected: false,
        status: 404,
        statusText: '',
        type: response.type,
        url: '',
      },
    })
  })
})
