# @devup-api/core

Core types and interfaces for devup-api.

## Installation

```bash
npm install @devup-api/core
```

## Exports

### Types

- `DevupApiOptions` - Plugin configuration options
- `DevupApiTypeGeneratorOptions` - Type generation options
- `UrlMapValue` - URL map entry structure
- `DevupApiStruct` - API structure types for type-safe API calls

### Interfaces

```ts
interface DevupApiOptions {
  openapiFile?: string
  tempDir?: string
  convertCase?: 'snake' | 'camel' | 'pascal' | 'maintain'
  requestDefaultNonNullable?: boolean
  responseDefaultNonNullable?: boolean
}

interface UrlMapValue {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
}
```

## Usage

This package is primarily used internally by other devup-api packages. You typically don't need to import from this package directly unless you're building custom integrations.

```ts
import type { DevupApiOptions } from '@devup-api/core'
```

## License

Apache 2.0
