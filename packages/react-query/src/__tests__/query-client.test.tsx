/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { DevupQueryClient } from '../query-client'

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: 1, name: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

test('DevupQueryClient useQuery with GET method', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () => queryClient.useQuery('get', '/test' as any),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useQuery with options', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQuery('get', '/test' as any, {
        params: { id: '123' },
      }),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useQuery with queryOptions', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQuery('get', '/test' as any, undefined, {
        staleTime: 1000,
      }),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useMutation with POST method', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () => queryClient.useMutation('post', '/test' as any),
    { wrapper: createWrapper() },
  )

  expect(result.current.mutate).toBeDefined()
  expect(typeof result.current.mutate).toBe('function')

  // Execute mutation to cover mutationFn
  result.current.mutate({
    body: { name: 'test' },
  })

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useMutation with mutationOptions', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)
  let successCalled = false

  const { result } = renderHook(
    () =>
      queryClient.useMutation('post', '/test' as any, {
        onSuccess: () => {
          successCalled = true
        },
      }),
    { wrapper: createWrapper() },
  )

  expect(result.current.mutate).toBeDefined()

  // Execute mutation to cover mutationFn
  result.current.mutate({
    body: { name: 'test' },
  })

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
  expect(successCalled).toBe(true)
})

test('DevupQueryClient useSuspenseQuery with GET method', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () => queryClient.useSuspenseQuery('get', '/test' as any),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useSuspenseQuery with options', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useSuspenseQuery('get', '/test' as any, {
        params: { id: '123' },
      }),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useInfiniteQuery with GET method', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useInfiniteQuery('get', '/test' as any, {
        initialPageParam: 1,
        getNextPageParam: () => undefined,
      }),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({
    pages: [{ id: 1, name: 'test' }],
    pageParams: [1],
  })
})

test('DevupQueryClient useInfiniteQuery with options', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useInfiniteQuery('get', '/test' as any, {
        initialPageParam: 1,
        getNextPageParam: () => undefined,
        query: { page: 1 },
      }),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual({
    pages: [{ id: 1, name: 'test' }],
    pageParams: [1],
  })
})

test('DevupQueryClient useQuery with different HTTP methods', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const methods = ['get', 'GET', 'post', 'POST'] as const

  for (const method of methods) {
    const { result } = renderHook(
      () => queryClient.useQuery(method as any, '/test' as any, {}),
      { wrapper: createWrapper() },
    )

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true)
      },
      { timeout: 5000 },
    )

    expect(result.current.data).toEqual({ id: 1, name: 'test' })
  }
})

test('DevupQueryClient useMutation with different HTTP methods', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const methods = [
    'get',
    'GET',
    'post',
    'POST',
    'put',
    'PUT',
    'patch',
    'PATCH',
    'delete',
    'DELETE',
  ] as const

  for (const method of methods) {
    const { result } = renderHook(
      () => queryClient.useMutation(method as any, '/test' as any),
      { wrapper: createWrapper() },
    )

    expect(result.current.mutate).toBeDefined()
  }
})

test('DevupQueryClient useSuspenseQuery with different HTTP methods', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const methods = ['get', 'GET', 'post', 'POST'] as const

  for (const method of methods) {
    const { result } = renderHook(
      () => queryClient.useSuspenseQuery(method as any, '/test' as any, {}),
      { wrapper: createWrapper() },
    )

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true)
      },
      { timeout: 5000 },
    )

    expect(result.current.data).toEqual({ id: 1, name: 'test' })
  }
})

test('DevupQueryClient useInfiniteQuery with different HTTP methods', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const methods = ['get', 'GET', 'post', 'POST'] as const

  for (const method of methods) {
    const { result } = renderHook(
      () =>
        queryClient.useInfiniteQuery(method as any, '/test' as any, {
          initialPageParam: 1,
          getNextPageParam: () => undefined,
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true)
      },
      { timeout: 5000 },
    )

    expect(result.current.data).toEqual({
      pages: [{ id: 1, name: 'test' }],
      pageParams: [1],
    })
  }
})

test('DevupQueryClient useQueries with multiple queries', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQueries([
        ['get', '/test1'],
        ['get', '/test2'],
      ]),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.every((r) => r.isSuccess)).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current).toHaveLength(2)
  expect(result.current[0].data).toEqual({ id: 1, name: 'test' })
  expect(result.current[1].data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useQueries with options', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQueries([
        ['get', '/test' as any, { params: { id: '123' } }],
      ]),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current[0].isSuccess).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current[0].data).toEqual({ id: 1, name: 'test' })
})

test('DevupQueryClient useQueries with combine', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQueries(
        [
          ['get', '/test1' as any],
          ['get', '/test2' as any],
        ],
        {
          combine: (results) => ({
            data: results.map((r) => r.data),
            pending: results.some((r) => r.isPending),
          }),
        },
      ),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.pending).toBe(false)
    },
    { timeout: 5000 },
  )

  expect(result.current.data).toEqual([
    { id: 1, name: 'test' },
    { id: 1, name: 'test' },
  ])
})

test('DevupQueryClient useQueries with different HTTP methods', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQueries([
        ['get', '/test' as any],
        ['GET', '/test' as any],
        ['post', '/test' as any],
      ]),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.every((r) => r.isSuccess)).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current).toHaveLength(3)
})

test('DevupQueryClient useQueries with queryOptions', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = new DevupQueryClient(api)

  const { result } = renderHook(
    () =>
      queryClient.useQueries([
        ['get', '/test' as any, undefined, { staleTime: 1000 }],
        [
          'get',
          '/test2' as any,
          { params: { id: '123' } },
          { staleTime: 2000 },
        ],
      ]),
    { wrapper: createWrapper() },
  )

  await waitFor(
    () => {
      expect(result.current.every((r) => r.isSuccess)).toBe(true)
    },
    { timeout: 5000 },
  )

  expect(result.current).toHaveLength(2)
})
