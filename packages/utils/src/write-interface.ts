import { writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

/**
 * Synchronous function that writes the interface to the file
 * @param interfacePath Interface file path
 * @param content Interface content
 */
export function writeInterface(interfacePath: string, content: string): void {
  writeFileSync(interfacePath, content, 'utf8')
}

/**
 * Async function that writes the interface to the file
 * @param interfacePath Interface file path
 * @param content Interface content
 */
export async function writeInterfaceAsync(
  interfacePath: string,
  content: string,
): Promise<void> {
  await writeFile(interfacePath, content, 'utf8')
}
