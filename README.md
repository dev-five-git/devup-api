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

**A fully typed API client generator powered by OpenAPI.  
Fetch-compatible, auto-generated types, zero generics required.**

devup-api reads your `openapi.json` file and automatically generates a fully typed client that behaves like an ergonomic, type-safe version of `fetch()`.  
No manual type declarations. No generics. No SDK boilerplate.  
Just write API calls — the types are already there.

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

### **1. Install the package**

```bash
# For Vite projects
npm install @devup-api/fetch @devup-api/vite-plugin

# For Next.js projects
npm install @devup-api/fetch @devup-api/next-plugin

# For Webpack projects
npm install @devup-api/fetch @devup-api/webpack-plugin

# For Rsbuild projects
npm install @devup-api/fetch @devup-api/rsbuild-plugin
```

### **2. Configure your build tool**

**Vite** (`vite.config.ts`):
```ts
import { defineConfig } from 'vite'
import devupApi from '@devup-api/vite-plugin'

export default defineConfig({
  plugins: [devupApi()],
})
```

**Next.js** (`next.config.ts`):
```ts
import devupApi from '@devup-api/next-plugin'

export default devupApi({
  reactStrictMode: true,
})
```

**Webpack** (`webpack.config.js`):
```js
const { devupApiWebpackPlugin } = require('@devup-api/webpack-plugin')

module.exports = {
  plugins: [new devupApiWebpackPlugin()],
}
```

**Rsbuild** (`rsbuild.config.ts`):
```ts
import { defineConfig } from '@rsbuild/core'
import { devupApiRsbuildPlugin } from '@devup-api/rsbuild-plugin'

export default defineConfig({
  plugins: [devupApiRsbuildPlugin()],
})
```

### **3. Add your OpenAPI schema**

Place your `openapi.json` file in the project root (or specify a custom path in plugin options).

### **4. Configure TypeScript**

Add the generated type definitions to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... your compiler options
  },
  "include": [
    "src",
    "df/**/*.d.ts"
  ]
}
```

> **Note:** The `df` directory is the default temporary directory where generated types are stored. If you've customized `tempDir` in plugin options, adjust the path accordingly (e.g., `"your-temp-dir/**/*.d.ts"`).

### **5. Create and use the API client**

```ts
import { createApi } from '@devup-api/fetch'

const api = createApi('https://api.example.com')

// Use operationId
const users = await api.get('getUsers', {})

// Or use the path directly
const user = await api.get('/users/{id}', {
  params: { id: '123' },
  headers: {
    Authorization: 'Bearer TOKEN'
  }
})

// POST request with typed body
const newUser = await api.post('createUser', {
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

---

## 🔥 Cold Typing vs Bold Typing

devup-api uses a two-phase typing system to ensure smooth development experience:

### **Cold Typing**

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

### **Bold Typing**

**Bold typing** refers to the state after the TypeScript interface files are generated. This happens when:
- The build tool has run (`dev` or `build`)
- The plugin has generated `api.d.ts` in the temp directory
- TypeScript can find and use the generated types

During bold typing:
- All API types are strictly enforced
- Full type safety is applied
- Type errors will be caught at compile time
- You get full IntelliSense and autocomplete

```ts
// Bold typing: Full type safety after api.d.ts is generated
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

### **GET Example**

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

### **POST Example**

```ts
const newPost = await api.post('createPost', {
  body: {
    title: 'Hello World',
    content: 'This is a typed API request.'
  }
})
```

### **Path Params Example**

```ts
const post = await api.get('/posts/{id}', {
  params: { id: '777' }
})
```

### **Response Handling**

```ts
const result = await api.get('getUser', { params: { id: '123' } })

if (result.data) {
  // Success response - fully typed!
  console.log(result.data.name)
} else if (result.error) {
  // Error response
  console.error(result.error.message)
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

devup-api provides first-class support for TanStack React Query through the `@devup-api/react-query` package.

### **Installation**

```bash
npm install @devup-api/react-query @tanstack/react-query
```

### **Setup**

```ts
import { createApi } from '@devup-api/fetch'
import { createQueryClient } from '@devup-api/react-query'

const api = createApi('https://api.example.com')
const queryClient = createQueryClient(api)
```

### **useQuery**

```ts
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = queryClient.useQuery(
    'get',
    '/users/{id}',
    { params: { id: userId } }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{data.name}</div>
}
```

### **useMutation**

```ts
function CreateUser() {
  const mutation = queryClient.useMutation('post', 'createUser')

  return (
    <button onClick={() => mutation.mutate({
      body: { name: 'John', email: 'john@example.com' }
    })}>
      Create User
    </button>
  )
}
```

### **useSuspenseQuery**

```ts
function UserList() {
  const { data } = queryClient.useSuspenseQuery('get', 'getUsers', {})
  return <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

### **useInfiniteQuery**

```ts
function InfiniteUserList() {
  const { data, fetchNextPage, hasNextPage } = queryClient.useInfiniteQuery(
    'get',
    'getUsers',
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  )

  return (
    <>
      {data?.pages.map(page =>
        page.users.map(user => <div key={user.id}>{user.name}</div>)
      )}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </>
  )
}
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
