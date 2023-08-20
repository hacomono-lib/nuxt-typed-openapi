import type { OpenAPI3, OpenAPITSOptions } from 'openapi-typescript'

export interface Options {
  /**
   *
   */
  src: string | URL | OpenAPI3 | Readable

  /**
   *
   */
  importComposable?: boolean

  /**
   *
   */
  importNitroUtils?: boolean

  /**
   *
   */
  openapiTs?: OpenAPITSOptions
}
