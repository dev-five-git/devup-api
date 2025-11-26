'use client'

import { createApi } from '@devup-api/fetch'
import { Box, Text } from '@devup-ui/react'
import { useEffect } from 'react'

const api = createApi('https://api.example.com')

export default function Home() {
  useEffect(() => {
    api.get('getUsers', {}).then((res) => {
      console.log(res)
    })

    api
      .get('getUserById', {
        params: { id: 1 },
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
