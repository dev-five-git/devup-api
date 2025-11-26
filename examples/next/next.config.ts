import devupApi from '@devup-api/next-plugin'

const config = devupApi(
  {
    reactStrictMode: true,
  },
  {
    openapiFile: './openapi.json',
    tempDir: '.devup-api',
  },
)

export default config
