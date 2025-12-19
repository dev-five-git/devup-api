'use client'

import { Box, Container, Grid } from '@devup-ui/react'

const features = [
  {
    icon: '🔍',
    title: 'OpenAPI-driven Types',
    description: 'Reads openapi.json and transforms every path, method, schema into typed API functions. Parameters, request bodies, headers, responses — all typed automatically.',
  },
  {
    icon: '🪝',
    title: 'Fetch-compatible Design',
    description: 'Feels like using fetch, but with superpowers. Path params automatically replaced, query/body/header types enforced, typed success & error responses.',
  },
  {
    icon: '⚡',
    title: 'Build Tool Integration',
    description: 'Works seamlessly with Vite, Next.js, Webpack, and Rsbuild. Automatic type generation during build time with zero runtime overhead.',
  },
  {
    icon: '🔄',
    title: 'React Query Support',
    description: 'First-class integration with TanStack React Query. Use useQuery, useMutation, useInfiniteQuery with full type safety.',
  },
  {
    icon: '🌐',
    title: 'Multiple API Servers',
    description: 'Support for multiple OpenAPI schemas. Work with different API servers simultaneously with isolated type generation.',
  },
  {
    icon: '🛡️',
    title: 'Type Safety',
    description: 'Cold typing for initial development, bold typing for production. Gradual type enforcement ensures smooth developer experience.',
  },
]

export default function Features() {
  return (
    <Box
      as="section"
      py={['2xl', '3xl']}
      bg="white"
    >
      <Container maxW="1200px" px="lg">
        <Box
          as="h2"
          textStyle="h2"
          textAlign="center"
          mb="2xl"
        >
          ✨ Features
        </Box>

        <Grid
          gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          gap="xl"
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              p="xl"
              bg="#f9fafb"
              borderRadius="12px"
              border="1px solid #e5e7eb"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                borderColor: '#2563eb',
              }}
            >
              <Box fontSize="2.5rem" mb="md">
                {feature.icon}
              </Box>
              <Box
                as="h3"
                textStyle="h3"
                mb="sm"
              >
                {feature.title}
              </Box>
              <Box
                color="#6b7280"
                textStyle="body"
              >
                {feature.description}
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
