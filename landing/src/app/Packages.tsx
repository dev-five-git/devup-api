'use client'

import { Box, Container, Grid } from '@devup-ui/react'

const packages = [
  { name: '@devup-api/core', description: 'Core types and interfaces' },
  { name: '@devup-api/utils', description: 'Utility functions for OpenAPI processing' },
  { name: '@devup-api/generator', description: 'TypeScript interface generator from OpenAPI schemas' },
  { name: '@devup-api/fetch', description: 'Type-safe API client' },
  { name: '@devup-api/react-query', description: 'TanStack React Query integration' },
  { name: '@devup-api/vite-plugin', description: 'Vite plugin for automatic type generation' },
  { name: '@devup-api/next-plugin', description: 'Next.js plugin for automatic type generation' },
  { name: '@devup-api/webpack-plugin', description: 'Webpack plugin for automatic type generation' },
  { name: '@devup-api/rsbuild-plugin', description: 'Rsbuild plugin for automatic type generation' },
]

export default function Packages() {
  return (
    <Box
      as="section"
      py={['2xl', '3xl']}
      bg="white"
      id="packages"
    >
      <Container maxW="1200px" px="lg">
        <Box
          as="h2"
          textStyle="h2"
          textAlign="center"
          mb="2xl"
        >
          📦 Packages
        </Box>

        <Grid
          gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          gap="lg"
        >
          {packages.map((pkg, index) => (
            <Box
              key={index}
              p="xl"
              bg="#f9fafb"
              borderRadius="10px"
              borderLeft="4px solid #2563eb"
              transition="all 0.3s"
              _hover={{
                transform: 'translateX(5px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                fontFamily="Monaco, 'Courier New', monospace"
                fontWeight={600}
                color="#2563eb"
                mb="sm"
                fontSize="1rem"
              >
                {pkg.name}
              </Box>
              <Box
                color="#6b7280"
                fontSize="0.9rem"
              >
                {pkg.description}
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
