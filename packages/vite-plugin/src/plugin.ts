import type { DevupApiOptions } from '@devup-api/core'
import {
  createUrlMap,
  generateCrudConfigCode,
  generateCrudConfigTypes,
  generateInterface,
  generateZodSchemas,
  generateZodTypeDeclarations,
} from '@devup-api/generator'
import {
  createTmpDirAsync,
  type DevupArtifacts,
  type DevupGenerators,
  type DevupIOAsync,
  generateDevupArtifactsAsync,
  normalizeOpenapiFiles,
  readOpenapiAsync,
  writeInterfaceAsync,
} from '@devup-api/utils'
import type { Plugin } from 'vite'

const VIRTUAL_ZOD_MODULE = '@devup-api/zod'
const RESOLVED_VIRTUAL_ZOD_MODULE = `\0${VIRTUAL_ZOD_MODULE}`

const VIRTUAL_UI_MODULE = '@devup-api/ui/crud'
const RESOLVED_VIRTUAL_UI_MODULE = `\0${VIRTUAL_UI_MODULE}`

export function devupApi(options?: DevupApiOptions): Plugin {
  let artifacts: DevupArtifacts | null = null

  const io: DevupIOAsync = {
    createTmpDirAsync,
    normalizeOpenapiFiles,
    readOpenapiAsync,
    writeInterfaceAsync,
  }

  const generators: DevupGenerators<DevupApiOptions> = {
    generateInterface,
    generateZodSchemas,
    generateZodTypeDeclarations,
    generateCrudConfigCode,
    generateCrudConfigTypes,
    createUrlMap,
  }

  const getArtifacts = async (): Promise<DevupArtifacts> => {
    if (!artifacts) {
      artifacts = await generateDevupArtifactsAsync(io, generators, options)
    }
    return artifacts
  }

  return {
    name: 'devup-api',

    // Resolve virtual modules
    resolveId(id) {
      if (id === VIRTUAL_ZOD_MODULE) {
        return RESOLVED_VIRTUAL_ZOD_MODULE
      }
      if (id === VIRTUAL_UI_MODULE) {
        return RESOLVED_VIRTUAL_UI_MODULE
      }
      return null
    },

    // Load virtual module content
    async load(id) {
      if (id === RESOLVED_VIRTUAL_ZOD_MODULE) {
        const { files } = await getArtifacts()
        return files.zodSchemas
      }
      if (id === RESOLVED_VIRTUAL_UI_MODULE) {
        const { files } = await getArtifacts()
        return files.crudConfig
      }
      return null
    },

    // Generate type definitions
    async configResolved() {
      await getArtifacts()
    },

    // Inject URL map as environment variable
    async config() {
      const { urlMap } = await getArtifacts()
      const define: Record<string, string> = {}
      if (urlMap && Object.keys(urlMap).length > 0) {
        // json stringify twice to avoid JSON.parse error
        define['process.env.DEVUP_API_URL_MAP'] = JSON.stringify(
          JSON.stringify(urlMap),
        )
      }
      return {
        define,
      }
    },
  }
}
