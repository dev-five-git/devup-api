# @devup-api/generator

devup API Type Generator

Type generation package that generates TypeScript types from schemas.

## Installation

```bash
npm install @devup-api/generator
```

## Usage

```typescript
import { generateTypes, generateTypeFromSchema } from '@devup-api/generator';

// Generate types
await generateTypes({
  outputPath: './types',
  format: 'typescript',
});

// Generate type from schema
const typeString = generateTypeFromSchema(schema);
```
