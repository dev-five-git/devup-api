import { toCamel, toPascal, toSnake } from '@devup-api/utils'

/**
 * Convert string based on convertCase option
 */
export function convertCase(
  str: string,
  caseType: 'snake' | 'camel' | 'pascal' | 'maintain' = 'camel',
): string {
  switch (caseType) {
    case 'snake':
      return toSnake(str)
    case 'camel':
      return toCamel(str)
    case 'pascal':
      return toPascal(str)
    case 'maintain':
      return str
    default:
      return str
  }
}
