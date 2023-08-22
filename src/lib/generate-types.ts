import { addImports, addTypeTemplate } from '@nuxt/kit'

import openapiTs from 'openapi-typescript'
import type { Options } from './types'
import { TEMPLATE_DIR_NAME, importTypes } from './constants'

export async function generateTypes(options: Options): Promise<void> {
  addTypeTemplate({
    filename: `${TEMPLATE_DIR_NAME}/openapi.d.ts`,
    write: true,
    getContents: () => openapiTs(options.src)
  })

  const types = addTypeTemplate({
    filename: `${TEMPLATE_DIR_NAME}/types.d.ts`,
    write: true,
    getContents: () => template()
  })

  for (const type of importTypes) {
    addImports({
      from: types.dst,
      name: type,
      type: true
    })
  }
}

// eslint-disable-next-line max-lines-per-function
function template(): string {
  return `
import type { paths, components, operations } from './openapi'
import type { UnionToIntersection, Get, Writable } from 'type-fest'

type Dictionary<K extends string = string, V = unknown> = { [key in K]: V }

export type Simplify<T> = T extends unknown ? { [K in keyof T]: Simplify<T[K]> } : never

export type Methods =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'purge'
  | 'link'
  | 'unlink'

export type Operations = keyof operations

export type PathOf<O extends Operations> = {
  [P in UrlPaths]: {
    [M in Methods]: Get<paths, \`\${P}.\${M}\`> extends infer R
      ? R extends operations[O]
        ? P
        : never
      : never
  }[Methods]
}[UrlPaths]

export type ExactPathOf<O extends Operations> = ToExact<PathOf<O>>

export type UrlPaths = keyof paths

export type ExactPaths = ToExact<UrlPaths>

export type HttpMethodsByPath<P extends UrlPaths> = Methods & keyof UnionToIntersection<paths[P]>

export type PathByHttpMethods<M extends Methods> = {
  [P in UrlPaths]: M extends keyof paths[P] ? P : never
}[UrlPaths]

export type ExactPathByHttpMethods<M extends Methods> = ToExact<PathByHttpMethods<M>>

export type ToExact<S extends string> = S extends \`\${infer H}{\${infer P}}\${infer T}\`
  ? PathParameter<S, P> extends string | number
    ? \`\${H}\${PathParameter<S, P>}\${ToExact<T>}\`
    : \`\${H}\${string | number}\${ToExact<T>}\`
  : S

export type PathParameter<PATH extends string, PARAM extends string> = Get<
  paths,
  \`\${PATH}.\${HttpMethodsByPath<UrlPaths>}.parameters.path.\${PARAM}\`
>

export type ToPath<E extends ExactPaths> = {
  [P in UrlPaths]: true extends SameExactPath<E, ToExact<P>> ? P : never
}[UrlPaths]

type SameExactPath<A extends ExactPaths, B extends ExactPaths> = A extends B
  ? true
  : B extends A
  ? true
  : false

export type RequestParameters<
  P extends UrlPaths,
  M extends Methods
> = M extends HttpMethodsByPath<P>
  ? Simplify<Get<paths, \`\${P}.\${M}.parameters.query\`> & Dictionary>
  : never


/**
 * Get the type of request body corresponding to the path and method defined in openapi
 * @example
 * \`\`\`ts
 * type Body = RequestBody<'/pet', 'post'>
 * //   ^? same as components.schema.Pet
 * \`\`\`
 */
export type RequestBody<P extends UrlPaths = UrlPaths, M extends Methods = Methods> = Writable<
  Get<paths, \`\${P}.\${M}.requestBody.content.application/json\`>
>

/**
 * Get the type of path parameter corresponding to the path and method defined in openapi
 * @example
 * \`\`\`ts
 * type Path = PathParameters<'/pet/{petId}', 'get'>
 * //   ^ { petId: string }
 * \`\`\`
 */
export type PathParameters<P extends UrlPaths = UrlPaths, M extends Methods = Methods> = Simplify<
  Get<paths, \`\${P}.\${M}.parameters.path\`>
>

/**
 * Get the type of query parameter corresponding to the path and method defined in openapi
 * @example
 * \`\`\`ts
 * type Query = QueryParameters<'/pet/findByStatus', 'get'>
 * //   ^? { status?: 'available' | 'pending' | 'sold''}
 * \`\`\`
 */
export type QueryParameters<P extends UrlPaths = UrlPaths, M extends Methods = Methods> = Simplify<
  Get<paths, \`\${P}.\${M}.parameters.query\`>
>

type EntityName = keyof components['schemas']

/**
 * Get the type of components.schema defined in openapi
 * @example
 * \`\`\`ts
 * type Pet = Entity<'Pet'>
 * \`\`\`
 */
export type Entity<K extends EntityName> = Simplify<Get<components, \`schemas.\${K}\`>>

/**
 * Get the type of the response that can be obtained with application/json from the path and method defined in openapi
 * @example
 * \`\`\`ts
 * type Pet = ResponseData<'/pets/{id}', 'get'>
 * \`\`\`
 */
export type ResponseData<
  P extends UrlPaths = UrlPaths,
  M extends Methods = Methods
> = M extends HttpMethodsByPath<P>
  ? Simplify<Get<paths, \`\${P}.\${M}.responses.200.content.application/json\`>>
  : never
`
}
