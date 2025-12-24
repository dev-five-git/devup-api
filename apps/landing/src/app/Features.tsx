'use client'

import { Box, Flex, Grid } from '@devup-ui/react'
import { Container } from '../components/Container'

const FEATURES = [
  {
    icon: '🔍',
    title: 'OpenAPI-driven Types',
    desc: 'Reads openapi.json and transforms every path, method, schema into typed API functions. Parameters, request bodies, headers, responses — all typed automatically.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🪝',
    title: 'Fetch-compatible Design',
    desc: 'Feels like using fetch, but with superpowers. Path params automatically replaced, query/body/header types enforced, typed success & error responses.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    icon: '⚡',
    title: 'Build Tool Integration',
    desc: 'Works seamlessly with Vite, Next.js, Webpack, and Rsbuild. Automatic type generation during build time with zero runtime overhead.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    icon: '🔄',
    title: 'React Query Support',
    desc: 'First-class integration with TanStack React Query. Use useQuery, useMutation, useInfiniteQuery with full type safety.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    icon: '🌐',
    title: 'Multiple API Servers',
    desc: 'Support for multiple OpenAPI schemas. Work with different API servers simultaneously with isolated type generation.',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    icon: '🛡️',
    title: 'Complete Type Safety',
    desc: 'Cold typing for initial development, bold typing for production. Gradual type enforcement ensures smooth developer experience.',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
]

function FeatureCard({ icon, title, desc, gradient }: (typeof FEATURES)[0]) {
  return (
    <Flex
      direction="column"
      gap="20px"
      p={['24px', null, '32px']}
      bg="$bg"
      border="1px solid $border"
      borderRadius="24px"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      h="100%"
      pos="relative"
      overflow="hidden"
      _hover={{
        borderColor: '$primary',
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px 0 rgba(90, 68, 255, 0.12)',
      }}
    >
      {/* Icon with gradient background */}
      <Box
        w="56px"
        h="56px"
        borderRadius="16px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="28px"
        bg={gradient}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
      >
        {icon}
      </Box>

      <Flex direction="column" gap="12px">
        <Box
          as="h3"
          fontSize={['17px', '18px', '20px']}
          fontWeight={700}
          lineHeight={1.4}
          color="$title"
          letterSpacing="-0.02em"
        >
          {title}
        </Box>
        <Box
          fontSize={['14px', '15px', '16px']}
          lineHeight={1.7}
          color="$textLight"
        >
          {desc}
        </Box>
      </Flex>
    </Flex>
  )
}

export default function Features() {
  return (
    <Box as="section" py={['60px', null, '120px']} bg="$bgSecondary">
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
              Features
            </Box>
            <Box
              as="h2"
              fontSize={['28px', '36px', '44px']}
              fontWeight={800}
              lineHeight={1.2}
              letterSpacing="-0.03em"
              color="$title"
              maxW="700px"
            >
              Everything you need for
              <Box as="br" display={['none', 'block']} />
              type-safe API calls
            </Box>
            <Box
              fontSize={['16px', '18px', '20px']}
              lineHeight={1.7}
              color="$textLight"
              maxW="600px"
            >
              Devup API offers powerful features for building type-safe API
              clients with zero configuration.
            </Box>
          </Flex>

          {/* Features Grid */}
          <Grid
            gap={['16px', null, '24px']}
            gridTemplateColumns={[
              '1fr',
              null,
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
            ]}
            w="100%"
          >
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </Grid>
        </Flex>
      </Container>
    </Box>
  )
}
