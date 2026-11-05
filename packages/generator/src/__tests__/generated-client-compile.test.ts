import { describe, test } from 'bun:test'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { DevupApiOptions } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { generateInterface } from '../generate-interface'
import {
  generateServerActionCode,
  generateServerActionTypes,
} from '../generate-server-actions'

const require = createRequire(import.meta.url)
const typescriptManifest = require.resolve('typescript/package.json')
const typescript = JSON.parse(readFileSync(typescriptManifest, 'utf8'))
const compiler = path.resolve(
  path.dirname(typescriptManifest),
  typescript.bin.tsc,
)
// Resolve @devup-api/fetch through its package self-reference in the fixture.
const cacheRoot = path.resolve(import.meta.dirname, '../../../fetch/.cache')

function checkGeneratedClient(options?: DevupApiOptions, operationId = true) {
  const nullable = {
    anyOf: [
      { $ref: '#/components/schemas/ServiceType' },
      { type: 'null' as const },
    ],
  }
  const schemas: Record<string, OpenAPIV3_1.Document> = {
    'openapi.json': {
      openapi: '3.1.0',
      info: { title: 'Nullable request', version: '1.0.0' },
      paths: {
        '/inputs': {
          post: {
            ...(operationId ? { operationId: 'createInput' } : {}),
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Input' },
                },
              },
            },
            responses: { '200': { description: 'Success' } },
          },
        },
      },
      components: {
        schemas: {
          ServiceType: { type: 'string', enum: ['B', 'E'] },
          Input: {
            type: 'object',
            required: ['requiredServiceType', 'nonNullable'],
            properties: {
              serviceType: nullable,
              requiredServiceType: nullable,
              nonNullable: { $ref: '#/components/schemas/ServiceType' },
            },
          },
        },
      },
    },
  }
  mkdirSync(cacheRoot, { recursive: true })
  const directory = mkdtempSync(path.join(cacheRoot, 'generated-client-'))
  const files = {
    'api.d.ts': generateInterface(schemas, options),
    'server.ts': generateServerActionCode(schemas, options),
    'server-module.d.ts': generateServerActionTypes(schemas, options),
    'client.ts': `import { createApi, type DevupObject } from '@devup-api/fetch'
type Input = DevupObject<'request'>['Input']
export const input: Input = { serviceType: null, requiredServiceType: null, nonNullable: 'B' }
export const api = createApi('https://example.invalid')
export function checkTypes() {
  void api.post('/inputs', { body: input })
  void api.post('/inputs', { body: { requiredServiceType: 'E', nonNullable: 'B' } })
  // @ts-expect-error values outside the enum must remain invalid
  const badValue: Input = { ...input, serviceType: 'INVALID' }
  // @ts-expect-error a required nullable field must still be present
  const missing: Input = { nonNullable: 'B' }
  // @ts-expect-error null must remain invalid on non-nullable references
  const badNull: Input = { ...input, nonNullable: null }
  void [badValue, missing, badNull]
}
`,
    'runtime.ts': `import { expect, spyOn } from 'bun:test'
import { api, input } from './client'
const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ ok: true }))
await api.post('/inputs', { body: input })
expect(fetcher).toHaveBeenCalledTimes(1)
const request = fetcher.mock.calls[0]?.[0]
if (!(request instanceof Request)) throw new Error('Expected a Request')
expect(request.url).toBe('https://example.invalid/inputs')
expect(await request.json()).toEqual({ serviceType: null, requiredServiceType: null, nonNullable: 'B' })
fetcher.mockRestore()
`,
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ESNext', 'DOM'],
        types: [],
        strict: true,
        noEmit: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        skipLibCheck: true,
      },
      files: ['api.d.ts', 'client.ts', 'server.ts', 'server-module.d.ts'],
    }),
  }
  try {
    for (const [file, content] of Object.entries(files)) {
      writeFileSync(path.join(directory, file), content)
    }
    for (const command of [
      [
        process.execPath,
        compiler,
        '--project',
        path.join(directory, 'tsconfig.json'),
      ],
      [process.execPath, path.join(directory, 'runtime.ts')],
    ]) {
      const result = Bun.spawnSync(command, { cwd: directory, timeout: 20_000 })
      if (result.exitCode !== 0) {
        throw new Error(
          `${result.stdout.toString()}\n${result.stderr.toString()}`,
        )
      }
    }
  } finally {
    for (const file of Object.keys(files)) {
      const target = path.join(directory, file)
      if (existsSync(target)) unlinkSync(target)
    }
    rmdirSync(directory)
  }
}

describe('generated client compatibility', () => {
  test.each([false, { enabled: false }] as const)(
    'compiles disabled server actions without unused imports: %j',
    (serverActions) => checkGeneratedClient({ serverActions }),
  )

  test('compiles generated actions with only the used method scopes', () => {
    checkGeneratedClient()
  })

  test('compiles an empty action module when operations have no operationId', () => {
    checkGeneratedClient(undefined, false)
  })
})
