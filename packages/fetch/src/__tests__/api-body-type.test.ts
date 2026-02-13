/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import type { UrlMapValue } from '@devup-api/core'

// Mock the url-map module to return custom bodyType values
const mockUrlMap: Record<string, Record<string, UrlMapValue>> = {
  'openapi.json': {
    submitForm: { method: 'POST', url: '/submit', bodyType: 'form' },
    uploadFile: { method: 'POST', url: '/upload', bodyType: 'multipart' },
    jsonEndpoint: { method: 'POST', url: '/json', bodyType: 'json' },
  },
}

mock.module('../url-map', () => ({
  DEVUP_API_URL_MAP: mockUrlMap,
  getApiEndpointInfo: (key: string, serverName: string): UrlMapValue => {
    const result = mockUrlMap[serverName]?.[key] ?? {
      method: 'GET' as const,
      url: key,
    }
    result.url ||= key
    return result
  },
}))

// Import DevupApi AFTER mock.module so it picks up the mocked url-map
const { DevupApi } = await import('../api')

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('bodyType-aware serialization', () => {
  test('bodyType form: plain object body serialized as URLSearchParams', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    await api.post(
      'submitForm' as never,
      { body: { name: 'test', age: 25 } } as never,
    )

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      expect(request.headers.get('Content-Type')).toBe(
        'application/x-www-form-urlencoded',
      )
      const body = await request.text()
      const params = new URLSearchParams(body)
      expect(params.get('name')).toBe('test')
      expect(params.get('age')).toBe('25')
    }
  })

  test('bodyType multipart: plain object body serialized as FormData', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    await api.post(
      'uploadFile' as never,
      { body: { name: 'test', value: 123 } } as never,
    )

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      // Content-Type should NOT be explicitly set for multipart
      // (browser auto-sets with boundary)
      const contentType = request.headers.get('Content-Type')
      expect(
        contentType === null || contentType.includes('multipart/form-data'),
      ).toBe(true)
      expect(request.body).not.toBeNull()
    }
  })

  test('bodyType undefined (default): plain object body serialized as JSON', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    // Use a path that is NOT in the URL map, so bodyType will be undefined
    await api.post(
      '/test' as never,
      { body: { name: 'test', value: 123 } } as never,
    )

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      expect(request.headers.get('Content-Type')).toBe('application/json')
      const body = await request.text()
      expect(body).toBe(JSON.stringify({ name: 'test', value: 123 }))
    }
  })

  test('bodyType json: plain object body serialized as JSON', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    await api.post('jsonEndpoint' as never, { body: { name: 'test' } } as never)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      expect(request.headers.get('Content-Type')).toBe('application/json')
      const body = await request.text()
      expect(body).toBe(JSON.stringify({ name: 'test' }))
    }
  })

  test('FormData body passthrough regardless of bodyType', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>
    const formData = new FormData()
    formData.append('file', 'test')

    await api.post('submitForm' as never, { body: formData } as never)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      // FormData should be passed through as-is, not re-serialized
      expect(request.body).not.toBeNull()
      expect(request.body).toBeDefined()
    }
  })

  test('bodyType form: nested objects are JSON.stringified in URLSearchParams', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    await api.post(
      'submitForm' as never,
      { body: { data: { nested: true }, items: [1, 2] } } as never,
    )

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      const body = await request.text()
      const params = new URLSearchParams(body)
      expect(params.get('data')).toBe(JSON.stringify({ nested: true }))
      expect(params.get('items')).toBe(JSON.stringify([1, 2]))
    }
  })

  test('bodyType form: null/undefined values are skipped', async () => {
    const api = new DevupApi(
      'https://api.example.com',
      undefined,
      'openapi.json',
    )
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

    await api.post(
      'submitForm' as never,
      { body: { name: 'test', empty: null, missing: undefined } } as never,
    )

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call).toBeDefined()
    if (call) {
      const request = call[0] as Request
      const body = await request.text()
      const params = new URLSearchParams(body)
      expect(params.get('name')).toBe('test')
      expect(params.has('empty')).toBe(false)
      expect(params.has('missing')).toBe(false)
    }
  })
})
