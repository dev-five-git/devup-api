export function wrapInterfaceKeyGuard(key: string): string {
  // Empty string should be returned as-is
  if (key === '') {
    return key
  }

  // Preserve TypeScript index signature syntax (e.g., [key: string], [key: number])
  if (/^\[.+:\s*.+\]$/.test(key)) {
    return key
  }

  // Check if key ends with '?' (optional marker in TypeScript)
  // If so, process the base key and add '?' back at the end
  const isOptional = key.endsWith('?')
  const baseKey = isOptional ? key.slice(0, -1) : key

  // Check if base key contains forbidden characters that require wrapping
  // TypeScript identifier pattern: starts with letter/underscore/dollar, followed by letters/numbers/underscore/dollar
  const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(baseKey)

  if (!isValidIdentifier || baseKey.includes("'")) {
    // Use single quotes for keys, escape if needed
    const escapedKey = baseKey.includes("'")
      ? baseKey.replace(/'/g, "\\'")
      : baseKey
    const wrapped = `'${escapedKey}'`
    return isOptional ? `${wrapped}?` : wrapped
  }
  return key
}
