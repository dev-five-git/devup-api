import { existsSync, mkdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Synchronous function that checks if the df folder exists and creates it if it doesn't
 * @param basePath Base path (default: current working directory)
 * @returns Full path of the created folder
 */
export function createTmpDir(basePath?: string): string {
  const targetPath = basePath ?? process.cwd()
  const dfPath = join(targetPath, 'df')

  if (!existsSync(dfPath)) {
    mkdirSync(dfPath, { recursive: true })
  }

  return dfPath
}

/**
 * Async function that checks if the df folder exists and creates it if it doesn't
 * @param basePath Base path (default: current working directory)
 * @returns Promise that resolves to the full path of the created folder
 */
export async function createTmpDirAsync(basePath?: string): Promise<string> {
  const targetPath = basePath ?? process.cwd()
  const dfPath = join(targetPath, 'df')

  try {
    await mkdir(dfPath, { recursive: true })
  } catch (error) {
    // Ignore if folder already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }

  return dfPath
}
