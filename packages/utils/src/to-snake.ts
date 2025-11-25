/**
 * Convert string to snake_case
 */
export function toSnake(str: string): string {
  if (!str) {
    return str
  }

  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore before capital letters (camelCase)
    .replace(/([0-9])([A-Z])/g, '$1_$2') // Add underscore between numbers and capital letters
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Add underscore between consecutive uppercase and lowercase (XMLHttp -> XML_Http)
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
    .toLowerCase()
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}
