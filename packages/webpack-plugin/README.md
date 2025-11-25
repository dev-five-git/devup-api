# @devup-api/webpack-plugin

devup API plugin for Webpack

## Installation

```bash
npm install @devup-api/webpack-plugin
```

## Usage

```typescript
import devupApiWebpackPlugin from '@devup-api/webpack-plugin';
import webpack from 'webpack';

const config: webpack.Configuration = {
  plugins: [
    new devupApiWebpackPlugin({
      // options
    }),
  ],
};
```
