import type { DevupApiOptions } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { convertCase } from './convert-case'

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

type ServerActionOperation = {
  actionName: string
  method: HttpMethod
  operationId: string
  serverName: string
  apiVariableName: string
}

function isServerActionsEnabled(options?: DevupApiOptions): boolean {
  const serverActions = options?.serverActions
  if (typeof serverActions === 'boolean') return serverActions
  if (!serverActions) return true
  return serverActions.enabled !== false
}

function getServerActionsBaseUrl(options?: DevupApiOptions): string {
  const serverActions = options?.serverActions
  if (typeof serverActions === 'object') return serverActions.baseUrl ?? ''
  return ''
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function toIdentifier(value: string): string {
  const identifier = value.replace(/[^a-zA-Z0-9_$]/g, '_')
  return /^[a-zA-Z_$]/.test(identifier) ? identifier : `_${identifier}`
}

function toApiVariableName(serverName: string, index: number): string {
  if (index === 0) return 'api'
  return toIdentifier(`${convertCase(serverName, 'camel')}Api`)
}

function getMethodScopeType(method: HttpMethod): string {
  const pascal = `${method[0]?.toUpperCase()}${method.slice(1)}`
  return `Devup${pascal}ApiStructScope`
}

function collectOperations(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiOptions,
): ServerActionOperation[] {
  const convertCaseType = options?.convertCase ?? 'camel'
  const operations: ServerActionOperation[] = []
  const usedActionNames = new Set<string>()
  let serverIndex = 0

  for (const [serverName, schema] of Object.entries(schemas)) {
    const apiVariableName = toApiVariableName(serverName, serverIndex)
    serverIndex += 1

    for (const pathItem of Object.values(schema.paths ?? {})) {
      if (!pathItem) continue
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const operation = pathItem[method]
        if (!operation?.operationId) continue

        const rawActionName = toIdentifier(
          convertCase(operation.operationId, convertCaseType),
        )
        const actionName = usedActionNames.has(rawActionName)
          ? toIdentifier(`${convertCase(serverName, 'camel')}_${rawActionName}`)
          : rawActionName
        usedActionNames.add(actionName)

        operations.push({
          actionName,
          method,
          operationId: rawActionName,
          serverName,
          apiVariableName,
        })
      }
    }
  }

  return operations
}

function generateApiDeclarations(
  operations: ServerActionOperation[],
  options?: DevupApiOptions,
): string {
  const baseUrl = getServerActionsBaseUrl(options)
  const serverNames = [
    ...new Set(operations.map((operation) => operation.serverName)),
  ]

  return serverNames
    .map((serverName, index) => {
      const apiVariableName = toApiVariableName(serverName, index)
      const serverNameProperty =
        serverName === 'openapi.json'
          ? ''
          : `, serverName: ${quote(serverName)}`
      return `const ${apiVariableName} = createApi({ baseUrl: ${quote(baseUrl)}${serverNameProperty} })`
    })
    .join('\n')
}

function generateAction(operation: ServerActionOperation): string {
  const scopeType = `${operation.actionName}Scope`
  const methodScopeType = getMethodScopeType(operation.method)
  return `type ${scopeType} = Additional<${quote(operation.operationId)}, ${methodScopeType}<${quote(operation.serverName)}>>

export async function ${operation.actionName}(
  ...options: ApiOption<${scopeType}>
): Promise<DevupApiResponse<ExtractValue<${scopeType}, 'response'>, ExtractValue<${scopeType}, 'error'>, SerializedResponse>> {
  return serializeApiResponse(await ${operation.apiVariableName}.${operation.method}(${quote(operation.operationId)}, ...options))
}`
}

function generateActionDeclaration(operation: ServerActionOperation): string {
  const scopeType = `${operation.actionName}Scope`
  const methodScopeType = getMethodScopeType(operation.method)
  return `type ${scopeType} = Additional<${quote(operation.operationId)}, ${methodScopeType}<${quote(operation.serverName)}>>
  export function ${operation.actionName}(
    ...options: ApiOption<${scopeType}>
  ): Promise<DevupApiResponse<ExtractValue<${scopeType}, 'response'>, ExtractValue<${scopeType}, 'error'>, SerializedResponse>>`
}

export function generateServerActionCode(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiOptions,
): string {
  const operations = isServerActionsEnabled(options)
    ? collectOperations(schemas, options)
    : []
  const apiDeclarations = generateApiDeclarations(operations, options)
  const actions = operations.map(generateAction).join('\n\n')

  return `// Auto-generated Server Actions from OpenAPI specs
// Do not edit this file directly
'use server'

import type {
  Additional,
  ApiOption,
  ExtractValue,
  DevupDeleteApiStructScope,
  DevupGetApiStructScope,
  DevupPatchApiStructScope,
  DevupPostApiStructScope,
  DevupPutApiStructScope,
  DevupApiResponse,
  SerializedResponse,
} from '@devup-api/fetch'
import { createApi } from '@devup-api/fetch'
import { serializeApiResponse } from '@devup-api/fetch'

${apiDeclarations}

${actions}
`
}

export function generateServerActionTypes(
  schemas: Record<string, OpenAPIV3_1.Document>,
  options?: DevupApiOptions,
): string {
  const operations = isServerActionsEnabled(options)
    ? collectOperations(schemas, options)
    : []
  const declarations = operations.map(generateActionDeclaration).join('\n\n')

  return `// Auto-generated Server Action types from OpenAPI specs
// Do not edit this file directly

declare module '@devup-api/fetch/server-generated' {
  import type {
    Additional,
    ApiOption,
    ExtractValue,
    DevupDeleteApiStructScope,
    DevupGetApiStructScope,
    DevupPatchApiStructScope,
    DevupPostApiStructScope,
    DevupPutApiStructScope,
    DevupApiResponse,
    SerializedResponse,
  } from '@devup-api/fetch'

  ${declarations}
}
`
}
