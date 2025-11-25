/**
 * Convert string to PascalCase
 */
export function toPascal(str: string): string {
  // Handle already PascalCase strings
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
    return str
  }

  // Split by non-alphanumeric characters (underscore, hyphen, space, etc.)
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 0)

  if (words.length === 0) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}
