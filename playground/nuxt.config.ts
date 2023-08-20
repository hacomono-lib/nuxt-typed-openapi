export default defineNuxtConfig({
  modules: ['../src/module'],
  typedApiSource: {
    src: 'https://petstore3.swagger.io/api/v3/openapi.yaml'
  },
  devtools: { enabled: true }
})
