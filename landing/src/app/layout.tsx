import type { Metadata } from 'next'
import '@devup-ui/reset'

export const metadata: Metadata = {
  title: 'Devup API - OpenAPI-driven Type-safe API Client',
  description: 'A fully typed API client generator powered by OpenAPI. Fetch-compatible, auto-generated types, zero generics required.',
  keywords: ['API', 'OpenAPI', 'TypeScript', 'Type-safe', 'Fetch', 'React', 'Next.js'],
  authors: [{ name: 'DevFive' }],
  openGraph: {
    title: 'Devup API - OpenAPI-driven Type-safe API Client',
    description: 'A fully typed API client generator powered by OpenAPI.',
    type: 'website',
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
      </head>
      <body style={{ fontFamily: 'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
