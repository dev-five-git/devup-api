import { expect, test } from 'bun:test'
import { convertResponse } from '../response-converter'

test.each([
  ['json', 'json'],
  ['text', 'text'],
  ['stream', 'stream'],
] as const)('convertResponse parses successful response with parseAs=%s', async (parseAs) => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response(JSON.stringify({ id: 1, name: 'test' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await convertResponse(request, response, parseAs)

  expect('data' in result).toBe(true)
  if ('data' in result) {
    if (parseAs === 'stream') {
      expect(result.data).toBeDefined()
    } else if (parseAs === 'text') {
      expect(typeof result.data).toBe('string')
    } else {
      expect(result.data).toEqual({ id: 1, name: 'test' })
    }
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles 204 No Content with success', async () => {
  const request = new Request('https://api.example.com/test', {
    method: 'DELETE',
  })
  const response = new Response(null, {
    status: 204,
  })

  const result = await convertResponse(request, response)

  if ('data' in result) {
    expect(result.data).toBeUndefined()
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles 204 No Content with error', async () => {
  const request = new Request('https://api.example.com/test', {
    method: 'DELETE',
  })
  const response = new Response(null, {
    status: 204,
    statusText: 'No Content',
  })

  // Mock response.ok to be false
  Object.defineProperty(response, 'ok', {
    value: false,
    writable: false,
  })

  const result = await convertResponse(request, response)

  if ('error' in result) {
    expect(result.error).toBeUndefined()
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles HEAD request', async () => {
  const request = new Request('https://api.example.com/test', {
    method: 'HEAD',
  })
  const response = new Response(null, {
    status: 200,
  })

  const result = await convertResponse(request, response)

  if ('data' in result) {
    expect(result.data).toBeUndefined()
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles Content-Length: 0', async () => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response(null, {
    status: 200,
    headers: { 'Content-Length': '0' },
  })

  const result = await convertResponse(request, response)

  if ('data' in result) {
    expect(result.data).toBeUndefined()
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles error response with JSON', async () => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response(JSON.stringify({ message: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await convertResponse(request, response)

  if ('error' in result) {
    expect(result.error).toEqual({ message: 'Not found' })
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles error response with non-JSON text', async () => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response('Internal Server Error', {
    status: 500,
    headers: { 'Content-Type': 'text/plain' },
  })

  const result = await convertResponse(request, response)

  if ('error' in result) {
    expect(result.error).toBe('Internal Server Error')
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles error response with invalid JSON', async () => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response('Invalid JSON{', {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await convertResponse(request, response)

  if ('error' in result) {
    expect(result.error).toBe('Invalid JSON{')
  }
  expect(result.response).toBe(response)
})

test('convertResponse handles non-204 error with Content-Length: 0', async () => {
  const request = new Request('https://api.example.com/test', { method: 'GET' })
  const response = new Response(null, {
    status: 500,
    headers: { 'Content-Length': '0' },
  })

  const result = await convertResponse(request, response)

  if ('error' in result) {
    expect(result.error).toBeUndefined()
  }
  expect(result.response).toBe(response)
})
