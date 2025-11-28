import devupApi from '@devup-api/next-plugin'
import { DevupUI } from '@devup-ui/next-plugin'

const config = devupApi({
  reactStrictMode: true,
})

export default DevupUI(config)
