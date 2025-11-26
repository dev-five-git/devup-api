export function wrapInterfaceKeyGuard(key: string): string {
  if (key.includes('/')) {
    return `[\`${key}\`]`
  }
  return key
}
