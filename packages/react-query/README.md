# @devup-api/react-query

Type-safe React Query hooks built on top of `@devup-api/fetch` and `@tanstack/react-query`.

## Installation

```bash
npm install @devup-api/react-query @tanstack/react-query
```

## Prerequisites

Make sure you have `@tanstack/react-query` set up in your React application:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  )
}
```

## Usage

### Create API Hooks Instance

```tsx
import { createApi } from '@devup-api/react-query'

const api = createApi('https://api.example.com', {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Using Query Hooks (GET requests)

```tsx
import { createApi } from '@devup-api/react-query'

const api = createApi('https://api.example.com')

function UsersList() {
  // Using operationId
  const { data, isLoading, error } = api.useGet('getUsers', {
    query: { page: 1, limit: 20 }
  })

  // Using path
  const { data: user } = api.useGet('/users/{id}', {
    params: { id: '123' },
    query: { include: 'posts' }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (data?.error) return <div>API Error: {data.error}</div>
  if (data?.data) {
    return <div>{/* Render your data */}</div>
  }
  return null
}
```

### Using Mutation Hooks (POST, PUT, PATCH, DELETE)

#### POST Request

```tsx
function CreateUser() {
  const createUser = api.usePost('createUser')

  const handleSubmit = () => {
    createUser.mutate({
      body: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    })
  }

  return (
    <div>
      <button onClick={handleSubmit} disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
      {createUser.isError && <div>Error: {createUser.error?.message}</div>}
      {createUser.data?.data && <div>Success!</div>}
    </div>
  )
}
```

#### PUT Request

```tsx
function UpdateUser() {
  const updateUser = api.usePut('updateUser')

  const handleUpdate = () => {
    updateUser.mutate({
      params: { id: '123' },
      body: {
        name: 'Jane Doe'
      }
    })
  }

  return <button onClick={handleUpdate}>Update</button>
}
```

#### PATCH Request

```tsx
function PatchUser() {
  const patchUser = api.usePatch('patchUser')

  const handlePatch = () => {
    patchUser.mutate({
      params: { id: '123' },
      body: {
        name: 'Jane Doe'
      }
    })
  }

  return <button onClick={handlePatch}>Patch</button>
}
```

#### DELETE Request

```tsx
function DeleteUser() {
  const deleteUser = api.useDelete('deleteUser')

  const handleDelete = () => {
    deleteUser.mutate({
      params: { id: '123' }
    })
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

### Advanced Query Options

You can pass additional React Query options to customize behavior:

```tsx
const { data, isLoading } = api.useGet(
  'getUsers',
  { query: { page: 1 } },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  }
)
```

### Advanced Mutation Options

You can pass additional React Query mutation options:

```tsx
const createUser = api.usePost('createUser', {
  onSuccess: (data) => {
    console.log('User created:', data.data)
    // Invalidate and refetch users list
    queryClient.invalidateQueries({ queryKey: ['getUsers'] })
  },
  onError: (error) => {
    console.error('Failed to create user:', error)
  },
})
```

### Creating Hooks from Existing API Instance

If you already have a `DevupApi` instance from `@devup-api/fetch`, you can create hooks from it:

```tsx
import { createApi as createFetchApi } from '@devup-api/fetch'
import { createApiHooks } from '@devup-api/react-query'

const fetchApi = createFetchApi('https://api.example.com')
const api = createApiHooks(fetchApi)

// Now you can use api.useGet, api.usePost, etc.
```

## Response Handling

All hooks return React Query's standard return values, with the response data following the same structure as `@devup-api/fetch`:

```tsx
type DevupApiResponse<T, E> =
  | { data: T; error?: undefined; response: Response }
  | { data?: undefined; error: E; response: Response }
```

Example:

```tsx
const { data } = api.useGet('getUser', { params: { id: '123' } })

if (data?.data) {
  // Success - data.data is fully typed based on your OpenAPI schema
  console.log(data.data.name)
  console.log(data.data.email)
} else if (data?.error) {
  // Error - data.error is typed based on your OpenAPI error schemas
  console.error(data.error.message)
}

// Access raw Response object
console.log(data?.response.status)
```

## API Methods

- `api.useGet(path, options, queryOptions)` - GET request hook
- `api.usePost(path, mutationOptions)` - POST request hook
- `api.usePut(path, mutationOptions)` - PUT request hook
- `api.usePatch(path, mutationOptions)` - PATCH request hook
- `api.useDelete(path, mutationOptions)` - DELETE request hook

## Type Safety

All API hooks are fully typed based on your OpenAPI schema:

- Path parameters are type-checked
- Request bodies are type-checked
- Query parameters are type-checked
- Response types are inferred automatically
- Error types are inferred automatically

## License

Apache 2.0

