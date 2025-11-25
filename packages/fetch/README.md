# @devup-api/fetch

devup API Fetch library

Provides fetch API for end users.

## Installation

```bash
npm install @devup-api/fetch
```

## Usage

```typescript
import { devupFetch } from '@devup-api/fetch';

const response = await devupFetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
```
