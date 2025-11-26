import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Example - devup-api',
  description: 'Example Next.js app with devup-api plugin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
