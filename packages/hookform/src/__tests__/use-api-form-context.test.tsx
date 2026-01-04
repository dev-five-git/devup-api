/** biome-ignore-all lint/suspicious/noExplicitAny: any is used for test flexibility */
import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { createApi } from '@devup-api/fetch'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
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

// Component that uses new API structure: { form, mutation }
function FormFieldsWithContext() {
  const { form, mutation, isLoadingDefaultValues } = useApiFormContext()
  const { register } = form
  const { isPending, isSuccess, isError, error, data } = mutation

  return (
    <>
      <input {...register('name')} data-testid="name-input" />
      <input {...register('email')} data-testid="email-input" />
      <button type="submit" data-testid="submit-button" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {isSuccess && <span data-testid="success-message">Success!</span>}
      {isError && (
        <span data-testid="error-message">{String(error) || 'Error'}</span>
      )}
      {data && <span data-testid="response-data">{JSON.stringify(data)}</span>}
      {isLoadingDefaultValues && (
        <span data-testid="loading-defaults">Loading...</span>
      )}
    </>
  )
}

test('useApiFormContext provides form and mutation objects', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <FormFieldsWithContext />
      </ApiForm>
    </TestWrapper>,
  )

  // Form should work
  const nameInput = getByTestId('name-input') as HTMLInputElement
  expect(nameInput).toBeDefined()

  // Button should show initial state
  const submitButton = getByTestId('submit-button')
  expect(submitButton.textContent).toBe('Submit')
})

test('useApiFormContext mutation state updates on submit', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onSuccess = mock(() => {})

  const { getByTestId, queryByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        onSuccess={onSuccess}
      >
        <FormFieldsWithContext />
      </ApiForm>
    </TestWrapper>,
  )

  const nameInput = getByTestId('name-input') as HTMLInputElement
  fireEvent.change(nameInput, { target: { value: 'John' } })

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  // Wait for success
  await waitFor(
    () => {
      expect(queryByTestId('success-message')).not.toBeNull()
    },
    { timeout: 5000 },
  )

  expect(onSuccess).toHaveBeenCalled()
})

test('useApiFormContext shows error state on API failure', async () => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: 'Failed' }), {
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
        <FormFieldsWithContext />
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

test('useApiFormContext throws error when used outside ApiForm', () => {
  function InvalidComponent() {
    useApiFormContext()
    return <div>Should not render</div>
  }

  // Suppress console.error for expected error
  const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<InvalidComponent />)).toThrow(
    'useApiFormContext must be used within an ApiForm',
  )

  consoleSpy.mockRestore()
})

test('useApiFormContext mutation.mutate can be called directly', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onSuccess = mock(() => {})

  function DirectMutateComponent() {
    const { form, mutation } = useApiFormContext()
    const { register } = form

    const handleDirectSubmit = () => {
      mutation.mutate({ name: 'Direct', email: 'direct@test.com' } as any)
    }

    return (
      <>
        <input {...register('name')} data-testid="name-input" />
        <button
          type="button"
          data-testid="direct-submit"
          onClick={handleDirectSubmit}
        >
          Direct Submit
        </button>
      </>
    )
  }

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/test' as any}
        onSuccess={onSuccess}
      >
        <DirectMutateComponent />
      </ApiForm>
    </TestWrapper>,
  )

  const directButton = getByTestId('direct-submit')
  fireEvent.click(directButton)

  await waitFor(
    () => {
      expect(onSuccess).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )
})

test('useApiFormContext accesses nested mutation properties', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  function NestedAccessComponent() {
    const { form, mutation } = useApiFormContext()
    const { register } = form
    // Access nested properties
    const pending = mutation.isPending
    const success = mutation.isSuccess

    return (
      <>
        <input {...register('name')} data-testid="name-input" />
        <span data-testid="pending">{String(pending)}</span>
        <span data-testid="success">{String(success)}</span>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </>
    )
  }

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <NestedAccessComponent />
      </ApiForm>
    </TestWrapper>,
  )

  expect(getByTestId('pending').textContent).toBe('false')
  expect(getByTestId('success').textContent).toBe('false')

  fireEvent.click(getByTestId('submit-button'))

  await waitFor(() => {
    expect(getByTestId('success').textContent).toBe('true')
  })
})

test('useApiFormContext proxy handles symbol access', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  let symbolResult: unknown = null

  function SymbolAccessComponent() {
    const context = useApiFormContext()
    // Access via Symbol.iterator or other symbol
    symbolResult = (context as any)[Symbol.toStringTag]
    return <div data-testid="rendered">Rendered</div>
  }

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <SymbolAccessComponent />
      </ApiForm>
    </TestWrapper>,
  )

  expect(getByTestId('rendered')).toBeTruthy()
  // Symbol access should return undefined or the actual value, not throw
  expect(symbolResult).toBeUndefined()
})

test('useApiFormContext proxy handles null values', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  let errorValue: unknown = 'not-accessed'

  function NullAccessComponent() {
    const { mutation } = useApiFormContext()
    // Access error which should be null initially
    errorValue = mutation.error
    return (
      <div data-testid="error-value">
        {errorValue === null
          ? 'null'
          : errorValue === undefined
            ? 'undefined'
            : 'other'}
      </div>
    )
  }

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <NullAccessComponent />
      </ApiForm>
    </TestWrapper>,
  )

  expect(getByTestId('error-value')).toBeTruthy()
  // Error should be null when no error has occurred
  expect(errorValue).toBeNull()
})

test('useApiFormContext cleans up subscription on unmount', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()

  function ContextConsumer() {
    const { mutation } = useApiFormContext()
    return <div data-testid="pending">{String(mutation.isPending)}</div>
  }

  const { unmount, getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm api={api} method="post" path={'/test' as any}>
        <ContextConsumer />
      </ApiForm>
    </TestWrapper>,
  )

  expect(getByTestId('pending').textContent).toBe('false')

  // Unmount triggers the unsubscribe cleanup
  unmount()
})
