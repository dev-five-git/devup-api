'use client'

import { Box, Flex } from '@devup-ui/react'
import Link from 'next/link'
import { Container } from '../components/Container'

function GetStartedButton() {
  return (
    <Link
      href="https://github.com/dev-five-git/devup-api#-quick-start"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        gap="8px"
        px={['24px', null, '32px']}
        py={['14px', null, '18px']}
        bg="$primary"
        color="white"
        borderRadius="14px"
        fontSize={['15px', null, '17px']}
        fontWeight={600}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow="0 4px 20px 0 rgba(90, 68, 255, 0.35)"
        _hover={{
          bg: '$primaryHover',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 30px 0 rgba(90, 68, 255, 0.45)',
        }}
        _active={{
          transform: 'translateY(-1px)',
        }}
      >
        Get Started
        <Box as="span" fontSize="18px">
          →
        </Box>
      </Box>
    </Link>
  )
}

function GithubButton() {
  return (
    <Link
      href="https://github.com/dev-five-git/devup-api"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        gap="10px"
        px={['24px', null, '32px']}
        py={['14px', null, '18px']}
        bg="$bg"
        color="$title"
        border="2px solid $border"
        borderRadius="14px"
        fontSize={['15px', null, '17px']}
        fontWeight={600}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          bg: '$bgSecondary',
          borderColor: '$primary',
          color: '$primary',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.08)',
        }}
        _active={{
          transform: 'translateY(-1px)',
        }}
      >
        <Box as="svg" w="22px" h="22px" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </Box>
        GitHub
      </Box>
    </Link>
  )
}

function Badge({
  children,
  icon,
}: {
  children: React.ReactNode
  icon: string
}) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px={['14px', null, '18px']}
      py={['8px', null, '10px']}
      bg="rgba(90, 68, 255, 0.08)"
      border="1px solid rgba(90, 68, 255, 0.15)"
      borderRadius="100px"
      fontSize={['13px', null, '14px']}
      fontWeight={500}
      color="$primary"
    >
      <Box as="span">{icon}</Box>
      {children}
    </Box>
  )
}

export default function TopBanner() {
  return (
    <Box
      as="section"
      pos="relative"
      py={['80px', null, '140px']}
      overflow="hidden"
    >
      {/* Background decorations */}
      <Box
        pos="absolute"
        top="-50%"
        left="-20%"
        w="60%"
        h="100%"
        bg="radial-gradient(circle, rgba(90, 68, 255, 0.08) 0%, transparent 70%)"
        zIndex={0}
        pointerEvents="none"
      />
      <Box
        pos="absolute"
        bottom="-30%"
        right="-10%"
        w="50%"
        h="80%"
        bg="radial-gradient(circle, rgba(133, 165, 242, 0.1) 0%, transparent 70%)"
        zIndex={0}
        pointerEvents="none"
      />

      <Container>
        <Flex
          direction="column"
          alignItems="center"
          textAlign="center"
          pos="relative"
          zIndex={1}
        >
          {/* Badges */}
          <Flex
            gap={['8px', null, '12px']}
            mb={['28px', null, '40px']}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Badge icon="🔍">OpenAPI-driven</Badge>
            <Badge icon="🪝">Fetch-compatible</Badge>
            <Badge icon="✨">Zero Generics</Badge>
          </Flex>

          {/* Title */}
          <Box
            as="h1"
            fontSize={['36px', '52px', '68px']}
            fontWeight={800}
            lineHeight={1.1}
            letterSpacing="-0.04em"
            color="$title"
            mb={['20px', null, '28px']}
            maxW="1000px"
          >
            Type-safe API Client
            <Box as="br" display={['none', 'block']} />
            Powered by{' '}
            <Box
              as="span"
              bg="linear-gradient(135deg, #5A44FF 0%, #85A5F2 100%)"
              backgroundClip="text"
              color="transparent"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              OpenAPI
            </Box>
          </Box>

          {/* Description */}
          <Box
            fontSize={['17px', '19px', '21px']}
            lineHeight={1.7}
            color="$textLight"
            mb={['40px', null, '56px']}
            maxW="720px"
            fontWeight={400}
          >
            A fully typed API client generator. Auto-generated types from your
            OpenAPI spec,
            <Box as="br" display={['none', null, 'block']} />
            zero generics required — just write API calls, the types are already
            there.
          </Box>

          {/* CTA Buttons */}
          <Flex
            gap={['12px', null, '20px']}
            flexWrap="wrap"
            justifyContent="center"
            mb={['40px', null, '60px']}
          >
            <GetStartedButton />
            <GithubButton />
          </Flex>

          {/* Install command */}
          <Box
            p={['16px 24px', null, '20px 32px']}
            bg="$codeBg"
            borderRadius="16px"
            fontFamily="D2Coding, Monaco, monospace"
            fontSize={['14px', null, '16px']}
            color="$codeText"
            border="1px solid rgba(255, 255, 255, 0.1)"
            boxShadow="0 4px 24px rgba(0, 0, 0, 0.15)"
          >
            <Box as="span" color="#6B7280" mr="8px">
              $
            </Box>
            <Box as="span" color="#A78BFA">
              npm
            </Box>{' '}
            <Box as="span" color="#9CA3AF">
              install
            </Box>{' '}
            <Box as="span" color="#34D399">
              @devup-api/fetch @devup-api/vite-plugin
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
