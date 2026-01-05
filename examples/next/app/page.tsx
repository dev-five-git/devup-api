'use client'

import { createApi, type DevupObject } from '@devup-api/fetch'
import { createQueryClient } from '@devup-api/react-query'
import { ApiCrud } from '@devup-api/ui'
import { schemas } from '@devup-api/zod'
import { Box, Text } from '@devup-ui/react'
import { useEffect } from 'react'

const api = createApi({
  baseUrl: 'https://api.example.com',
})
const api2 = createApi({
  baseUrl: 'https://api.example2.com',
  serverName: 'openapi2.json',
})

const queryClient = createQueryClient(api)

// Example usage of Zod schemas (will be populated after build)
const schema = schemas['openapi.json'].request.CreateUserRequest
const _a = schema.parse({
  name: 'John Doe',
  email: 'foo@bar.com',
})

export default function Home() {
  const { data, isLoading, error } = queryClient.useQuery('GET', 'getUsers', {
    // params: { id: 1 },
    query: {
      name: 'John Doe',
    },
  })
  const _object: DevupObject['User'] | undefined = data?.[0]
  const _object2: DevupObject<'response', 'openapi2.json'>['User'] | undefined =
    data?.[0]

  console.info(data, isLoading, error)

  const {
    data: _data2,
    error: _error2,
    mutateAsync,
  } = queryClient.useMutation('GET', '/users/{id}', {})

  // console.info(data2, error2)

  useEffect(() => {
    mutateAsync({
      params: { id: 1 },
      query: {
        name: 'John Doe',
      },
    })
    api2.get('getUsers2').then((res) => {
      console.log(res)
    })
    api.get('getUsers', {}).then((res) => {
      console.log(res)
    })

    api
      .get('getUserById', {
        params: { id: 1 },
        query: {
          name: 'John Doe',
        },
      })
      .then((res) => {
        console.log(res)
      })

    api
      .post('createUser', {
        body: {
          name: 'John Doe',
          email: 'foo@bar.com',
        },
      })
      .then((res) => {
        console.log(res)
      })
  }, [mutateAsync])
  return (
    <Box>
      <Text>Next.js Example (Turbopack)</Text>
      <Box>
        <ApiCrud api={'user'} apiClient={api} />
        <Box>
          <Box>
            <Box>
              {(() => {
                try {
                  const urlMap = process.env.DEVUP_API_URL_MAP
                  if (!urlMap) return 'Not available'
                  const parsed =
                    typeof urlMap === 'string' ? JSON.parse(urlMap) : urlMap
                  return JSON.stringify(parsed, null, 2)
                } catch {
                  return 'Error parsing URL map'
                }
              })()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
