import type { Metadata } from 'next'
import '@devup-ui/reset-css'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export const metadata: Metadata = {
  title: 'Devup API - Type-safe API Client Powered by OpenAPI',
  description:
    'A fully typed API client generator powered by OpenAPI. Fetch-compatible, auto-generated types, zero generics required.',
  keywords: [
    'API',
    'OpenAPI',
    'TypeScript',
    'Type-safe',
    'Fetch',
    'React',
    'Next.js',
    'React Query',
  ],
  authors: [{ name: 'DevFive' }],
  openGraph: {
    title: 'Devup API - Type-safe API Client Powered by OpenAPI',
    description:
      'A fully typed API client generator powered by OpenAPI. Fetch-compatible, auto-generated types, zero generics required.',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/Joungkyun/font-d2coding/d2coding.css"
        />
      </head>
      <body
        style={{
          fontFamily:
            'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          margin: 0,
          padding: 0,
          backgroundColor: 'var(--colors-bg)',
          color: 'var(--colors-text)',
        }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
