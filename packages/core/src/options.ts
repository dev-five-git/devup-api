export interface DevupApiTypeGeneratorOptions {
  /**
   * Case conversion type for API endpoint names and parameters
   * @default {'camel'}
   */
  convertCase?: 'snake' | 'camel' | 'pascal' | 'maintain'
  /**
   * Whether to make all properties non-nullable by default
   * @default {false}
   */
  requestDefaultNonNullable?: boolean
  /**
   * Whether to make all request properties non-nullable by default
   * @default {true}
   */
  responseDefaultNonNullable?: boolean
}

export interface DevupApiOptions extends DevupApiTypeGeneratorOptions {
  /**
   * Temporary directory for storing generated files
   * @default {'df'}
   */
  tempDir?: string

  /**
   * OpenAPI file path
   * @default {'openapi.json'}
   */
  openapiFiles?: string[] | string
}
