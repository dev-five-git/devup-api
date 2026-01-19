import type { OpenAPIV3_1 } from 'openapi-types'
import type { CrudConfig, CrudField } from './crud-types'
import { parseCrudConfigsFromMultiple } from './parse-crud-tags'
import { wrapInterfaceKeyGuard } from './wrap-interface-key-guard'

/**
 * Convert string to PascalCase for component names
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Convert string to title case for labels
 */
function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get input type from field type and format
 */
function getInputType(field: CrudField): string {
  if (field.format === 'email') return 'email'
  if (field.format === 'uri' || field.format === 'url') return 'url'
  if (field.format === 'date') return 'date'
  if (field.format === 'date-time') return 'datetime-local'
  if (field.format === 'time') return 'time'
  if (field.format === 'password') return 'password'
  if (field.type === 'number' || field.type === 'integer') return 'number'
  return 'text'
}

/**
 * Generate register options for a field
 */
function generateRegisterOptions(field: CrudField): string {
  const options: string[] = []

  if (field.required) options.push('required: true')
  if (field.minLength !== undefined)
    options.push(`minLength: ${field.minLength}`)
  if (field.maxLength !== undefined)
    options.push(`maxLength: ${field.maxLength}`)
  if (field.minimum !== undefined) options.push(`min: ${field.minimum}`)
  if (field.maximum !== undefined) options.push(`max: ${field.maximum}`)
  if (field.pattern) options.push(`pattern: /${field.pattern}/`)
  if (field.type === 'number' || field.type === 'integer') {
    options.push('valueAsNumber: true')
  }

  return options.length > 0 ? `{ ${options.join(', ')} }` : ''
}

/**
 * Generate JSX for a single field using useFormContext
 */
function generateFieldJsx(field: CrudField, indent: string): string[] {
  const lines: string[] = []
  const inputType = getInputType(field)
  const label = toTitleCase(field.name)
  const registerOpts = generateRegisterOptions(field)
  const registerCall = registerOpts
    ? `register('${field.name}', ${registerOpts})`
    : `register('${field.name}')`

  // Handle select for enum fields
  if (field.enum && field.enum.length > 0) {
    lines.push(`${indent}<div>`)
    lines.push(`${indent}  <label htmlFor="${field.name}">${label}</label>`)
    lines.push(`${indent}  <select id="${field.name}" {...${registerCall}}>`)
    lines.push(`${indent}    <option value="">Select...</option>`)
    for (const value of field.enum) {
      lines.push(
        `${indent}    <option value="${value}">${toTitleCase(value)}</option>`,
      )
    }
    lines.push(`${indent}  </select>`)
    lines.push(`${indent}  {errors.${field.name} && <span>Invalid</span>}`)
    lines.push(`${indent}</div>`)
    return lines
  }

  // Handle boolean as checkbox
  if (field.type === 'boolean') {
    lines.push(`${indent}<div>`)
    lines.push(`${indent}  <label>`)
    lines.push(`${indent}    <input type="checkbox" {...${registerCall}} />`)
    lines.push(`${indent}    ${label}`)
    lines.push(`${indent}  </label>`)
    lines.push(`${indent}  {errors.${field.name} && <span>Invalid</span>}`)
    lines.push(`${indent}</div>`)
    return lines
  }

  // Default input
  lines.push(`${indent}<div>`)
  lines.push(`${indent}  <label htmlFor="${field.name}">${label}</label>`)
  lines.push(`${indent}  <input`)
  lines.push(`${indent}    id="${field.name}"`)
  lines.push(`${indent}    type="${inputType}"`)
  lines.push(`${indent}    {...${registerCall}}`)
  if (field.description) {
    lines.push(`${indent}    placeholder="${field.description}"`)
  }
  lines.push(`${indent}  />`)
  lines.push(
    `${indent}  {errors.${field.name} && <span>${field.required ? 'Required' : 'Invalid'}</span>}`,
  )
  lines.push(`${indent}</div>`)

  return lines
}

/**
 * Generate the Fields component for a CRUD group
 */
function generateFieldsComponent(
  componentName: string,
  fields: CrudField[],
): string[] {
  const lines: string[] = []
  const fieldsComponentName = `${componentName}Fields`

  lines.push(`function ${fieldsComponentName}() {`)
  lines.push(`  const { register, formState: { errors } } = useFormContext();`)
  lines.push('')
  lines.push('  return (')
  lines.push('    <>')

  // Generate fields
  if (fields.length > 0) {
    for (const field of fields) {
      const fieldLines = generateFieldJsx(field, '      ')
      lines.push(...fieldLines)
    }
  } else {
    lines.push('      {/* No fields defined in OpenAPI schema */}')
  }

  // Submit button
  lines.push('')
  lines.push('      <button type="submit">Submit</button>')
  lines.push('    </>')
  lines.push('  );')
  lines.push('}')

  return lines
}

/**
 * Generate the main CRUD component using ApiForm
 */
function generateCrudComponent(name: string, config: CrudConfig): string[] {
  const lines: string[] = []
  const componentName = `${toPascalCase(name)}Crud`
  const fieldsComponentName = `${componentName}Fields`

  // Determine edit method and operationId
  const editEndpoint = config.edit ?? config.fix
  const editMethod = editEndpoint?.method ?? 'put'
  const editOperationId = editEndpoint?.operationId

  lines.push(`export function ${componentName}({`)
  lines.push('  apiClient,')
  lines.push('  params,')
  lines.push('  onSuccess,')
  lines.push('  onError,')
  lines.push('}) {')
  lines.push('  const isEdit = !!params;')
  lines.push('')

  // Build ApiForm props dynamically
  lines.push('  return (')
  lines.push('    <ApiForm')
  lines.push('      api={apiClient}')
  lines.push(`      method={isEdit ? '${editMethod}' : 'post'}`)

  // Path uses operationId
  if (editOperationId) {
    lines.push(
      `      path={isEdit ? '${editOperationId}' : '${config.create.operationId}'}`,
    )
  } else {
    lines.push(`      path={'${config.create.operationId}'}`)
  }

  lines.push('      requestOptions={isEdit ? { params } : undefined}')

  // Fetch default values for edit mode
  lines.push('      fetchDefaultValues={isEdit ? {')
  lines.push(`        path: '${config.one.operationId}',`)
  lines.push('        options: { params },')
  lines.push('      } : undefined}')

  lines.push('      onSuccess={onSuccess}')
  lines.push('      onError={onError}')
  lines.push('    >')
  lines.push(`      <${fieldsComponentName} />`)
  lines.push('    </ApiForm>')
  lines.push('  );')
  lines.push('}')

  return lines
}

/**
 * Generate the virtual module code for CRUD components with full UI
 */
export function generateCrudConfigCode(
  schemas: Record<string, OpenAPIV3_1.Document>,
): string {
  const configs = parseCrudConfigsFromMultiple(schemas)

  const lines: string[] = []

  // Header
  lines.push('// Auto-generated CRUD components from OpenAPI specs')
  lines.push('// Do not edit this file directly')
  lines.push("'use client';")
  lines.push('')

  // Imports - use @devup-api/hookform
  lines.push("import { ApiForm, useFormContext } from '@devup-api/hookform';")
  lines.push('')

  // Generate component for each CRUD group
  for (const [name, config] of Object.entries(configs)) {
    const componentName = `${toPascalCase(name)}Crud`

    // Get fields from create endpoint (primary form fields)
    const fields = config.create.fields ?? []

    lines.push(`// ============================================`)
    lines.push(`// ${componentName}`)
    lines.push(`// ============================================`)
    lines.push('')

    // Generate Fields component
    const fieldsLines = generateFieldsComponent(componentName, fields)
    lines.push(...fieldsLines)
    lines.push('')

    // Generate main CRUD component
    const componentLines = generateCrudComponent(name, config)
    lines.push(...componentLines)
    lines.push('')
  }

  // Default export
  lines.push('export default {')
  for (const name of Object.keys(configs)) {
    const componentName = `${toPascalCase(name)}Crud`
    lines.push(`  ${name}: ${componentName},`)
  }
  lines.push('};')

  return lines.join('\n')
}

/**
 * Generate TypeScript type declarations for CRUD components
 * Uses module augmentation to extend DevupCrudApiNames in @devup-api/ui
 */
export function generateCrudConfigTypes(
  schemas: Record<string, OpenAPIV3_1.Document>,
): string {
  const configs = parseCrudConfigsFromMultiple(schemas)
  const apiNames = Object.keys(configs)

  const lines: string[] = []

  lines.push("import '@devup-api/ui'")
  lines.push('')

  // Module augmentation for DevupCrudApiNames
  if (apiNames.length > 0) {
    lines.push("declare module '@devup-api/ui' {")
    lines.push('  interface DevupCrudApiNames {')
    for (const name of apiNames) {
      lines.push(`    ${wrapInterfaceKeyGuard(name)}: true`)
    }
    lines.push('  }')
    lines.push('}')
    lines.push('')
  }

  // Virtual module declaration
  lines.push("declare module '@devup-api/ui/crud' {")
  lines.push("  import type { CrudComponents } from '@devup-api/ui'")
  lines.push('')
  lines.push('  const crudComponents: CrudComponents')
  lines.push('  export default crudComponents')
  lines.push('}')

  return lines.join('\n')
}
