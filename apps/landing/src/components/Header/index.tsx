'use client'

import { Box, Flex } from '@devup-ui/react'
import Link from 'next/link'
import { Container } from '../Container'
import { GithubIcon } from '../icons/GithubIcon'
import { NpmIcon } from '../icons/NpmIcon'
import { Logo } from '../Logo'

function HeaderIconWrap({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
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
        w="40px"
        h="40px"
        borderRadius="12px"
        color="$textLight"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          color: '$primary',
          bg: 'rgba(90, 68, 255, 0.08)',
          transform: 'translateY(-2px)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
      >
        {children}
      </Box>
    </Link>
  )
}

function NavLink({
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
        color="$textLight"
        fontSize="15px"
        fontWeight={500}
        px="12px"
        py="8px"
        borderRadius="8px"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          color: '$primary',
          bg: 'rgba(90, 68, 255, 0.06)',
        }}
      >
        {children}
      </Box>
    </Link>
  )
}

function GetStartedButton() {
  return (
    <Link
      href="https://github.com/dev-five-git/devup-api#-quick-start"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        px="20px"
        py="10px"
        bg="$primary"
        color="white"
        borderRadius="10px"
        fontSize="14px"
        fontWeight={600}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow="0 2px 8px rgba(90, 68, 255, 0.25)"
        _hover={{
          bg: '$primaryHover',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(90, 68, 255, 0.35)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
      >
        Get Started
      </Box>
    </Link>
  )
}

export function Header() {
  return (
    <Box
      as="header"
      pos="sticky"
      top={0}
      zIndex={100}
      bg="rgba(255, 255, 255, 0.8)"
      borderBottom="1px solid rgba(0, 0, 0, 0.06)"
      backdropFilter="blur(20px)"
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <Container>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          h={['60px', null, '76px']}
        >
          <Logo />

          <Flex alignItems="center" gap={['8px', null, '16px']}>
            {/* Navigation */}
            <Flex
              as="nav"
              alignItems="center"
              gap="4px"
              display={['none', null, 'flex']}
            >
              <NavLink href="https://github.com/dev-five-git/devup-api#readme">
                Docs
              </NavLink>
              <NavLink href="#packages">Packages</NavLink>
            </Flex>

            {/* Divider */}
            <Box
              w="1px"
              h="24px"
              bg="$border"
              mx="8px"
              display={['none', null, 'block']}
            />

            {/* Icons */}
            <Flex alignItems="center" gap="4px">
              <HeaderIconWrap href="https://github.com/dev-five-git/devup-api">
                <GithubIcon size={20} />
              </HeaderIconWrap>
              <HeaderIconWrap href="https://www.npmjs.com/package/@devup-api/fetch">
                <NpmIcon size={20} />
              </HeaderIconWrap>
            </Flex>

            {/* CTA Button */}
            <Box display={['none', null, 'block']} ml="8px">
              <GetStartedButton />
            </Box>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
