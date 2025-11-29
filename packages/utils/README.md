# @devup-api/utils

Utility functions for OpenAPI processing and file operations.

## Installation

```bash
npm install @devup-api/utils
```

## Exports

### Case Conversion Functions

- `toCamel(str: string): string` - Convert string to camelCase
- `toSnake(str: string): string` - Convert string to snake_case
- `toPascal(str: string): string` - Convert string to PascalCase

### File Operations

- `readOpenapi(filePath?: string): OpenAPIV3_1.Document` - Read and parse OpenAPI JSON file (synchronous)
- `readOpenapiAsync(filePath?: string): Promise<OpenAPIV3_1.Document>` - Read and parse OpenAPI JSON file (asynchronous)
- `writeInterface(filePath: string, content: string): void` - Write TypeScript interface file (synchronous)
- `writeInterfaceAsync(filePath: string, content: string): Promise<void>` - Write TypeScript interface file (asynchronous)
- `createTmpDir(tempDir?: string): string` - Create temporary directory (synchronous)
- `createTmpDirAsync(tempDir?: string): Promise<string>` - Create temporary directory (asynchronous)

## Usage

### Case Conversion

```ts
import { toCamel, toSnake, toPascal } from '@devup-api/utils'

toCamel('hello_world') // 'helloWorld'
toSnake('helloWorld') // 'hello_world'
toPascal('hello_world') // 'HelloWorld'
```

### File Operations

```ts
import { readOpenapiAsync, writeInterfaceAsync, createTmpDirAsync } from '@devup-api/utils'

// Read OpenAPI schema
const schema = await readOpenapiAsync('openapi.json')

// Create temp directory
const tempDir = await createTmpDirAsync('my-temp-dir')

// Write interface file
await writeInterfaceAsync('api.d.ts', interfaceContent)
```

## License

Apache 2.0
