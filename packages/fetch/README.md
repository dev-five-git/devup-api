# @devup-api/fetch

Type-safe API client built on top of fetch.

## Installation

```bash
npm install @devup-api/fetch
```

## Usage

### Create API Instance

```ts
import { createApi } from '@devup-api/fetch'

const api = createApi('https://api.example.com', {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Making Requests

#### GET Request

```ts
// Using operationId
const result = await api.get('getUsers', {
  query: { page: 1, limit: 20 }
})

// Using path
const result = await api.get('/users/{id}', {
  params: { id: '123' },
  query: { include: 'posts' }
})
```

#### POST Request

```ts
const result = await api.post('createUser', {
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  headers: {
    Authorization: 'Bearer token'
  }
})
```

#### PUT Request

```ts
const result = await api.put('updateUser', {
  params: { id: '123' },
  body: {
    name: 'Jane Doe'
  }
})
```

#### PATCH Request

```ts
const result = await api.patch('patchUser', {
  params: { id: '123' },
  body: {
    name: 'Jane Doe'
  }
})
```

#### DELETE Request

```ts
const result = await api.delete('deleteUser', {
  params: { id: '123' }
})
```

### Response Handling

All methods return a promise that resolves to:

```ts
type DevupApiResponse<T, E> =
  | { data: T; error?: undefined; response: Response }
  | { data?: undefined; error: E; response: Response }
```

Example:

```ts
const result = await api.get('getUser', { params: { id: '123' } })

if (result.data) {
  // Success - result.data is fully typed based on your OpenAPI schema
  console.log(result.data.name)
  console.log(result.data.email)
} else if (result.error) {
  // Error - result.error is typed based on your OpenAPI error schemas
  console.error(result.error.message)
}

// Access raw Response object
console.log(result.response.status)
```

### Using Path Parameters

```ts
// Path parameters are automatically replaced
const result = await api.get('/users/{userId}/posts/{postId}', {
  params: {
    userId: '123',
    postId: '456'
  }
})
// URL becomes: /users/123/posts/456
```

### Using Query Parameters

```ts
const result = await api.get('/users', {
  query: {
    page: 1,
    limit: 20,
    sort: 'name'
  }
})
// URL becomes: /users?page=1&limit=20&sort=name
```

## API Methods

- `api.get(path, options)` - GET request
- `api.GET(path, options)` - GET request (uppercase alias)
- `api.post(path, options)` - POST request
- `api.POST(path, options)` - POST request (uppercase alias)
- `api.put(path, options)` - PUT request
- `api.PUT(path, options)` - PUT request (uppercase alias)
- `api.patch(path, options)` - PATCH request
- `api.PATCH(path, options)` - PATCH request (uppercase alias)
- `api.delete(path, options)` - DELETE request
- `api.DELETE(path, options)` - DELETE request (uppercase alias)

## Type Safety

All API methods are fully typed based on your OpenAPI schema:

- Path parameters are type-checked
- Request bodies are type-checked
- Query parameters are type-checked
- Response types are inferred automatically
- Error types are inferred automatically

## License

Apache 2.0
