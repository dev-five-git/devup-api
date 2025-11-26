'use client'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Next.js Example (Webpack)</h1>
        <p className="mb-4">
          This example uses Next.js with Webpack and devup-api plugin.
        </p>
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <p className="font-semibold mb-2">Environment Variables:</p>
          <pre className="text-xs overflow-auto">
            {(() => {
              try {
                const urlMap = process.env.DEVUP_API_URL_MAP
                if (!urlMap) return 'Not available'
                const parsed =
                  typeof urlMap === 'string' ? JSON.parse(urlMap) : urlMap
                return JSON.stringify(parsed, null, 2)
              } catch {
                return 'Error parsing URL map'
              }
            })()}
          </pre>
        </div>
      </div>
    </main>
  )
}
