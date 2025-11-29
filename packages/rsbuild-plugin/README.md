# @devup-api/rsbuild-plugin

Rsbuild plugin for devup-api that generates TypeScript types from OpenAPI schemas.

## Installation

```bash
npm install @devup-api/rsbuild-plugin @devup-api/fetch
```

## Usage

### Basic Setup

Add the plugin to your `rsbuild.config.ts`:

```ts
import { defineConfig } from '@rsbuild/core'
import { devupApiRsbuildPlugin } from '@devup-api/rsbuild-plugin'

export default defineConfig({
  plugins: [devupApiRsbuildPlugin()],
})
```

### With Options

```ts
import { defineConfig } from '@rsbuild/core'
import { devupApiRsbuildPlugin } from '@devup-api/rsbuild-plugin'

export default defineConfig({
  plugins: [
    devupApiRsbuildPlugin({
      openapiFile: './api/openapi.json',
      convertCase: 'camel',
      tempDir: 'temp'
    })
  ],
})
```

## Options

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

## What It Does

1. Reads your `openapi.json` file during build
2. Generates TypeScript interface definitions (`api.d.ts`)
3. Creates a URL map and injects it as `process.env.DEVUP_API_URL_MAP` via Rsbuild's define feature
4. Makes types available for use with `@devup-api/fetch`

## TypeScript Configuration

To use the generated types, add the generated type definitions to your `tsconfig.json`:

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

> **Note:** If you've customized `tempDir` in plugin options, adjust the path accordingly (e.g., `"your-temp-dir/**/*.d.ts"`).

## Using the Generated Types

After the plugin runs, you can use the generated types with `@devup-api/fetch`:

```ts
import { createApi } from '@devup-api/fetch'

const api = createApi('https://api.example.com')

// Types are automatically available
const users = await api.get('getUsers', {})
```

## Cold Typing vs Bold Typing

devup-api uses a two-phase typing system:

- **Cold Typing**: Before the build runs, types are `any` to prevent type errors. Your code compiles and runs smoothly.
- **Bold Typing**: After the build runs and `api.d.ts` is generated, full type safety is enforced with strict type checking.

This ensures you can start coding immediately without waiting for the build, while still getting full type safety in production.

## License

Apache 2.0
