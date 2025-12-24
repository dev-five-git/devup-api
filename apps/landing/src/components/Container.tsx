'use client'

import { Box } from '@devup-ui/react'
import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  maxW?: string
  px?: (string | null)[]
}

export function Container({
  children,
  maxW = '1200px',
  px = ['16px', null, '40px'],
}: ContainerProps) {
  return (
    <Box maxW={maxW} mx="auto" px={px as string[]} w="100%">
      {children}
    </Box>
  )
}
