# @devup-api/rsbuild-plugin

devup API plugin for Rsbuild

## Installation

```bash
npm install @devup-api/rsbuild-plugin
```

## Usage

```typescript
import devupApiRsbuildPlugin from '@devup-api/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [
    devupApiRsbuildPlugin({
      // options
    }),
  ],
});
```
