# @devup-api/next-plugin

Next.js plugin for devup-api that generates TypeScript types from OpenAPI schemas.

## Installation

```bash
npm install @devup-api/next-plugin @devup-api/fetch
```

## Usage

### Basic Setup

Add the plugin to your `next.config.ts`:

```ts
import devupApi from '@devup-api/next-plugin'

export default devupApi({
  reactStrictMode: true,
})
```

### With Options

```ts
import devupApi from '@devup-api/next-plugin'

export default devupApi(
  {
    reactStrictMode: true,
  },
  {
    openapiFile: './api/openapi.json',
    convertCase: 'camel',
    tempDir: 'temp'
  }
)
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

## How It Works

### Turbopack Mode

When using Turbopack (Next.js 13+), the plugin:
1. Reads your `openapi.json` file
2. Generates TypeScript interface definitions
3. Creates a URL map and sets it as `process.env.DEVUP_API_URL_MAP`
4. Makes types available for use with `@devup-api/fetch`

### Webpack Mode

When using Webpack, the plugin uses `@devup-api/webpack-plugin` internally to:
1. Generate types during build time
2. Inject URL map via webpack DefinePlugin
3. Make types available for use with `@devup-api/fetch`

## TypeScript Configuration

To use the generated types, add the generated type definitions to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... your compiler options
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
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
