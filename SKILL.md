---
name: devup-api
description: A tool for generating fully typed API clients from OpenAPI schemas. It offers a fetch-compatible API, auto-generated types without generics, and integrates with major build tools like Vite, Next.js, and Webpack.
---

# devup-api

This skill helps you invoke the `devup-api` library to generate and use fully typed API clients in your TypeScript projects. `devup-api` reads your `openapi.json` and automatically generates a type-safe client that feels like `fetch` but with strict typing for paths, parameters, bodies, and responses.

## Key Features

- **OpenAPI-driven:** Generates types directly from `openapi.json`.
- **Fetch-compatible:** Ergonomic API similar to standard `fetch`.
- **Zero Generics:** No complex generic types to manage manually.
- **Build Tool Integration:** Plugins for Vite, Next.js, Webpack, and Rsbuild.
- **Two-phase Typing:** "Cold Typing" (relaxed types for initial setup) and "Bold Typing" (strict types after generation).

## Usage Instructions

### 1. Installation

Install the core fetch package and the plugin for your build tool:

```bash
npm install @devup-api/fetch @devup-api/vite-plugin  # For Vite
# OR
npm install @devup-api/fetch @devup-api/next-plugin  # For Next.js
# See README for Webpack and Rsbuild
```

### 2. Configuration

Add the plugin to your build configuration (e.g., `vite.config.ts`, `next.config.ts`).

**Vite Example:**
```ts
import { defineConfig } from 'vite'
import devupApi from '@devup-api/vite-plugin'

export default defineConfig({
  plugins: [devupApi()],
})
```

### 3. TypeScript Setup

Include the generated types in your `tsconfig.json`:

```json
{
  "include": [
    "src",
    "df/**/*.d.ts" 
  ]
}
```
*Note: `df` is the default temporary directory.*

### 4. Create and Use Client

```ts
import { createApi } from '@devup-api/fetch'

// Initialize
const api = createApi('https://api.example.com')

// GET Request (using operationId or path)
const users = await api.get('getUsers', { query: { page: 1 } })
// OR
const user = await api.get('/users/{id}', { params: { id: '123' } })

// POST Request
const newUser = await api.post('createUser', {
  body: { name: 'Alice', email: 'alice@example.com' }
})
```

## Examples

### Complete Workflow

1.  **Project Setup:** Ensure `openapi.json` is in your project root.
2.  **Configure:** Add `devup-api/vite-plugin` to `vite.config.ts`.
3.  **Run:** Run `npm run dev` or `npm run build`. This generates `df/api.d.ts`.
4.  **Code:** Use `createApi` to make requests. IntelliSense will now show available paths and required parameters.

### Handling Responses

`devup-api` returns an object with either `data` (success) or `error` (failure).

```ts
const response = await api.get('getUser', { params: { id: '1' } })

if (response.data) {
  console.log('User Name:', response.data.name)
} else if (response.error) {
  console.error('Error:', response.error.message)
}
```

## Guidelines

-   **"Cold" vs "Bold" Typing:** When you first start, types might be `any` (Cold Typing). Run your build command (`dev` or `build`) to generate the types and enable strict checking (Bold Typing).
-   **Operation IDs vs Paths:** You can use either the OpenAPI `operationId` (e.g., `getUsers`) or the URL path (e.g., `/users`). `operationId` is often more concise.
-   **Generated Files:** Do not manually edit the files in the `df` (or configured temp) directory. They are auto-generated.
-   **Verification:** If types seem missing, ensure `tsconfig.json` includes the generated folder and that the build script has run at least once.
