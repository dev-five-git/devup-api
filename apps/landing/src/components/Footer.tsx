'use client'

import { Box, Flex, Grid } from '@devup-ui/react'
import Link from 'next/link'
import { Container } from './Container'
import { GithubIcon } from './icons/GithubIcon'
import { NpmIcon } from './icons/NpmIcon'
import { Logo } from './Logo'

const RESOURCES = [
  {
    label: 'Documentation',
    href: 'https://github.com/dev-five-git/devup-api#readme',
  },
  {
    label: 'Quick Start',
    href: 'https://github.com/dev-five-git/devup-api#-quick-start',
  },
  {
    label: 'Examples',
    href: 'https://github.com/dev-five-git/devup-api/tree/main/examples',
  },
  {
    label: 'Packages',
    href: 'https://github.com/dev-five-git/devup-api#-packages',
  },
]

const COMMUNITY = [
  { label: 'GitHub', href: 'https://github.com/dev-five-git/devup-api' },
  { label: 'Issues', href: 'https://github.com/dev-five-git/devup-api/issues' },
  {
    label: 'Pull Requests',
    href: 'https://github.com/dev-five-git/devup-api/pulls',
  },
  {
    label: 'npm Registry',
    href: 'https://www.npmjs.com/package/@devup-api/fetch',
  },
]

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Box
        color="$textLight"
        fontSize="14px"
        py="6px"
        transition="all 0.2s"
        _hover={{ color: '$primary', transform: 'translateX(4px)' }}
      >
        {label}
      </Box>
    </Link>
  )
}

function FooterSection({
  title,
  links,
}: {
  title: string
  links: typeof RESOURCES
}) {
  return (
    <Box>
      <Box
        fontSize="13px"
        fontWeight={600}
        color="$textMuted"
        textTransform="uppercase"
        letterSpacing="0.05em"
        mb="20px"
      >
        {title}
      </Box>
      <Flex direction="column" gap="4px">
        {links.map((link) => (
          <FooterLink key={link.label} {...link} />
        ))}
      </Flex>
    </Box>
  )
}

function SocialLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="44px"
        h="44px"
        borderRadius="12px"
        bg="$bg"
        color="$textLight"
        border="1px solid $border"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          color: '$primary',
          borderColor: '$primary',
          transform: 'translateY(-3px)',
          boxShadow: '0 4px 12px rgba(90, 68, 255, 0.15)',
        }}
      >
        {children}
      </Box>
    </Link>
  )
}

export function Footer() {
  return (
    <Box
      as="footer"
      bg="$bg"
      borderTop="1px solid $border"
      pt={['60px', null, '80px']}
      pb={['40px', null, '48px']}
    >
      <Container>
        <Grid
          gridTemplateColumns={[
            '1fr',
            null,
            'repeat(2, 1fr)',
            '2.5fr 1fr 1fr 1.5fr',
          ]}
          gap={['40px', null, '48px']}
          mb={['48px', null, '64px']}
        >
          {/* Logo and Description */}
          <Box>
            <Box mb="24px">
              <Logo />
            </Box>
            <Box
              color="$textLight"
              fontSize="15px"
              lineHeight={1.8}
              maxW="320px"
              mb="28px"
            >
              A fully typed API client generator powered by OpenAPI. Zero
              generics, full type safety.
            </Box>

            {/* Social Links */}
            <Flex gap="12px">
              <SocialLink href="https://github.com/dev-five-git/devup-api">
                <GithubIcon size={20} />
              </SocialLink>
              <SocialLink href="https://www.npmjs.com/package/@devup-api/fetch">
                <NpmIcon size={20} />
              </SocialLink>
            </Flex>
          </Box>

          {/* Resources */}
          <FooterSection title="Resources" links={RESOURCES} />

          {/* Community */}
          <FooterSection title="Community" links={COMMUNITY} />

          {/* Company Info */}
          <Box>
            <Box
              fontSize="13px"
              fontWeight={600}
              color="$textMuted"
              textTransform="uppercase"
              letterSpacing="0.05em"
              mb="20px"
            >
              Company
            </Box>
            <Box lineHeight={1.8}>
              <Box color="$title" fontSize="15px" fontWeight={500} mb="12px">
                (주)데브파이브
              </Box>
              <Box fontSize="14px" color="$textLight">
                <Box mb="4px">사업자등록번호: 797-86-00705</Box>
                <Box>경기도 고양시 일산서구 대산로 89, 511-3</Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Bottom Bar */}
        <Box pt={['24px', null, '32px']} borderTop="1px solid $border">
          <Flex
            direction={['column', null, 'row']}
            justifyContent="space-between"
            alignItems={['flex-start', null, 'center']}
            gap="16px"
          >
            <Box fontSize="14px" color="$textLight">
              © 2021-2025 DevFive. All rights reserved.
            </Box>
            <Flex
              gap="8px"
              alignItems="center"
              fontSize="14px"
              color="$textLight"
              flexWrap="wrap"
            >
              <Box
                as="span"
                px="10px"
                py="4px"
                bg="$bgSecondary"
                borderRadius="6px"
                fontSize="13px"
              >
                Apache 2.0
              </Box>
              <span>Inspired by</span>
              <Link
                href="https://github.com/drwpow/openapi-typescript"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Box
                  as="span"
                  color="$primary"
                  fontWeight={500}
                  _hover={{ textDecoration: 'underline' }}
                >
                  openapi-fetch
                </Box>
              </Link>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}
