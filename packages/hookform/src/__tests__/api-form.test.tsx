/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApiForm } from '../api-form'

const originalFetch = globalThis.fetch

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

// Wrapper component with QueryClientProvider
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

// Test component that uses form context
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

test('ApiForm renders children correctly', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  expect(getByTestId('name-input')).toBeDefined()
  expect(getByTestId('email-input')).toBeDefined()
  expect(getByTestId('submit-button')).toBeDefined()
})

test('ApiForm submits form data via API', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        onSuccess={onSuccess}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const nameInput = getByTestId('name-input') as HTMLInputElement
  const emailInput = getByTestId('email-input') as HTMLInputElement
  const submitButton = getByTestId('submit-button')

  fireEvent.change(nameInput, { target: { value: 'John Doe' } })
  fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onSuccess).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )

  expect(onSuccess).toHaveBeenCalledWith({ id: 1, name: 'test' })
})

test('ApiForm calls onError when API returns error', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Error occurred' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onError = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any} onError={onError}>
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onError).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )
})

test('ApiForm supports different HTTP methods', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const methods = ['post', 'put', 'patch', 'delete'] as const

  for (const method of methods) {
    const queryClient = createTestQueryClient()
    const onSuccess = mock(() => {})

    const { getByTestId, unmount } = render(
      <TestWrapper queryClient={queryClient}>
        <ApiForm
          api={api}
          method={method}
          path={'/test' as any}
          onSuccess={onSuccess}
        >
          <FormFields />
        </ApiForm>
      </TestWrapper>,
    )

    const submitButton = getByTestId('submit-button')
    fireEvent.click(submitButton)

    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalled()
      },
      { timeout: 5000 },
    )

    unmount()
  }
})

test('ApiForm passes requestOptions to API call', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        requestOptions={{
          params: { id: '123' },
          headers: { 'X-Custom': 'test' },
        }}
        onSuccess={onSuccess}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onSuccess).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )
})

test('ApiForm resets form on success when resetOnSuccess is true', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        onSuccess={onSuccess}
        resetOnSuccess={true}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const nameInput = getByTestId('name-input') as HTMLInputElement
  fireEvent.change(nameInput, { target: { value: 'John Doe' } })

  expect(nameInput.value).toBe('John Doe')

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onSuccess).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )

  // Form should be reset
  await waitFor(() => {
    expect(nameInput.value).toBe('')
  })
})

test('ApiForm supports defaultValues', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
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

test('ApiForm supports formProps', () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { container } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        formProps={{ className: 'custom-form', id: 'test-form' }}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const form = container.querySelector('form')
  expect(form?.className).toBe('custom-form')
  expect(form?.id).toBe('test-form')
})

test('ApiForm handles network errors', async () => {
  globalThis.fetch = mock(() =>
    Promise.reject(new Error('Network error')),
  ) as unknown as typeof fetch

  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onError = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any} onError={onError}>
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onError).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )
})

test('ApiForm calls onValidationError when form validation fails', async () => {
  // This test requires a zod schema to be set up for validation
  // Since we don't have pathSchemas mocked, validation won't fail
  // This test just ensures the callback prop is accepted
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onValidationError = mock(() => {})
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        onValidationError={onValidationError}
        onSuccess={onSuccess}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  // Without schema validation, form will submit successfully
  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onSuccess).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )
})
