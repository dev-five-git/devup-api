export function wrapInterfaceKeyGuard(key: string): string {
  // Empty string should be returned as-is
  if (key === '') {
    return key
  }

  // Check if key contains forbidden characters that require wrapping
  // TypeScript identifier pattern: starts with letter/underscore/dollar, followed by letters/numbers/underscore/dollar
  const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)

  if (
    !isValidIdentifier ||
    key.includes('"') ||
    key.includes("'") ||
    key.includes('`')
  ) {
    return `[\`${key}\`]`
  }
  return key
}
