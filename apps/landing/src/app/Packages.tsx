'use client'

import { Box, Flex, Grid } from '@devup-ui/react'
import Link from 'next/link'
import { Container } from '../components/Container'

const PACKAGES = [
  {
    name: '@devup-api/fetch',
    description: 'Type-safe API client with full TypeScript support',
    npm: 'https://www.npmjs.com/package/@devup-api/fetch',
    icon: '🚀',
    featured: true,
  },
  {
    name: '@devup-api/react-query',
    description: 'TanStack React Query integration with type inference',
    npm: 'https://www.npmjs.com/package/@devup-api/react-query',
    icon: '⚛️',
    featured: true,
  },
  {
    name: '@devup-api/core',
    description: 'Core types and interfaces',
    npm: 'https://www.npmjs.com/package/@devup-api/core',
    icon: '📦',
    featured: false,
  },
  {
    name: '@devup-api/generator',
    description: 'TypeScript interface generator from OpenAPI schemas',
    npm: 'https://www.npmjs.com/package/@devup-api/generator',
    icon: '⚙️',
    featured: false,
  },
  {
    name: '@devup-api/vite-plugin',
    description: 'Vite plugin for automatic type generation',
    npm: 'https://www.npmjs.com/package/@devup-api/vite-plugin',
    icon: '⚡',
    featured: false,
  },
  {
    name: '@devup-api/next-plugin',
    description: 'Next.js plugin for automatic type generation',
    npm: 'https://www.npmjs.com/package/@devup-api/next-plugin',
    icon: '▲',
    featured: false,
  },
  {
    name: '@devup-api/webpack-plugin',
    description: 'Webpack plugin for automatic type generation',
    npm: 'https://www.npmjs.com/package/@devup-api/webpack-plugin',
    icon: '📦',
    featured: false,
  },
  {
    name: '@devup-api/rsbuild-plugin',
    description: 'Rsbuild plugin for automatic type generation',
    npm: 'https://www.npmjs.com/package/@devup-api/rsbuild-plugin',
    icon: '🔧',
    featured: false,
  },
  {
    name: '@devup-api/utils',
    description: 'Utility functions for OpenAPI processing',
    npm: 'https://www.npmjs.com/package/@devup-api/utils',
    icon: '🛠️',
    featured: false,
  },
]

function PackageCard({
  name,
  description,
  npm,
  icon,
  featured,
}: (typeof PACKAGES)[0]) {
  return (
    <Link
      href={npm}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <Flex
        direction="column"
        p={['20px', null, '28px']}
        bg={
          featured
            ? 'linear-gradient(135deg, rgba(90, 68, 255, 0.05) 0%, rgba(133, 165, 242, 0.05) 100%)'
            : '$bg'
        }
        border={
          featured ? '2px solid rgba(90, 68, 255, 0.2)' : '1px solid $border'
        }
        borderRadius="20px"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        h="100%"
        pos="relative"
        overflow="hidden"
        _hover={{
          borderColor: '$primary',
          transform: 'translateY(-6px)',
          boxShadow: featured
            ? '0 16px 40px 0 rgba(90, 68, 255, 0.2)'
            : '0 12px 32px 0 rgba(90, 68, 255, 0.1)',
        }}
      >
        {featured && (
          <Box
            pos="absolute"
            top="12px"
            right="12px"
            px="10px"
            py="4px"
            bg="$primary"
            color="white"
            fontSize="11px"
            fontWeight={600}
            borderRadius="100px"
          >
            Popular
          </Box>
        )}

        <Flex alignItems="center" gap="12px" mb="16px">
          <Box
            w="44px"
            h="44px"
            borderRadius="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="22px"
            bg={featured ? 'rgba(90, 68, 255, 0.1)' : '$bgSecondary'}
          >
            {icon}
          </Box>
          <Box
            fontFamily="D2Coding, Monaco, monospace"
            fontSize={['14px', null, '16px']}
            fontWeight={600}
            color={featured ? '$primary' : '$title'}
            flex={1}
          >
            {name}
          </Box>
        </Flex>

        <Box
          fontSize={['14px', null, '15px']}
          lineHeight={1.7}
          color="$textLight"
        >
          {description}
        </Box>

        <Flex
          alignItems="center"
          gap="6px"
          mt="16px"
          color="$primary"
          fontSize="14px"
          fontWeight={500}
        >
          View on npm
          <Box as="span">→</Box>
        </Flex>
      </Flex>
    </Link>
  )
}

export default function Packages() {
  return (
    <Box
      as="section"
      py={['60px', null, '120px']}
      bg="$bgSecondary"
      id="packages"
    >
      <Container>
        <Flex
          direction="column"
          alignItems="center"
          gap={['40px', null, '64px']}
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
              Packages
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
              Modular & flexible
            </Box>
            <Box
              fontSize={['16px', '18px', '20px']}
              lineHeight={1.7}
              color="$textLight"
              maxW="500px"
            >
              Pick only what you need for your project
            </Box>
          </Flex>

          {/* Packages Grid */}
          <Grid
            gap={['16px', null, '20px']}
            gridTemplateColumns={[
              '1fr',
              null,
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
            ]}
            w="100%"
          >
            {PACKAGES.map((pkg) => (
              <PackageCard key={pkg.name} {...pkg} />
            ))}
          </Grid>
        </Flex>
      </Container>
    </Box>
  )
}
