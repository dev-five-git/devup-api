'use client'

import { Box, Container, Grid } from '@devup-ui/react'

const examples = [
  {
    title: 'Installation & Setup',
    code: `// Install for your build tool
npm install @devup-api/fetch @devup-api/vite-plugin

// vite.config.ts
import { defineConfig } from 'vite'
import devupApi from '@devup-api/vite-plugin'

export default defineConfig({
  plugins: [devupApi()],
})`,
  },
  {
    title: 'Basic Usage',
    code: `import { createApi } from '@devup-api/fetch'

const api = createApi('https://api.example.com')

// Use operationId
const users = await api.get('getUsers', {})

// Or use the path directly
const user = await api.get('/users/{id}', {
  params: { id: '123' },
})`,
  },
  {
    title: 'React Query Integration',
    code: `import { createQueryClient } from '@devup-api/react-query'

const queryClient = createQueryClient(api)

function UserProfile({ userId }) {
  const { data, isLoading } = queryClient.useQuery(
    'get',
    '/users/{id}',
    { params: { id: userId } }
  )
  return <div>{data?.name}</div>
}`,
  },
  {
    title: 'Type References',
    code: `import { type DevupObject } from '@devup-api/fetch'

// Access response types
type User = DevupObject['User']
type Product = DevupObject['Product']

// Request types
type CreateUserRequest =
  DevupObject<'request'>['CreateUserBody']`,
  },
]

export default function CodeExamples() {
  return (
    <Box
      as="section"
      py={['2xl', '3xl']}
      bg="#f9fafb"
    >
      <Container maxW="1200px" px="lg">
        <Box
          as="h2"
          textStyle="h2"
          textAlign="center"
          mb="2xl"
        >
          💻 Quick Examples
        </Box>

        <Grid
          gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']}
          gap="xl"
        >
          {examples.map((example, index) => (
            <Box
              key={index}
              bg="#1f2937"
              borderRadius="12px"
              overflow="hidden"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
              <Box
                px="xl"
                py="md"
                bg="rgba(255, 255, 255, 0.05)"
                borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                color="#9ca3af"
                fontSize="0.875rem"
                fontWeight={600}
              >
                {example.title}
              </Box>
              <Box
                as="pre"
                p="xl"
                color="#e5e7eb"
                fontSize="0.875rem"
                lineHeight={1.6}
                fontFamily="Monaco, 'Courier New', monospace"
                overflowX="auto"
                m={0}
              >
                <code>{example.code}</code>
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
