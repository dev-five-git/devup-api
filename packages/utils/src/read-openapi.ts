import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import type { OpenAPIV3_1 } from 'openapi-types'

/**
 * Synchronous function that reads the OpenAPI file
 * @param openapiFile OpenAPI file path
 * @returns OpenAPI document
 */
export function readOpenapi(
  openapiFile: string = 'openapi.json',
): OpenAPIV3_1.Document {
  const file = readFileSync(openapiFile, 'utf8')
  return JSON.parse(file)
}

/**
 * Async function that reads the OpenAPI file
 * @param openapiFile OpenAPI file path
 * @returns Promise that resolves to the OpenAPI document
 */
export async function readOpenapiAsync(
  openapiFile: string = 'openapi.json',
): Promise<OpenAPIV3_1.Document> {
  const file = await readFile(openapiFile, 'utf8')
  return JSON.parse(file)
}
