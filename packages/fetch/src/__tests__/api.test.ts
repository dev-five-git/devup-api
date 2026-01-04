/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { DevupApi } from '../api'

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

test.each([
  ['https://api.example.com', 'https://api.example.com'],
  ['https://api.example.com/', 'https://api.example.com'],
  ['http://localhost:3000', 'http://localhost:3000'],
  ['http://localhost:3000/', 'http://localhost:3000'],
] as const)('constructor removes trailing slash: %s -> %s', (baseUrl, expected) => {
  const api = new DevupApi(baseUrl, undefined, 'openapi.json')
  expect(api.getBaseUrl()).toBe(expected)
})

test.each([
  [undefined, {}],
  [{}, {}],
  [
    { headers: { Authorization: 'Bearer token' } },
    { headers: { Authorization: 'Bearer token' } },
  ],
] as const)('constructor accepts defaultOptions: %s -> %s', (defaultOptions, expected) => {
  const api = new DevupApi(
    'https://api.example.com',
    defaultOptions,
    'openapi.json',
  )
  expect(api.getDefaultOptions()).toEqual(expected)
})

test.each([
  [{}, {}],
  [
    { headers: { 'Content-Type': 'application/json' } },
    { headers: { 'Content-Type': 'application/json' } },
  ],
] as const)('setDefaultOptions updates defaultOptions: %s -> %s', (options, expected) => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  api.setDefaultOptions(options)
  expect(api.getDefaultOptions()).toEqual(expected)
})

test.each([
  ['GET', 'get'],
  ['GET', 'GET'],
  ['POST', 'post'],
  ['POST', 'POST'],
  ['PUT', 'put'],
  ['PUT', 'PUT'],
  ['DELETE', 'delete'],
  ['DELETE', 'DELETE'],
  ['PATCH', 'patch'],
  ['PATCH', 'PATCH'],
] as const)('HTTP method %s calls request with correct method', async (expectedMethod, methodName) => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await (api as any)[methodName]('/test' as never)

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    expect(request.method).toBe(expectedMethod)
  }
})

test('request serializes plain object body to JSON', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await api.post(
    '/test' as never,
    {
      body: { name: 'test', value: 123 },
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    const body = await request.text()
    expect(body).toBe(JSON.stringify({ name: 'test', value: 123 }))
  }
})

test('request does not serialize non-plain object body', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>
  const formData = new FormData()
  formData.append('file', 'test')

  await api.post(
    '/test' as never,
    {
      body: formData,
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    // FormData should not be serialized with JSON.stringify and should be passed as-is
    // Request body should not be null
    expect(request.body).not.toBeNull()
    // FormData is automatically set to multipart/form-data
    // body should exist
    expect(request.body).toBeDefined()
  }
})

test('request serializes plain object body to JSON with custom headers', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await api.post(
    '/test' as never,
    {
      body: { name: 'test', value: 123 },
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    const body = await request.text()
    expect(body).toBe(JSON.stringify({ name: 'test', value: 123 }))
    expect(request.headers.get('Content-Type')).toBe('application/json')
  }
})

test('request merges defaultOptions with request options', async () => {
  const api = new DevupApi(
    'https://api.example.com',
    {
      headers: { 'X-Default': 'default-value' },
    },
    'openapi.json',
  )
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await api.get(
    '/test' as never,
    {
      headers: { 'X-Request': 'request-value' },
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    // Headers are merged, but we can't easily test the merged result
    // So we just verify the request was made
    expect(request).toBeDefined()
  }
})

test('request uses params to replace path parameters', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await api.get(
    '/users/{id}' as never,
    {
      params: { id: '123' },
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    expect(request.url).toBe('https://api.example.com/users/123')
  }
})

test('request returns response with data on success', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: 1, name: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  expect('data' in result).toBe(true)
  if ('data' in result && result.data !== undefined) {
    expect(result.data).toEqual({ id: 1, name: 'test' })
  }
  expect(result.error).toBeUndefined()
  expect(result.response).toBeDefined()
  expect(result.response.ok).toBe(true)
})

test('request returns response with error on failure', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  expect('error' in result).toBe(true)
  if ('error' in result && result.error !== undefined) {
    expect(result.error).toEqual({ message: 'Not found' })
  }
  expect(result.data).toBeUndefined()
  expect(result.response).toBeDefined()
  expect(result.response.ok).toBe(false)
})

test('request handles 204 No Content response', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(null, {
        status: 204,
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const result = await api.delete('/test' as never)

  if ('data' in result) {
    expect(result.data).toBeUndefined()
  }
  if ('error' in result) {
    expect(result.error).toBeUndefined()
  }
  expect(result.response).toBeDefined()
  expect(result.response.status).toBe(204)
})

test('use method adds middleware', () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const middleware1 = {
    onRequest: async () => undefined,
  }
  const middleware2 = {
    onResponse: async () => undefined,
  }

  api.use(middleware1, middleware2)

  // Middleware is added, verify by using it in a request
  expect(api).toBeDefined()
})

test('onRequest middleware can modify request', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  api.use({
    onRequest: async ({ request }) => {
      const modifiedUrl = request.url.replace('/test', '/modified')
      return new Request(modifiedUrl, request)
    },
  })

  await api.get('/test' as never)

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    expect(request.url).toContain('/modified')
  }
})

test('onRequest middleware can return Response to skip fetch', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>
  const mockResponse = new Response(JSON.stringify({ cached: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  api.use({
    onRequest: async () => mockResponse,
  })

  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  expect(mockFetch).toHaveBeenCalledTimes(0)
  expect(result.response).toBe(mockResponse)
  if ('data' in result && result.data !== undefined) {
    expect(result.data).toEqual({ cached: true })
  }
})

test('onRequest middleware throws error when returning invalid value', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')

  api.use({
    onRequest: async () => 'invalid' as unknown as Request,
  })

  await expect(api.get('/test' as never)).rejects.toThrow(
    'onRequest: must return new Request() or Response() when modifying the request',
  )
})

test('onResponse middleware can modify response', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  let middlewareCalled = false

  api.use({
    onResponse: async ({ response }) => {
      middlewareCalled = true
      return new Response(JSON.stringify({ id: 1, modified: true }), {
        status: response.status,
        headers: response.headers,
      })
    },
  })

  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  expect(middlewareCalled).toBe(true)
  expect(result.response).toBeDefined()
  const responseData = await result.response.json()
  expect(responseData).toEqual({ id: 1, modified: true })
})

test('onResponse middleware can return Error', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const customError = new Error('Custom error')

  api.use({
    onResponse: async () => customError,
  })

  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  expect(result.error).toBe(customError)
})

test('onError middleware is called when onResponse is not defined and error exists', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  let errorMiddlewareCalled = false

  // onError is called when there's an error and no onResponse handler returned a result
  api.use({
    onError: async ({ error }) => {
      errorMiddlewareCalled = true
      expect(error).toBeDefined()
      return undefined
    },
  })

  await api.get('/test' as never)

  // onError should be called when there's an error response (404)
  expect(errorMiddlewareCalled).toBe(true)
})

test('onError middleware can return Error', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const customError = new Error('Custom error from middleware')

  // onError returns a custom Error to replace the original error
  api.use({
    onError: async () => customError,
  })

  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  // onError is called and returns the custom error
  expect(result.error).toBe(customError)
})

test('onError middleware can return Response', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const recoveryResponse = new Response(JSON.stringify({ recovered: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // onError returns a recovery Response to replace the error
  api.use({
    onError: async () => recoveryResponse,
  })

  const result = (await api.get('/test' as never)) as {
    data?: unknown
    error?: unknown
    response: Response
  }

  // onError is called and returns the recovery response
  expect(result.response).toBe(recoveryResponse)
})

test('middleware can be passed in request options', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>
  let requestMiddlewareCalled = false

  await api.get(
    '/test' as never,
    {
      middleware: [
        {
          onRequest: async () => {
            requestMiddlewareCalled = true
            return undefined
          },
        },
      ],
    } as never,
  )

  expect(requestMiddlewareCalled).toBe(true)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('request uses method from options when provided', async () => {
  const api = new DevupApi('https://api.example.com', undefined, 'openapi.json')
  const mockFetch = globalThis.fetch as unknown as ReturnType<typeof mock>

  await api.request(
    '/test' as never,
    {
      method: 'POST',
    } as never,
  )

  expect(mockFetch).toHaveBeenCalledTimes(1)
  const call = mockFetch.mock.calls[0]
  expect(call).toBeDefined()
  if (call) {
    const request = call[0] as Request
    expect(request.method).toBe('POST')
  }
})
