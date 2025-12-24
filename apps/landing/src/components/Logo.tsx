'use client'

import { Box, Flex } from '@devup-ui/react'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Flex alignItems="center" gap={['8px', null, '12px']}>
        <Box
          as="svg"
          w={['28px', null, '36px']}
          h={['28px', null, '36px']}
          viewBox="0 0 100 100"
          fill="none"
        >
          <rect width="100" height="100" rx="20" fill="#5A44FF" />
          <path d="M25 30h50v10H35v15h35v10H35v15h40v10H25V30z" fill="white" />
        </Box>
        <Flex alignItems="baseline" gap="4px">
          <Box
            color="$title"
            fontSize={['18px', null, '22px']}
            fontWeight={700}
            letterSpacing="-0.03em"
          >
            Devup
          </Box>
          <Box
            color="$primary"
            fontSize={['18px', null, '22px']}
            fontWeight={700}
            letterSpacing="-0.03em"
          >
            API
          </Box>
        </Flex>
      </Flex>
    </Link>
  )
}
