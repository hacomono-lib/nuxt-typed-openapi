/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, assertType } from 'vitest'
import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
import { type Entity, useFetchApi } from '#imports'

declare function responseData<T>(asyncData: AsyncData<T | null, unknown>): T

// eslint-disable-next-line max-lines-per-function
describe('useFetchApi type check', () => {
  it('should not error if the path contains parameters (used for vscode surface)', () => {
    useFetchApi('/pet/{petId}', { method: 'get' })

    // { method: 'get' } is omitted.
    useFetchApi('/pet/{petId}')

    useFetchApi('/pet/{petId}', { method: 'post' })
    useFetchApi('/pet/{petId}', { method: 'delete' })
  })

  it('useFetchApi should return the correct type response if the path contains parameters', () => {
    assertType<Entity<'Pet'>>(responseData(useFetchApi('/pet/{petId}')))
    assertType<Entity<'Pet'>>(responseData(useFetchApi('/pet/{petId}', { method: 'get' })))
    assertType<{}>(responseData(useFetchApi('/pet/{petId}', { method: 'post' })))
    assertType<{}>(responseData(useFetchApi('/pet/{petId}', { method: 'delete' })))
  })

  it('should error if the path does not contain parameters)', () => {
    // @ts-expect-error
    useFetchApi('/pet/{petId}', { method: 'put' })
  })

  it('should not error if the path contains appropriate parameters', () => {
    // {petId} is defined as a number in OpenAPI.
    useFetchApi('/pet/3')
    useFetchApi('/pet/3', { method: 'get' })
  })

  it('should return the correct type response if the path contains appropriate parameters', () => {
    assertType<Entity<'Pet'>>(responseData(useFetchApi('/pet/3')))
    assertType<Entity<'Pet'>>(responseData(useFetchApi('/pet/3', { method: 'get' })))
  })

  it('should error if the path contains inappropriate parameters.', () => {
    // FIXME: // @ts-expect-error
    useFetchApi('/pet/hoge')
  })

  it('should only allow the defined request body', () => {
    useFetchApi('/store/order', {
      method: 'post',
      body: { id: 3, petId: 4, quantity: 3 }
    })

    // @ts-expect-error
    useFetchApi('/store/order', { method: 'post', body: { foo: 'bar' } })
  })

  it('should only allow the defined query parameters', () => {
    useFetchApi('/pet/findByStatus', { params: { status: 'available' } })

    // FIXME: // @ts-expect-error
    useFetchApi('/pet/findByStatus', { params: { foo: 'bar' } })

    useFetchApi('/pet/3', { method: 'post', params: { status: 'available' } })

    // @ts-expect-error
    useFetchApi('/pet/3', { method: 'post', params: { foo: 'bar' } })
  })

  it('should specific returtn type if set responseType parameter', async () => {
    assertType<Blob>(responseData(useFetchApi('/pet/3', { responseType: 'blob' })))

    assertType<string>(responseData(useFetchApi('/pet/3', { responseType: 'text' })))

    assertType<ArrayBuffer>(responseData(useFetchApi('/pet/3', { responseType: 'arrayBuffer' })))

    assertType<ReadableStream<Uint8Array>>(
      responseData(useFetchApi('/pet/3', { responseType: 'stream' }))
    )
  })
})
