'use client'

import { createApi } from '@devup-api/fetch'
import { createQueryClient } from '@devup-api/react-query'
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

export default function Home() {
  const { data, isLoading, error } = queryClient.useQuery(
    'GET',
    'getUserById',
    {
      params: { id: 1 },
      query: {
        name: 'John Doe',
      },
    },
  )

  console.info(data, isLoading, error)

  const {
    data: data2,
    isLoading: isLoading2,
    error: error2,
  } = queryClient.useQuery('GET', '/users', {
    params: { id: 1 },
  })

  console.info(data2, isLoading2, error2)

  useEffect(() => {
    api2.get('getUsers2').then((res) => {
      console.log(res)
    })
    api.get('getUsers').then((res) => {
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
  }, [])
  return (
    <Box>
      <Text>Next.js Example (Turbopack)</Text>
      <Box>
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
