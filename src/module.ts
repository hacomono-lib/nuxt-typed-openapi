import { defineNuxtModule } from '@nuxt/kit'
import { generateTypes } from './lib/generate-types'
import { generateComposables } from './lib/generate-composables'
import type { Options } from './lib/types'

export type ModuleOptions = Options

// Module options TypeScript interface definition
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'typed-openapi',
    configKey: 'typedApiSource',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    src: '',
    importComposable: true,
    importNitroUtils: true,
    openapiTs: {}
  },
  async setup(options, nuxt) {
    await Promise.all([generateTypes(options), generateComposables(options, nuxt)])
  }
})
