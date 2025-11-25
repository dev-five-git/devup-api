/**
 * Convert string to camelCase
 */
export function toCamel(str: string): string {
  // Handle already camelCase strings
  if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
    return str
  }

  // Split by non-alphanumeric characters (underscore, hyphen, space, etc.)
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 0)

  if (words.length === 0) {
    return str.toLowerCase()
  }

  return (
    words[0]?.toLowerCase() +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  )
}
