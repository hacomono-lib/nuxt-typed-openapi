/* eslint-disable max-lines */
import { addTemplate, addImports } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { TEMPLATE_DIR_NAME, importTypes } from './constants'
import { Options } from './types'
import { defu } from 'defu'

export async function generateComposables(options: Options, nuxt: Nuxt): Promise<void> {
  await addComposable(options, nuxt)
  await addNitroUtils(options, nuxt)
}

interface SourceSet {
  head: string
  body: string
}

function commonTemplate(_options: Options): SourceSet {
  const head = `
import type { ExactPaths, HttpMethodsByPath, Methods, QueryParameters, RequestBody, ResponseData, ToPath, UrlPaths } from './types'
import type { FetchOptions, FetchError } from 'ofetch'
`

  const body = `
interface FetchOptionsWrap<
  PATH extends UrlPaths,
  METHOD extends Methods = HttpMethodsByPath<PATH>,
  REQUEST_BODY extends RequestBody = RequestBody<PATH, METHOD>,
  PARAMS extends QueryParameters = QueryParameters<PATH, METHOD>
> extends Omit<FetchOptions, 'body'> {
  method: METHOD;
  body?: REQUEST_BODY;
  query?: PARAMS;
  params?: PARAMS;
  responseType?: ResponseType | 'json'
};

interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

type ResponseType = keyof ResponseMap | undefined;

type NonNullable<T> = T extends null | undefined ? never : T;
`

  return { head, body }
}

// eslint-disable-next-line max-lines-per-function
function fetchApiTemplate(_options: Options): SourceSet {
  const head = `
import { $fetch } from 'ofetch'
`

  const body = `
interface FetchWrap {
  /**
   * call api
   */
  <RESPONSE_TYPE extends NonNullable<ResponseType>>(
    path: string,
    option: FetchOptions & { responseType: RESPONSE_TYPE }
  ): Promise<ResponseMap[RESPONSE_TYPE]>;

  /**
   * call api
   * @example
   * \`\`\`ts
   * const data = await $fetchApi('/pet/3')
   * // datga is type of Pet
   * \`\`\`
   */
  <
    EXACT_PATH extends ExactPaths,
    PATH extends ToPath<EXACT_PATH>,
    OPTION extends Omit<FetchOptionsWrap<PATH, 'get'>, 'method'>,
  >(
    path: EXACT_PATH,
    option?: Omit<OPTION, 'method'>
  ): Promise<ResponseData<PATH, 'get'>>;

  /**
   * use vscode intellisense to keep path parameters like \`/pet/{petId}\`
   */
  <
    PATH extends UrlPaths,
    OPTION extends Omit<FetchOptionsWrap<PATH, 'get'>, 'method'>,
  >(
    path: PATH,
    option?: Omit<OPTION, 'method'>
  ): Promise<ResponseData<PATH, 'get'>>;

  /**
   * call api
   * @example
   * \`\`\`ts
   * const data = await $fetchApi('/pet', { method: 'post', body: newPet })
   * // newPet is type of Pet
   * // data is type of Pet
   * \`\`\`
   */
  <
    EXACT_PATH extends ExactPaths,
    PATH extends ToPath<EXACT_PATH>,
    METHOD extends HttpMethodsByPath<PATH>,
    OPTION extends FetchOptionsWrap<PATH, METHOD>,
  >(
    path: EXACT_PATH,
    option: OPTION & { method: METHOD }
  ): Promise<ResponseData<PATH, METHOD>>;

  /**
   * use vscode intellisense to keep path parameters like \`/pet/{petId}\`
   */
  <
    PATH extends UrlPaths,
    METHOD extends HttpMethodsByPath<PATH>,
    OPTION extends FetchOptionsWrap<PATH, METHOD>,
  >(
    path: PATH,
    option: OPTION & { method: METHOD }
  ): Promise<ResponseData<PATH, METHOD>>;
}

export const $fetchApi: FetchWrap = $fetch
`

  return { head, body }
}

// eslint-disable-next-line max-lines-per-function
function useFetchApiTemplate(_options: Options): SourceSet {
  const head = `
import { useFetch } from '#app'
import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
`

  const body = `
interface UseFetchWrap {
  /**
   * call api
   */
  <RESPONSE_TYPE extends NonNullable<ResponseType>>(
    path: string,
    option: FetchOptions & { responseType: RESPONSE_TYPE }
  ): AsyncData<ResponseMap[RESPONSE_TYPE] | null, FetchError | null>;

  /**
   * call api
   * @example
   * \`\`\`ts
   * const { data, error } = await useFetchApi('/pet/3')
   * // datga is type of Pet
   * \`\`\`
   */
  <
    EXACT_PATH extends ExactPaths,
    PATH extends ToPath<EXACT_PATH>,
    OPTION extends Omit<FetchOptionsWrap<PATH, 'get'>, 'method'>,
    ERROR = FetchError
  >(
    path: EXACT_PATH,
    option?: Omit<OPTION, 'method'>
  ): AsyncData<ResponseData<PATH, 'get'> | null, ERROR | null>;

  /**
   * use vscode intellisense to keep path parameters like \`/pet/{petId}\`
   */
  <
    PATH extends UrlPaths,
    OPTION extends Omit<FetchOptionsWrap<PATH, 'get'>, 'method'>,
    ERROR = FetchError
  >(
    path: PATH,
    option?: Omit<OPTION, 'method'>
  ): AsyncData<ResponseData<PATH, 'get'> | null, ERROR | null>;

  /**
   * call api
   * @example
   * \`\`\`ts
   * const { data, error } = useFetchApi('/pet/3', { method: 'post', body: newPet })
   * // newPet is type of Pet
   * // data is type of Pet
   * \`\`\`
   */
  <
    EXACT_PATH extends ExactPaths,
    PATH extends ToPath<EXACT_PATH>,
    METHOD extends HttpMethodsByPath<PATH>,
    OPTION extends FetchOptionsWrap<PATH, METHOD>,
    ERROR = FetchError
  >(
    path: EXACT_PATH,
    option: OPTION & { method: METHOD }
  ): AsyncData<ResponseData<PATH, METHOD> | null, ERROR | null>;

  /**
   * use vscode intellisense to keep path parameters like \`/pet/{petId}\`
   */
  <
    PATH extends UrlPaths,
    METHOD extends HttpMethodsByPath<PATH>,
    OPTION extends FetchOptionsWrap<PATH, METHOD>,
    ERROR = FetchError
  >(
    path: PATH,
    option: OPTION & { method: METHOD }
  ): AsyncData<ResponseData<PATH, METHOD> | null, ERROR | null>;
}

export const useFetchApi = useFetch as UseFetchWrap
`
  return { head, body }
}

function exportTypeTemplate(_option: Options): string {
  return `
export type { ${importTypes.join(', ')} } from './types'
`
}

function addComposable(options: Options, _nuxt: Nuxt) {
  if (!options.importComposable) {
    return
  }

  const { head: commonHead, body: commonBody } = commonTemplate(options)
  const { head: fetchApiHead, body: fetchApiBody } = fetchApiTemplate(options)
  const { head: useFetchApiHead, body: useFetchApiBody } = useFetchApiTemplate(options)

  const composables = addTemplate({
    filename: `${TEMPLATE_DIR_NAME}/composables.ts`,
    write: true,
    getContents: () =>
      [commonHead, fetchApiHead, useFetchApiHead, commonBody, fetchApiBody, useFetchApiBody].join(
        ''
      )
  })

  addImports({
    from: composables.dst,
    name: 'useFetchApi'
  })

  addImports({
    from: composables.dst,
    name: '$fetchApi'
  })
}

function addNitroUtils(options: Options, nuxt: Nuxt) {
  if (!options.importNitroUtils || nuxt.options.nitro.imports === false) {
    return
  }
  const { head: commonHead, body: commonBody } = commonTemplate(options)
  const exportTypes = exportTypeTemplate(options)
  const { head: fetchApiHead, body: fetchApiBody } = fetchApiTemplate(options)

  addTemplate({
    filename: `${TEMPLATE_DIR_NAME}/nitro-utils.ts`,
    write: true,
    getContents: () => [commonHead, fetchApiHead, exportTypes, commonBody, fetchApiBody].join('')
  })

  nuxt.hook('nitro:config', (config) => {
    config.alias = defu(config.alias, {
      '#nuxt-typed-openapi': `${TEMPLATE_DIR_NAME}/nitro-utils.ts`
    })
  })
}
