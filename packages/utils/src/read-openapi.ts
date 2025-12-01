import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import type { OpenAPIV3_1 } from 'openapi-types'

/**
 * Normalizes openapiFiles to always return a non-empty array
 * @param openapiFiles OpenAPI file paths (string, string[], or undefined)
 * @returns Normalized array of OpenAPI file paths (defaults to ['openapi.json'])
 */
export function normalizeOpenapiFiles(
  openapiFiles?: string[] | string,
): string[] {
  if (!openapiFiles) {
    return ['openapi.json']
  }
  if (Array.isArray(openapiFiles)) {
    return openapiFiles.length > 0 ? openapiFiles : ['openapi.json']
  }
  return [openapiFiles]
}

function normalizeServerName(serverName: string): string {
  return serverName.replace(/^\.\//, '')
}

/**
 * Synchronous function that reads the OpenAPI files
 * @param openapiFiles OpenAPI file paths
 * @returns Record of OpenAPI documents keyed by file path
 */
export function readOpenapis(
  openapiFiles: string[],
): Record<string, OpenAPIV3_1.Document> {
  return openapiFiles.reduce(
    (acc, openapiFile) => {
      acc[normalizeServerName(openapiFile)] = JSON.parse(
        readFileSync(openapiFile, 'utf8'),
      )
      return acc
    },
    {} as Record<string, OpenAPIV3_1.Document>,
  )
}

/**
 * Async function that reads the OpenAPI files
 * @param openapiFiles OpenAPI file paths
 * @returns Promise that resolves to a Record of OpenAPI documents keyed by file path
 */
export async function readOpenapiAsync(
  openapiFiles: string[],
): Promise<Record<string, OpenAPIV3_1.Document>> {
  const result = await Promise.all(
    openapiFiles.map(async (openapiFile) => {
      return [
        normalizeServerName(openapiFile),
        JSON.parse(await readFile(openapiFile, 'utf8')) as OpenAPIV3_1.Document,
      ]
    }),
  )
  return Object.fromEntries(result)
}
