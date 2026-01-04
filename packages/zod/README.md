# @devup-api/zod

Zod schema generation for devup-api. This package provides runtime validation schemas generated from your OpenAPI specification.

## Installation

```bash
npm install @devup-api/zod zod
```

## Usage

This package works in conjunction with devup-api bundler plugins. The Zod schemas are provided as virtual files by the bundler plugins.

### With Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import devupApi from '@devup-api/vite-plugin'

export default defineConfig({
  plugins: [devupApi()],
})
```

### Using the Schemas

```ts
import { schemas } from '@devup-api/zod'

// Access generated Zod schemas
const userSchema = schemas.response.User
const createUserSchema = schemas.request.CreateUserRequest
const errorSchema = schemas.error.ApiError

// Validate data
const result = userSchema.safeParse(data)
if (result.success) {
  console.log('Valid user:', result.data)
} else {
  console.error('Validation errors:', result.error)
}
```

### Type Inference

```ts
import { schemas, type SchemaTypes } from '@devup-api/zod'
import { z } from 'zod'

// Infer types from schemas
type User = z.infer<typeof schemas.response.User>
type CreateUserRequest = z.infer<typeof schemas.request.CreateUserRequest>

// Or use the pre-defined types
type User = SchemaTypes['response']['User']
```

## How It Works

1. Your bundler plugin reads the OpenAPI specification
2. Zod schemas are generated from the OpenAPI schemas
3. When you import from `@devup-api/zod`, the bundler provides the generated schemas as a virtual file
4. You get fully typed, runtime-validated schemas

## Cold Typing vs Boild Typing

Similar to `@devup-api/fetch`, this package uses a two-phase typing system:

- **Cold Typing**: Before the build runs, schemas are typed as `any` to prevent type errors
- **Boild Typing**: After the build runs, full type safety is enforced

## License

Apache 2.0
