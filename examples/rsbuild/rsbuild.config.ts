import devupApiRsbuildPlugin from '@devup-api/rsbuild-plugin'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [
    pluginReact(),
    devupApiRsbuildPlugin({
      openapiFile: './openapi.json',
      tempDir: '.devup-api',
    }),
  ],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    template: './index.html',
  },
})
