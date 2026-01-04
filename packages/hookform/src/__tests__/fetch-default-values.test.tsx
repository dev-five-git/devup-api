/** biome-ignore-all lint/suspicious/noExplicitAny: any is used for test flexibility */
import { afterEach, expect, mock, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApiForm, useApiFormContext } from '../api-form'

const originalFetch = globalThis.fetch

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function TestWrapper({
  children,
  queryClient,
}: {
  children: ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

function FormFields() {
  const { register } = useFormContext()
  return (
    <>
      <input {...register('name')} data-testid="name-input" />
      <input {...register('email')} data-testid="email-input" />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </>
  )
}

function FormFieldsWithLoading() {
  const { form, isLoadingDefaultValues } = useApiFormContext()
  const { register } = form

  return (
    <>
      {isLoadingDefaultValues && (
        <span data-testid="loading">Loading defaults...</span>
      )}
      <input {...register('name')} data-testid="name-input" />
      <input {...register('email')} data-testid="email-input" />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </>
  )
}

test('ApiForm fetches default values with fetchDefaultValues config', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({ name: 'Fetched Name', email: 'fetched@example.com' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    ),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/users' as any}
        fetchDefaultValues={{
          method: 'get',
          path: '/users/123' as any,
        }}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  // Wait for default values to be fetched and populated
  await waitFor(
    () => {
      const nameInput = getByTestId('name-input') as HTMLInputElement
      expect(nameInput.value).toBe('Fetched Name')
    },
    { timeout: 5000 },
  )

  const emailInput = getByTestId('email-input') as HTMLInputElement
  expect(emailInput.value).toBe('fetched@example.com')
})

test('ApiForm fetchDefaultValues with transform function', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          user: { name: 'Nested Name', email: 'nested@example.com' },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    ),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="put"
        path={'/users/123' as any}
        fetchDefaultValues={{
          method: 'get',
          path: '/users/123' as any,
          transform: (response: any) => response.user,
        }}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  await waitFor(
    () => {
      const nameInput = getByTestId('name-input') as HTMLInputElement
      expect(nameInput.value).toBe('Nested Name')
    },
    { timeout: 5000 },
  )
})

test('ApiForm fetchDefaultValues handles fetch error gracefully', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  // Should not throw, form should still render
  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="put"
        path={'/users' as any}
        fetchDefaultValues={{
          path: '/users/999' as any,
        }}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  // Form should still be usable even if fetch fails
  const nameInput = getByTestId('name-input') as HTMLInputElement
  expect(nameInput).toBeDefined()
})

test('ApiForm without fetchDefaultValues uses provided defaultValues', () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/users' as any}
        defaultValues={{ name: 'Default Name', email: 'default@example.com' }}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const nameInput = getByTestId('name-input') as HTMLInputElement
  const emailInput = getByTestId('email-input') as HTMLInputElement

  expect(nameInput.value).toBe('Default Name')
  expect(emailInput.value).toBe('default@example.com')
})

test('ApiForm isLoadingDefaultValues is true while fetching', async () => {
  let resolvePromise: ((value: Response) => void) | undefined
  const fetchPromise = new Promise<Response>((resolve) => {
    resolvePromise = resolve
  })

  globalThis.fetch = mock(() => fetchPromise) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { queryByTestId, getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="put"
        path={'/users' as any}
        fetchDefaultValues={{
          path: '/users/123' as any,
        }}
      >
        <FormFieldsWithLoading />
      </ApiForm>
    </TestWrapper>,
  )

  // Should show loading initially
  await waitFor(() => {
    expect(queryByTestId('loading')).not.toBeNull()
  })

  // Resolve the fetch
  resolvePromise?.(
    new Response(
      JSON.stringify({ name: 'Loaded', email: 'loaded@example.com' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  )

  // Loading should disappear after data loads
  await waitFor(
    () => {
      const nameInput = getByTestId('name-input') as HTMLInputElement
      expect(nameInput.value).toBe('Loaded')
    },
    { timeout: 5000 },
  )
})
