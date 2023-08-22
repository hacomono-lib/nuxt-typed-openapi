<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# nuxt-typed-openapi

A Nuxt.js 3 module for generating type-safe API calls based on OpenAPI schemas. Ensure robust integration with your external APIs.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- Utilizes `openapi-typescript` to dynamically generate type-safe API calls for Nuxt.js 3 from external OpenAPI schemas.
- Ensure a seamless and type-checked integration with external APIs, leveraging the power of OpenAPI-to-TypeScript conversion.
- Streamline your development process by auto-binding API responses to their respective types, eliminating manual type definitions.
- Only overrides TypeScript types, resulting in an extremely minimal impact on bundle size.

## Quick Setup

### 1. Add `nuxt-typed-openapi` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-typed-openapi

# Using yarn
yarn add --dev nuxt-typed-openapi

# Using npm
npm install --save-dev nuxt-typed-openapi
```

### 2. Add `my-module` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-typed-openapi']
})
```

### 3. Configure it

generate a local type file

```js
export default defineNuxtConfig({
  typedOpenApi: {
    // Local Schema
    src: './path/to/my/schema.yaml'
  }
})
```

or use a remote schema

```js
export default defineNuxtConfig({
  typedOpenApi: {
    // Remote Schema
    src: 'https://petstore3.swagger.io/api/v3/openapi.json'
  }
})
```

### 4. automatically generate types based on the schema

If you want to generate types based on the schema, you can run the following command:

```bash
nuxi prepare
```

### 5. Use composable types or functions

call api in your code:

```vue
<script setup lang="ts">
// path, method, requestBody, query are all type safe based on the schema
const { data } = await useFetchApi('/pet/3')
</script>
```

## API

### `useFetchApi`

The useFetchApi method is identical to useFetch, but is type safe based on the specified OpenAPI Schema.

```ts
// $useFetchApi is auto-imported. if you want to import manually, write `import { useFetchApi } from '#imports'`
const { data } = await useFetchApi('/pet/3')
```

The first argument can be any path defined in the schema and a string matching the template literal type if it contains parameters, as follows

- `/pet`
- `/pet/{petId}`
- `/pet/3`

It is not an error if the path parameter is not replaced by a value. This is a feature to be included in suggestions in vscode, for example. Note that if the path parameter is not replaced with a numeric value, the path will be called as is at api call time.

The method parameter specified in the second argument is inferred based on the path specified in the first argument. Specifying a method that is not defined in schema will result in an error.

```ts
const { data } = await useFetchApi('/pet/3', { method: 'get' }) // correct !

const { data } = await useFetchApi('/pet/3', { method: 'post' }) // error !
```

If response data, request body, and query params are defined in schema, their types are automatically inferred from the path in the first argument and the method parameter in the second argument.

```ts
const { data } = await useFetchApi('/pet/3', { method: 'get' }) // data is Pet type

const { data } = await useFetchApi('/pet', {
  method: 'post',
  body: { name: 'doggie' }
}) // body is Pet type

const { data } = await useFetchApi('/pet/findByStatus', {
  method: 'get',
  query: { status: 'available' }
}) // query is { status?: 'available' | 'pending' | 'sold' } type
```

### `$fetchApi`

The $fetchApi method is identical to $fetch, but is type safe based on the specified OpenAPI Schema.
This function can be used type-safely in code under server/api as well.

Basic functionality is the same as useFetchApi.

```ts
const { data } = await useAsyncData(() => {
  // $fetchApi is auto-imported. if you want to import manually, write `import { $fetchApi } from '#imports'`
  return $fetchApi('/pet/3')
})
```

```ts
// in server/api, $fetchApi is not auto-imported. you need to import manually
import { $fetchApi } from '#nuxt-typed-openapi'

export default defineEventHandler((event) => {
  return $fetchApi('/pet/3')
})
```

## Contributing

see [./CONTRIBUTING.md](./CONTRIBUTING.md)

### Commands

```bash
# Install dependencies
yarn

# Generate type stubs
yarn prepare

# Develop with the playground
yarn dev

# Build the playground
yarn build

# Run ESLint
yarn lint

# Run Vitest
yarn test
yarn test:watch

```
