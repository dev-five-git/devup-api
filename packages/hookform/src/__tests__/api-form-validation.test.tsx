/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to allow for flexibility in the type */
import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { z } from 'zod'

// Mock pathSchemas with test schema BEFORE importing ApiForm
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

mock.module('@devup-api/zod', () => ({
  pathSchemas: {
    post: {
      '/validated-test': testSchema,
    },
    put: {},
    patch: {},
    delete: {},
  },
}))

// Import after mock setup
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

test('ApiForm validates form data with Zod schema and calls onValidationError on failure', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onValidationError = mock(() => {})
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/validated-test' as any}
        onValidationError={onValidationError}
        onSuccess={onSuccess}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  // Submit without filling required fields - should trigger validation error
  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onValidationError).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )

  // onSuccess should not be called due to validation failure
  expect(onSuccess).not.toHaveBeenCalled()
})

test('ApiForm submits successfully when Zod validation passes', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onValidationError = mock(() => {})
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/validated-test' as any}
        onValidationError={onValidationError}
        onSuccess={onSuccess}
        defaultValues={{ name: 'John Doe', email: 'john@example.com' }}
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

  // onValidationError should not be called when validation passes
  expect(onValidationError).not.toHaveBeenCalled()
})

test('ApiForm shows validation errors for invalid email format', async () => {
  const api = createApi({ baseUrl: 'https://api.example.com' })
  const queryClient = createTestQueryClient()
  const onValidationError = mock(() => {})
  const onSuccess = mock(() => {})

  const { getByTestId } = render(
    <TestWrapper queryClient={queryClient}>
      <ApiForm
        api={api}
        method="post"
        path={'/validated-test' as any}
        onValidationError={onValidationError}
        onSuccess={onSuccess}
      >
        <FormFields />
      </ApiForm>
    </TestWrapper>,
  )

  // Fill name but invalid email
  const nameInput = getByTestId('name-input') as HTMLInputElement
  const emailInput = getByTestId('email-input') as HTMLInputElement

  fireEvent.change(nameInput, { target: { value: 'John Doe' } })
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

  const submitButton = getByTestId('submit-button')
  fireEvent.click(submitButton)

  await waitFor(
    () => {
      expect(onValidationError).toHaveBeenCalled()
    },
    { timeout: 5000 },
  )

  // Verify validation errors contain email error
  const callArgs = (onValidationError as any).mock.calls[0][0]
  expect(callArgs.email).toBeDefined()
})
