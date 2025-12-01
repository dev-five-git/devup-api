import devupApi from '@devup-api/next-plugin'
import { DevupUI } from '@devup-ui/next-plugin'

const config = devupApi(
  {
    reactStrictMode: true,
  },
  {
    openapiFiles: ['./openapi.json', './openapi2.json'],
  },
)

export default DevupUI(config)
