# devup-api

[![npm version](https://img.shields.io/npm/v/@devup-api/fetch.svg)](https://www.npmjs.com/package/@devup-api/fetch)
[![npm downloads](https://img.shields.io/npm/dm/@devup-api/fetch.svg)](https://www.npmjs.com/package/@devup-api/fetch)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@devup-api/fetch)](https://bundlephobia.com/package/@devup-api/fetch)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/dev-five-git/devup-api/publish.yml?branch=main&label=CI)](https://github.com/dev-five-git/devup-api/actions)
[![Codecov](https://img.shields.io/codecov/c/github/dev-five-git/devup-api)](https://codecov.io/gh/dev-five-git/devup-api)
[![GitHub stars](https://img.shields.io/github/stars/dev-five-git/devup-api.svg?style=social&label=Star)](https://github.com/dev-five-git/devup-api)
[![GitHub forks](https://img.shields.io/github/forks/dev-five-git/devup-api.svg?style=social&label=Fork)](https://github.com/dev-five-git/devup-api/fork)
[![GitHub issues](https://img.shields.io/github/issues/dev-five-git/devup-api.svg)](https://github.com/dev-five-git/devup-api/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/dev-five-git/devup-api.svg)](https://github.com/dev-five-git/devup-api/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/dev-five-git/devup-api.svg)](https://github.com/dev-five-git/devup-api/commits/main)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-latest-000000.svg)](https://bun.sh)
[![Biome](https://img.shields.io/badge/Biome-2.3-000000.svg)](https://biomejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green.svg)](https://www.openapis.org/)

**A fully typed API client generator powered by OpenAPI.**
**Fetch-compatible, auto-generated types, zero generics required.**

devup-api reads your `openapi.json` file and automatically generates a fully typed client that behaves like an ergonomic, type-safe version of `fetch()`.

**No manual type declarations. No generics. No SDK boilerplate.**
Just write API calls — the types are already there.

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Cold Typing vs Boild Typing](#-cold-typing-vs-boild-typing)
- [Packages](#-packages)
- [API Usage](#-api-usage)
- [Multiple API Servers](#-multiple-api-servers)
- [React Query Integration](#-react-query-integration)
- [Advanced Usage](#-advanced-usage)
- [Configuration Options](#-configuration-options)
- [How It Works](#-how-it-works)
- [Development](#-development)
- [Acknowledgments](#-acknowledgments)
- [License](#-license)

---

## ✨ Features

### **🔍 OpenAPI-driven type generation**
- Reads `openapi.json` and transforms every path, method, schema into typed API functions.
- Parameters, request bodies, headers, responses — all typed automatically.
- No need to write or maintain separate TypeScript definitions.

### **🪝 Fetch-compatible design**
devup-api feels like using `fetch`, but with superpowers:

- Path params automatically replaced  
- Query/body/header types enforced  
- Typed success & error responses  
- Optional runtime schema validation  
- Minimal abstraction over standard fetch

### **🔌 Build tool integration**
- Works seamlessly with Vite, Next.js, Webpack, and Rsbuild
- Automatic type generation during build time
- Zero runtime overhead

---

## 🚀 Quick Start

Get started with devup-api in under 5 minutes! Follow these steps to generate fully typed API clients from your OpenAPI schema.

### **Step 1: Install Packages**

Choose the plugin for your build tool and install it along with the core fetch package:

<details open>
<summary><b>Vite</b></summary>

```bash
npm install @devup-api/fetch @devup-api/vite-plugin
```
</details>

<details>
<summary><b>Next.js</b></summary>

```bash
npm install @devup-api/fetch @devup-api/next-plugin
```
</details>

<details>
<summary><b>Webpack</b></summary>

```bash
npm install @devup-api/fetch @devup-api/webpack-plugin
```
</details>

<details>
<summary><b>Rsbuild</b></summary>

```bash
npm install @devup-api/fetch @devup-api/rsbuild-plugin
```
</details>

### **Step 2: Configure Your Build Tool**

Add the devup-api plugin to your build configuration:

<details open>
<summary><b>Vite</b> - <code>vite.config.ts</code></summary>

```ts
import { defineConfig } from 'vite'
import devupApi from '@devup-api/vite-plugin'

export default defineConfig({
  plugins: [
    devupApi({
      // Optional: customize configuration
      openapiFile: 'openapi.json', // default
      tempDir: 'df',               // default
      convertCase: 'camel',        // default
    }),
  ],
})
```
</details>

<details>
<summary><b>Next.js</b> - <code>next.config.ts</code></summary>

```ts
import devupApi from '@devup-api/next-plugin'

export default devupApi({
  reactStrictMode: true,
  // devup-api plugin options can be passed here
})
```
</details>

<details>
<summary><b>Webpack</b> - <code>webpack.config.js</code></summary>

```js
const { devupApiWebpackPlugin } = require('@devup-api/webpack-plugin')

module.exports = {
  plugins: [
    new devupApiWebpackPlugin({
      openapiFile: 'openapi.json',
      tempDir: 'df',
    }),
  ],
}
```
</details>

<details>
<summary><b>Rsbuild</b> - <code>rsbuild.config.ts</code></summary>

```ts
import { defineConfig } from '@rsbuild/core'
import { devupApiRsbuildPlugin } from '@devup-api/rsbuild-plugin'

export default defineConfig({
  plugins: [
    devupApiRsbuildPlugin({
      openapiFile: 'openapi.json',
      tempDir: 'df',
    }),
  ],
})
```
</details>

### **Step 3: Add Your OpenAPI Schema**

Place your `openapi.json` file in the project root:

```
your-project/
├── openapi.json          ← Your OpenAPI schema
├── src/
├── package.json
└── vite.config.ts (or next.config.ts, etc.)
```

> **Tip:** You can specify a custom path using the `openapiFile` option in plugin configuration.

### **Step 4: Configure TypeScript**

Update your `tsconfig.json` to include the generated type definitions:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
    // ... other options
  },
  "include": [
    "src",
    "df/**/*.d.ts"  // ← Include generated types
  ]
}
```

> **Note:** `df` is the default temp directory. If you customized `tempDir`, use that path instead (e.g., `"your-temp-dir/**/*.d.ts"`).

### **Step 5: Run Your Build**

Start your development server to generate types:

```bash
npm run dev
```

This will:
1. Read your `openapi.json` file
2. Generate TypeScript type definitions in `df/api.d.ts`
3. Enable full type safety for your API calls (**Boild Typing** 🔥)

### **Step 6: Create and Use Your API Client**

Now you're ready to make fully typed API calls!

```ts
import { createApi } from '@devup-api/fetch'

// Create API client
const api = createApi('https://api.example.com')

// ✅ GET request using operationId
const users = await api.get('getUsers', {
  query: { page: 1, limit: 20 }
})

// ✅ GET request using path with params
const user = await api.get('/users/{id}', {
  params: { id: '123' },
  headers: {
    Authorization: 'Bearer YOUR_TOKEN'
  }
})

// ✅ POST request with typed body
const newUser = await api.post('createUser', {
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// ✅ Handle response
if (newUser.data) {
  console.log('User created:', newUser.data.id)
} else if (newUser.error) {
  console.error('Error:', newUser.error.message)
}
```

**That's it!** 🎉 Your API client is now fully typed based on your OpenAPI schema.

---

## 🔥 Cold Typing vs Boild Typing

devup-api uses a two-phase typing system to ensure smooth development experience:

### **Cold Typing** ❄️

**Cold typing** refers to the state before the TypeScript interface files are generated. This happens when:
- You first install the plugin
- The build hasn't run yet
- The generated `api.d.ts` file doesn't exist

During cold typing:
- All API types are treated as `any`
- Type checking is relaxed to prevent type errors
- Your code will compile and run without issues
- You can write API calls without waiting for type generation

```ts
// Cold typing: No type errors even if api.d.ts doesn't exist yet
const api = createApi('https://api.example.com')
const result = await api.get('getUsers', {}) // ✅ Works, types are 'any'
```

### **Boild Typing** 🔥

**Boild typing** (named after "boiled" - the warm opposite of cold, and inspired by "boilerplate") refers to the state after the TypeScript interface files are generated. This happens when:
- The build tool has run (`dev` or `build`)
- The plugin has generated `api.d.ts` in the temp directory
- TypeScript can find and use the generated types

During boild typing:
- All API types are strictly enforced
- Full type safety is applied
- Type errors will be caught at compile time
- You get full IntelliSense and autocomplete
- No more boilerplate - types are ready to use!

```ts
// Boild typing: Full type safety after api.d.ts is generated
const api = createApi('https://api.example.com')
const result = await api.get('getUsers', {})
// ✅ Fully typed: result.data is typed based on your OpenAPI schema
// ❌ Type error if you use wrong parameters or paths
```

### **Why This Matters**

This two-phase approach ensures:
1. **No blocking**: You can start coding immediately without waiting for the build
2. **Gradual typing**: Types become available as soon as the build runs
3. **Production safety**: Full type checking in production builds
4. **Developer experience**: No false type errors during initial setup
5. **Zero boilerplate**: Once boiled, your types are ready - no manual type definitions needed

---

## 📦 Packages

This is a monorepo containing multiple packages:

- **`@devup-api/core`** - Core types and interfaces
- **`@devup-api/utils`** - Utility functions for OpenAPI processing
- **`@devup-api/generator`** - TypeScript interface generator from OpenAPI schemas
- **`@devup-api/fetch`** - Type-safe API client
- **`@devup-api/react-query`** - TanStack React Query integration
- **`@devup-api/vite-plugin`** - Vite plugin
- **`@devup-api/next-plugin`** - Next.js plugin
- **`@devup-api/webpack-plugin`** - Webpack plugin
- **`@devup-api/rsbuild-plugin`** - Rsbuild plugin

---

## 📚 API Usage

### **Basic Requests**

#### GET Request

```ts
// Using operationId
const users = await api.get('getUsers', {
  query: { page: 1, limit: 20 }
})

// Using path
const users = await api.get('/users', {
  query: { page: 1, limit: 20 }
})
```

#### POST Request

```ts
const newPost = await api.post('createPost', {
  body: {
    title: 'Hello World',
    content: 'This is a typed API request.'
  }
})
```

#### PUT/PATCH Request

```ts
// Update entire resource
const updatedUser = await api.put('/users/{id}', {
  params: { id: '123' },
  body: {
    name: 'Jane Doe',
    email: 'jane@example.com'
  }
})

// Partial update
const patchedUser = await api.patch('/users/{id}', {
  params: { id: '123' },
  body: {
    name: 'Jane Doe'  // Only update name
  }
})
```

#### DELETE Request

```ts
const result = await api.delete('/users/{id}', {
  params: { id: '123' }
})

if (result.data) {
  console.log('User deleted successfully')
}
```

### **Path Parameters**

```ts
// Single path parameter
const post = await api.get('/posts/{id}', {
  params: { id: '777' }
})

// Multiple path parameters
const comment = await api.get('/posts/{postId}/comments/{commentId}', {
  params: {
    postId: '123',
    commentId: '456'
  }
})
```

### **Query Parameters**

```ts
// Simple query params
const users = await api.get('getUsers', {
  query: {
    page: 1,
    limit: 20,
    sort: 'name',
    order: 'asc'
  }
})

// Query params with arrays
const products = await api.get('getProducts', {
  query: {
    categories: ['electronics', 'books'],
    tags: ['sale', 'new']
  }
})
```

### **Headers**

```ts
// Custom headers
const user = await api.get('/users/{id}', {
  params: { id: '123' },
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Custom-Header': 'custom-value',
    'Accept-Language': 'en-US'
  }
})
```

### **Response Handling**

```ts
const result = await api.get('getUser', { params: { id: '123' } })

if (result.data) {
  // Success response - fully typed!
  console.log(result.data.name)
  console.log(result.data.email)
} else if (result.error) {
  // Error response - also typed based on OpenAPI error schemas
  console.error('Error:', result.error.message)
  console.error('Status:', result.error.status)
}
```

### **Error Handling**

```ts
// Basic error handling
const result = await api.post('createUser', {
  body: { name: 'John', email: 'john@example.com' }
})

if (result.error) {
  switch (result.error.status) {
    case 400:
      console.error('Bad request:', result.error.message)
      break
    case 401:
      console.error('Unauthorized')
      // Redirect to login
      break
    case 403:
      console.error('Forbidden')
      break
    case 404:
      console.error('Not found')
      break
    case 500:
      console.error('Server error')
      break
    default:
      console.error('Unknown error:', result.error)
  }
}

// Try-catch for network errors
try {
  const result = await api.get('getUsers', {})
  if (result.data) {
    console.log(result.data)
  }
} catch (error) {
  console.error('Network error:', error)
}
```

### **Using DevupObject for Type References**

`DevupObject` allows you to reference generated schema types directly, which is useful for typing variables, function parameters, or component props.

```ts
import { createApi, type DevupObject } from '@devup-api/fetch'

// Access response types from the default OpenAPI schema
type User = DevupObject['User']
type Product = DevupObject['Product']

// Use in your code
const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
}

// For request/error types, specify the type category
type CreateUserRequest = DevupObject<'request'>['CreateUserBody']
type ApiError = DevupObject<'error'>['ErrorResponse']

// Use types in function parameters
function displayUser(user: User) {
  console.log(`${user.name} (${user.email})`)
}

// Use types in React components
interface UserCardProps {
  user: User
  onUpdate: (data: CreateUserRequest) => void
}

function UserCard({ user, onUpdate }: UserCardProps) {
  // Component implementation
}
```

### **Request Interceptors**

```ts
import { createApi } from '@devup-api/fetch'

// Create API with custom fetch implementation
const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    // Add custom logic before request
    console.log('Requesting:', url)

    // Add authentication token
    const headers = new Headers(init?.headers)
    const token = localStorage.getItem('authToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Make the request
    const response = await fetch(url, {
      ...init,
      headers,
    })

    // Add custom logic after request
    console.log('Response status:', response.status)

    return response
  }
})
```

### **Timeout Configuration**

```ts
import { createApi } from '@devup-api/fetch'

// Create API with timeout
const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      })
      return response
    } finally {
      clearTimeout(timeout)
    }
  }
})

// Usage
try {
  const result = await api.get('getUsers', {})
  if (result.data) {
    console.log(result.data)
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timed out')
  }
}
```

### **Retry Logic**

```ts
import { createApi } from '@devup-api/fetch'

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, init)
      if (response.ok || i === retries - 1) {
        return response
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: fetchWithRetry
})
```

---

## 🌐 Multiple API Servers

devup-api supports multiple OpenAPI schemas for working with different API servers.

### **Configuration**

Place multiple OpenAPI files in your project (e.g., `openapi.json`, `openapi2.json`) and the plugin will generate types for each.

### **Usage**

```ts
import { createApi, type DevupObject } from '@devup-api/fetch'

// Default server (uses openapi.json)
const api = createApi({
  baseUrl: 'https://api.example.com',
})

// Second server (uses openapi2.json)
const api2 = createApi({
  baseUrl: 'https://api.another-service.com',
  serverName: 'openapi2.json',
})

// Make requests to different servers
const users = await api.get('getUsers', {})
const products = await api2.get('getProducts', {})

// Access types from different schemas
type User = DevupObject['User']  // From openapi.json
type Product = DevupObject<'response', 'openapi2.json'>['Product']  // From openapi2.json
```

---

## 🔄 React Query Integration

devup-api provides first-class support for TanStack React Query through the `@devup-api/react-query` package. All hooks are fully typed based on your OpenAPI schema.

### **Installation**

```bash
npm install @devup-api/react-query @tanstack/react-query
```

### **Setup**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createApi } from '@devup-api/fetch'
import { createQueryClient } from '@devup-api/react-query'

// Create API client
const api = createApi('https://api.example.com')

// Create React Query client
const queryClient = createQueryClient(api)

// Create TanStack QueryClient
const tanstackQueryClient = new QueryClient()

// Wrap your app
function App() {
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}
```

### **useQuery - Fetching Data**

```tsx
import { queryClient } from './api'

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = queryClient.useQuery(
    'get',
    '/users/{id}',
    { params: { id: userId } }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
```

### **useQuery with Query Options**

```tsx
function UserList() {
  const { data, isLoading } = queryClient.useQuery(
    'get',
    'getUsers',
    { query: { page: 1, limit: 10 } },
    {
      // React Query options
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    }
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### **useMutation - Creating/Updating Data**

```tsx
function CreateUserForm() {
  const mutation = queryClient.useMutation('post', 'createUser', {
    onSuccess: (data) => {
      console.log('User created:', data)
      // Invalidate and refetch
      tanstackQueryClient.invalidateQueries({ queryKey: ['getUsers'] })
    },
    onError: (error) => {
      console.error('Failed to create user:', error)
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    mutation.mutate({
      body: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>User created successfully!</div>}
    </form>
  )
}
```

### **useMutation with Optimistic Updates**

```tsx
function UpdateUserForm({ userId }: { userId: string }) {
  const mutation = queryClient.useMutation('patch', '/users/{id}', {
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await tanstackQueryClient.cancelQueries({ queryKey: ['getUser', userId] })

      // Snapshot the previous value
      const previousUser = tanstackQueryClient.getQueryData(['getUser', userId])

      // Optimistically update to the new value
      if (previousUser) {
        tanstackQueryClient.setQueryData(['getUser', userId], {
          ...previousUser,
          ...variables.body,
        })
      }

      return { previousUser }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        tanstackQueryClient.setQueryData(['getUser', userId], context.previousUser)
      }
    },
    onSettled: () => {
      // Refetch after error or success
      tanstackQueryClient.invalidateQueries({ queryKey: ['getUser', userId] })
    },
  })

  return (
    <button onClick={() => mutation.mutate({
      params: { id: userId },
      body: { name: 'Updated Name' }
    })}>
      Update User
    </button>
  )
}
```

### **useSuspenseQuery - With React Suspense**

```tsx
import { Suspense } from 'react'

function UserList() {
  // No loading state needed - Suspense handles it
  const { data } = queryClient.useSuspenseQuery('get', 'getUsers', {})

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UserList />
    </Suspense>
  )
}
```

### **useInfiniteQuery - Pagination**

```tsx
function InfiniteUserList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = queryClient.useInfiniteQuery(
    'get',
    'getUsers',
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        // Return next page number or undefined if no more pages
        return lastPage.hasMore ? allPages.length + 1 : undefined
      },
    }
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map(user => (
            <div key={user.id}>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

### **useInfiniteQuery - Infinite Scroll**

```tsx
import { useEffect, useRef } from 'react'

function InfiniteScrollList() {
  const observerTarget = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    queryClient.useInfiniteQuery(
      'get',
      'getUsers',
      {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
      }
    )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map(user => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      ))}

      <div ref={observerTarget} style={{ height: '20px' }}>
        {isFetchingNextPage && 'Loading more...'}
      </div>
    </div>
  )
}
```

### **Dependent Queries**

```tsx
function UserPosts({ userId }: { userId: string }) {
  // First, fetch the user
  const { data: user } = queryClient.useQuery(
    'get',
    '/users/{id}',
    { params: { id: userId } }
  )

  // Then fetch posts, but only if user is loaded
  const { data: posts } = queryClient.useQuery(
    'get',
    '/posts',
    { query: { userId } },
    {
      enabled: !!user, // Only run this query if user exists
    }
  )

  return (
    <div>
      <h2>{user?.name}'s Posts</h2>
      {posts?.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

---

## 🚀 Advanced Usage

### **Authentication & Authorization**

#### JWT Authentication

```ts
import { createApi } from '@devup-api/fetch'

// Option 1: Custom fetch with automatic token injection
const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    const token = localStorage.getItem('accessToken')

    const headers = new Headers(init?.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return fetch(url, { ...init, headers })
  }
})

// Option 2: Wrapper function for token refresh
async function authenticatedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getValidToken() // Refresh if expired

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, { ...init, headers })
}

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: authenticatedFetch
})
```

#### Token Refresh Flow

```ts
import { createApi } from '@devup-api/fetch'

let accessToken = localStorage.getItem('accessToken')
let refreshToken = localStorage.getItem('refreshToken')

async function refreshAccessToken(): Promise<string> {
  const response = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  if (!response.ok) {
    // Redirect to login
    window.location.href = '/login'
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  accessToken = data.accessToken
  refreshToken = data.refreshToken

  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  return accessToken
}

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    const headers = new Headers(init?.headers)

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    let response = await fetch(url, { ...init, headers })

    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      try {
        const newToken = await refreshAccessToken()
        headers.set('Authorization', `Bearer ${newToken}`)
        response = await fetch(url, { ...init, headers })
      } catch (error) {
        // Refresh failed, redirect to login
        window.location.href = '/login'
        throw error
      }
    }

    return response
  }
})
```

### **File Upload**

#### Single File Upload

```ts
// Assuming your OpenAPI schema has a file upload endpoint
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const result = await api.post('/upload', {
    body: formData,
    headers: {
      // Don't set Content-Type - browser will set it with boundary
    }
  })

  if (result.data) {
    console.log('File uploaded:', result.data.url)
  }
}

// Usage
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}
```

#### Multiple File Upload with Progress

```ts
import { createApi } from '@devup-api/fetch'

function uploadFilesWithProgress(
  files: File[],
  onProgress: (progress: number) => void
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    files.forEach((file, index) => {
      formData.append(`file${index}`, file)
    })

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))

    xhr.open('POST', 'https://api.example.com/upload/multiple')
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`)
    xhr.send(formData)
  })
}

// Usage in React
function FileUploader() {
  const [progress, setProgress] = useState(0)

  const handleUpload = async (files: FileList) => {
    try {
      const result = await uploadFilesWithProgress(
        Array.from(files),
        setProgress
      )
      console.log('Upload complete:', result)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
      <progress value={progress} max={100} />
    </div>
  )
}
```

### **Request Cancellation**

```ts
import { createApi } from '@devup-api/fetch'

// Create API with support for AbortController
const api = createApi('https://api.example.com')

function SearchComponent() {
  const [controller, setController] = useState<AbortController | null>(null)

  const handleSearch = async (query: string) => {
    // Cancel previous request
    if (controller) {
      controller.abort()
    }

    // Create new controller
    const newController = new AbortController()
    setController(newController)

    try {
      // Custom fetch with abort signal
      const response = await fetch(`https://api.example.com/search?q=${query}`, {
        signal: newController.signal
      })

      const data = await response.json()
      console.log('Search results:', data)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search cancelled')
      } else {
        console.error('Search failed:', error)
      }
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup: cancel request on unmount
      if (controller) {
        controller.abort()
      }
    }
  }, [controller])

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### **Logging & Debugging**

```ts
import { createApi } from '@devup-api/fetch'

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    const startTime = performance.now()

    console.group(`🌐 API Request: ${init?.method || 'GET'} ${url}`)
    console.log('Headers:', init?.headers)
    console.log('Body:', init?.body)

    try {
      const response = await fetch(url, init)
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)

      console.log(`✅ Response: ${response.status} (${duration}ms)`)
      console.groupEnd()

      return response
    } catch (error) {
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)

      console.error(`❌ Request failed (${duration}ms):`, error)
      console.groupEnd()

      throw error
    }
  }
})
```

### **Caching Strategy**

```ts
import { createApi } from '@devup-api/fetch'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    const cacheKey = `${init?.method || 'GET'}:${url}`

    // Only cache GET requests
    if (!init?.method || init.method === 'GET') {
      const cached = cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Cache hit:', cacheKey)
        // Return cached response
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    const response = await fetch(url, init)

    // Cache successful GET responses
    if (response.ok && (!init?.method || init.method === 'GET')) {
      const clone = response.clone()
      const data = await clone.json()

      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }

    return response
  }
})

// Clear cache function
export function clearCache() {
  cache.clear()
}
```

### **Rate Limiting**

```ts
import { createApi } from '@devup-api/fetch'

class RateLimiter {
  private queue: Array<() => void> = []
  private requestsInWindow = 0
  private windowStart = Date.now()

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async throttle(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now()

      // Reset window if expired
      if (now - this.windowStart >= this.windowMs) {
        this.requestsInWindow = 0
        this.windowStart = now
      }

      // If under limit, proceed immediately
      if (this.requestsInWindow < this.maxRequests) {
        this.requestsInWindow++
        resolve()
      } else {
        // Queue the request
        this.queue.push(() => {
          this.requestsInWindow++
          resolve()
        })

        // Schedule queue processing
        const delay = this.windowMs - (now - this.windowStart)
        setTimeout(() => {
          this.requestsInWindow = 0
          this.windowStart = Date.now()
          this.processQueue()
        }, delay)
      }
    })
  }

  private processQueue() {
    while (this.queue.length > 0 && this.requestsInWindow < this.maxRequests) {
      const next = this.queue.shift()
      next?.()
    }
  }
}

// 10 requests per second
const rateLimiter = new RateLimiter(10, 1000)

const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: async (url, init) => {
    await rateLimiter.throttle()
    return fetch(url, init)
  }
})
```

### **Custom Base URL per Environment**

```ts
import { createApi } from '@devup-api/fetch'

const getBaseUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://api.production.com'
    case 'staging':
      return 'https://api.staging.com'
    case 'development':
    default:
      return 'http://localhost:3000'
  }
}

const api = createApi(getBaseUrl())

// Or with environment variables
const api = createApi(process.env.VITE_API_BASE_URL || 'http://localhost:3000')
```

---

## ⚙️ Configuration Options

All plugins accept the following options:

```ts
interface DevupApiOptions {
  /**
   * OpenAPI file path
   * @default 'openapi.json'
   */
  openapiFile?: string

  /**
   * Temporary directory for storing generated files
   * @default 'df'
   */
  tempDir?: string

  /**
   * Case conversion type for API endpoint names and parameters
   * @default 'camel'
   */
  convertCase?: 'snake' | 'camel' | 'pascal' | 'maintain'

  /**
   * Whether to make all properties non-nullable by default
   * @default false
   */
  requestDefaultNonNullable?: boolean

  /**
   * Whether to make all request properties non-nullable by default
   * @default true
   */
  responseDefaultNonNullable?: boolean
}
```

---

## 🎯 How It Works

1. Plugin reads your `openapi.json` during build time
2. Extracts paths, methods, schemas, parameters, and request bodies
3. Generates TypeScript interface definitions automatically
4. Creates a URL map for operationId-based API calls
5. Builds a typed wrapper around `fetch()` with full type safety

---

## 🛠️ Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Lint
bun run lint

# Fix linting issues
bun run lint:fix
```

---

## 🙏 Acknowledgments

This project is inspired by [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch), a fantastic library for type-safe API clients. devup-api builds upon similar concepts while providing additional features like build-time type generation and seamless integration with modern build tools.

---

## 📄 License

Apache 2.0
