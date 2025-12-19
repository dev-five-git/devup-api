'use client'

import Link from 'next/link'
import { Box, Container, Grid, Flex } from '@devup-ui/react'

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="#1f2937"
      color="white"
      py={['2xl', '3xl']}
    >
      <Container maxW="1200px" px="lg">
        <Grid
          gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
          gap="xl"
          mb="xl"
        >
          <Box>
            <Box
              as="h3"
              fontSize="1.2rem"
              fontWeight={600}
              mb="md"
            >
              Devup API
            </Box>
            <Box color="#9ca3af" lineHeight={1.8}>
              A fully typed API client generator powered by OpenAPI.
              Fetch-compatible, auto-generated types, zero generics required.
            </Box>
          </Box>

          <Box>
            <Box
              as="h3"
              fontSize="1.2rem"
              fontWeight={600}
              mb="md"
            >
              Resources
            </Box>
            <Flex direction="column" gap="sm">
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api#readme"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Documentation
              </Box>
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api#-quick-start"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Quick Start
              </Box>
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api/tree/main/examples"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Examples
              </Box>
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api#-packages"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Packages
              </Box>
            </Flex>
          </Box>

          <Box>
            <Box
              as="h3"
              fontSize="1.2rem"
              fontWeight={600}
              mb="md"
            >
              Community
            </Box>
            <Flex direction="column" gap="sm">
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                GitHub
              </Box>
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api/issues"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Issues
              </Box>
              <Box
                as={Link}
                href="https://github.com/dev-five-git/devup-api/pulls"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                Pull Requests
              </Box>
              <Box
                as={Link}
                href="https://www.npmjs.com/package/@devup-api/fetch"
                target="_blank"
                rel="noopener noreferrer"
                color="#9ca3af"
                textDecoration="none"
                transition="color 0.3s"
                _hover={{ color: 'white' }}
              >
                npm
              </Box>
            </Flex>
          </Box>

          <Box>
            <Box
              as="h3"
              fontSize="1.2rem"
              fontWeight={600}
              mb="md"
            >
              Company
            </Box>
            <Box lineHeight={1.8}>
              <Box mb="sm">데브파이브 (DevFive)</Box>
              <Box fontSize="0.85rem" color="#6b7280">
                사업자등록번호: 797-86-00705<br />
                경기도 고양시 일산서구 대산로 89, 511-3<br />
                © 2021-2024 DevFive. All rights reserved.
              </Box>
            </Box>
          </Box>
        </Grid>

        <Box
          pt="xl"
          borderTop="1px solid rgba(255, 255, 255, 0.1)"
          textAlign="center"
          color="#9ca3af"
          fontSize="0.9rem"
        >
          <Box>
            Licensed under Apache 2.0 | Inspired by{' '}
            <Box
              as={Link}
              href="https://github.com/drwpow/openapi-typescript"
              target="_blank"
              rel="noopener noreferrer"
              color="#60a5fa"
              textDecoration="none"
              _hover={{ textDecoration: 'underline' }}
            >
              openapi-fetch
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
