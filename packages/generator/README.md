# @devup-api/generator

TypeScript interface generator from OpenAPI schemas.

## Installation

```bash
npm install @devup-api/generator
```

## Exports

- `generateInterface(schema: OpenAPIV3_1.Document, options?: DevupApiTypeGeneratorOptions): string` - Generate TypeScript interface definitions from OpenAPI schema
- `createUrlMap(schema: OpenAPIV3_1.Document, options?: DevupApiTypeGeneratorOptions): Record<string, UrlMapValue>` - Create URL map from OpenAPI schema

## Usage

### Generate TypeScript Interfaces

```ts
import { generateInterface } from '@devup-api/generator'
import { readOpenapiAsync } from '@devup-api/utils'

const schema = await readOpenapiAsync('openapi.json')
const interfaceCode = generateInterface(schema, {
  convertCase: 'camel',
  responseDefaultNonNullable: true
})

// Write to file
await writeFile('api.d.ts', interfaceCode)
```

### Create URL Map

```ts
import { createUrlMap } from '@devup-api/generator'
import { readOpenapiAsync } from '@devup-api/utils'

const schema = await readOpenapiAsync('openapi.json')
const urlMap = createUrlMap(schema, {
  convertCase: 'camel'
})

// urlMap will contain entries like:
// {
//   'getUsers': { method: 'GET', url: '/users' },
//   '/users': { method: 'GET', url: '/users' }
// }
```

## Options

```ts
interface DevupApiTypeGeneratorOptions {
  convertCase?: 'snake' | 'camel' | 'pascal' | 'maintain'
  requestDefaultNonNullable?: boolean
  responseDefaultNonNullable?: boolean
}
```

## License

Apache 2.0
