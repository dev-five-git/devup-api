import { existsSync, mkdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'

/**
 * Synchronous function that checks if the df folder exists and creates it if it doesn't
 * @param tempDir Temporary directory (default: 'df')
 * @returns Full path of the created folder
 */
export function createTmpDir(tempDir: string = 'df'): string {
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }
  return tempDir
}

/**
 * Async function that checks if the df folder exists and creates it if it doesn't
 * @param tempDir Temporary directory (default: 'df')
 * @returns Promise that resolves to the full path of the created folder
 */
export async function createTmpDirAsync(
  tempDir: string = 'df',
): Promise<string> {
  try {
    await mkdir(tempDir, { recursive: true })
  } catch (error) {
    // Ignore if folder already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
  return tempDir
}
