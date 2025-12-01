export function wrapInterfaceKeyGuard(key: string): string {
  if (key.includes('/') || key.includes('.')) {
    return `[\`${key}\`]`
  }
  return key
}
