import { NuxtModule } from '@nuxt/schema'
import typedOpenApi from '../../../src/module'

export default defineNuxtConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modules: [typedOpenApi as NuxtModule<any>],
  typedApiSource: {
    src: 'https://petstore3.swagger.io/api/v3/openapi.yaml'
  }
})
