'use client'

import { Box, Container, Flex } from '@devup-ui/react'

export default function Hero() {
  return (
    <Box
      as="section"
      bg="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
      color="white"
      py={['3xl', '4xl']}
      textAlign="center"
    >
      <Container maxW="1200px" px="lg">
        <Box
          as="h1"
          textStyle="h1"
          mb="lg"
        >
          Devup API
        </Box>

        <Flex
          justify="center"
          gap="lg"
          mb="lg"
          flexWrap="wrap"
        >
          <Box
            px="xl"
            py="sm"
            bg="rgba(255, 255, 255, 0.2)"
            backdropFilter="blur(10px)"
            borderRadius="50px"
            fontWeight={600}
            fontSize={['0.9rem', '1.1rem']}
          >
            🔍 OpenAPI-driven
          </Box>
          <Box
            px="xl"
            py="sm"
            bg="rgba(255, 255, 255, 0.2)"
            backdropFilter="blur(10px)"
            borderRadius="50px"
            fontWeight={600}
            fontSize={['0.9rem', '1.1rem']}
          >
            🪝 Fetch-compatible
          </Box>
          <Box
            px="xl"
            py="sm"
            bg="rgba(255, 255, 255, 0.2)"
            backdropFilter="blur(10px)"
            borderRadius="50px"
            fontWeight={600}
            fontSize={['0.9rem', '1.1rem']}
          >
            ⚡ Zero Runtime
          </Box>
        </Flex>

        <Box
          textStyle="bodyLarge"
          mb="xl"
          opacity={0.95}
          maxW="800px"
          mx="auto"
        >
          A fully typed API client generator powered by OpenAPI.<br />
          Auto-generated types, zero generics required, just write API calls — the types are already there.
        </Box>

        <Flex
          justify="center"
          gap="md"
          flexWrap="wrap"
        >
          <Box
            as="a"
            href="https://github.com/dev-five-git/devup-api#-quick-start"
            target="_blank"
            rel="noopener noreferrer"
            px="xl"
            py="md"
            bg="white"
            color="#2563eb"
            borderRadius="8px"
            fontWeight={600}
            textDecoration="none"
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }}
          >
            Get Started
          </Box>
          <Box
            as="a"
            href="https://github.com/dev-five-git/devup-api"
            target="_blank"
            rel="noopener noreferrer"
            px="xl"
            py="md"
            bg="transparent"
            color="white"
            border="2px solid white"
            borderRadius="8px"
            fontWeight={600}
            textDecoration="none"
            transition="all 0.3s"
            _hover={{
              bg: 'white',
              color: '#2563eb',
            }}
          >
            View on GitHub
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
