'use client'

import { Box, Flex, Grid } from '@devup-ui/react'
import { Container } from '../components/Container'

const EXAMPLES = [
  {
    title: 'Installation & Setup',
    icon: '📦',
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
    icon: '🚀',
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
    icon: '⚛️',
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
    icon: '🔷',
    code: `import { type DevupObject } from '@devup-api/fetch'

// Access response types
type User = DevupObject['User']
type Product = DevupObject['Product']

// Request types
type CreateUserRequest =
  DevupObject<'request'>['CreateUserBody']`,
  },
]

function CodeBlock({
  title,
  icon,
  code,
}: {
  title: string
  icon: string
  code: string
}) {
  return (
    <Box
      bg="#0D1117"
      borderRadius="20px"
      overflow="hidden"
      border="1px solid rgba(255, 255, 255, 0.08)"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        border: '1px solid rgba(90, 68, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transform: 'translateY(-4px)',
      }}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        px={['16px', null, '24px']}
        py={['12px', null, '16px']}
        bg="rgba(255, 255, 255, 0.03)"
        borderBottom="1px solid rgba(255, 255, 255, 0.06)"
      >
        <Flex alignItems="center" gap="10px">
          <Box fontSize="16px">{icon}</Box>
          <Box
            fontSize={['13px', null, '15px']}
            fontWeight={600}
            color="#E6EDF3"
          >
            {title}
          </Box>
        </Flex>
        <Flex gap="8px">
          <Box
            w="12px"
            h="12px"
            borderRadius="50%"
            bg="#FF5F57"
            opacity={0.9}
          />
          <Box
            w="12px"
            h="12px"
            borderRadius="50%"
            bg="#FEBC2E"
            opacity={0.9}
          />
          <Box
            w="12px"
            h="12px"
            borderRadius="50%"
            bg="#28C840"
            opacity={0.9}
          />
        </Flex>
      </Flex>
      <Box
        as="pre"
        p={['16px', null, '24px']}
        m={0}
        overflowX="auto"
        fontSize={['12px', null, '14px']}
        lineHeight={1.8}
        fontFamily="D2Coding, 'JetBrains Mono', Monaco, 'Courier New', monospace"
        color="#E6EDF3"
      >
        <code>{code}</code>
      </Box>
    </Box>
  )
}

export default function CodeExamples() {
  return (
    <Box as="section" py={['60px', null, '120px']} bg="$bg" pos="relative">
      {/* Background decoration */}
      <Box
        pos="absolute"
        top="20%"
        right="-10%"
        w="40%"
        h="60%"
        bg="radial-gradient(circle, rgba(90, 68, 255, 0.04) 0%, transparent 70%)"
        zIndex={0}
        pointerEvents="none"
      />

      <Container>
        <Flex
          direction="column"
          alignItems="center"
          gap={['40px', null, '64px']}
          pos="relative"
          zIndex={1}
        >
          {/* Section Header */}
          <Flex
            direction="column"
            alignItems="center"
            gap="20px"
            textAlign="center"
          >
            <Box
              display="inline-flex"
              px="16px"
              py="8px"
              bg="rgba(90, 68, 255, 0.08)"
              borderRadius="100px"
              fontSize="14px"
              fontWeight={600}
              color="$primary"
              mb="8px"
            >
              Examples
            </Box>
            <Box
              as="h2"
              fontSize={['28px', '36px', '44px']}
              fontWeight={800}
              lineHeight={1.2}
              letterSpacing="-0.03em"
              color="$title"
              maxW="600px"
            >
              Get started in minutes
            </Box>
            <Box
              fontSize={['16px', '18px', '20px']}
              lineHeight={1.7}
              color="$textLight"
              maxW="500px"
            >
              Simple, intuitive APIs that feel natural to use
            </Box>
          </Flex>

          {/* Code Examples Grid */}
          <Grid
            gap={['20px', null, '24px']}
            gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)']}
            w="100%"
          >
            {EXAMPLES.map((example) => (
              <CodeBlock key={example.title} {...example} />
            ))}
          </Grid>
        </Flex>
      </Container>
    </Box>
  )
}
