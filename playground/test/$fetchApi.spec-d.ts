/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, assertType } from 'vitest'
import { type Entity, $fetchApi } from '#imports'

declare function responseData<T>(asyncData: Promise<T>): T

// eslint-disable-next-line max-lines-per-function
describe('$fetchApi type check', () => {
  it('should not error if the path contains parameters (used for vscode surface)', () => {
    $fetchApi('/pet/{petId}', { method: 'get' })

    // { method: 'get' } is omitted.
    $fetchApi('/pet/{petId}')

    $fetchApi('/pet/{petId}', { method: 'post' })
    $fetchApi('/pet/{petId}', { method: 'delete' })
  })

  it('$fetchApi should return the correct type response if the path contains parameters', () => {
    assertType<Entity<'Pet'>>(responseData($fetchApi('/pet/{petId}')))
    assertType<Entity<'Pet'>>(responseData($fetchApi('/pet/{petId}', { method: 'get' })))
    assertType<{}>(responseData($fetchApi('/pet/{petId}', { method: 'post' })))
    assertType<{}>(responseData($fetchApi('/pet/{petId}', { method: 'delete' })))
  })

  it('should error if the path does not contain parameters.', () => {
    // @ts-expect-error
    $fetchApi('/pet/{petId}', { method: 'put' })
  })

  it('should not error if the path contains appropriate parameters', () => {
    // {petId} is defined as a number in OpenAPI.
    $fetchApi('/pet/3')
    $fetchApi('/pet/3', { method: 'get' })
  })

  it('should return the correct type response if the path contains appropriate parameters', () => {
    assertType<Entity<'Pet'>>(responseData($fetchApi('/pet/3')))
    assertType<Entity<'Pet'>>(responseData($fetchApi('/pet/3', { method: 'get' })))
  })

  it('should error if the path contains inappropriate parameters', () => {
    // FIXME: // @ts-expect-error
    $fetchApi('/pet/hoge')
  })

  it('should only allow the defined request body', () => {
    $fetchApi('/store/order', {
      method: 'post',
      body: { id: 3, petId: 4, quantity: 3 }
    })

    // FIXME: // @ts-expect-error
    $fetchApi('/store/order', { method: 'post', body: { foo: 'bar' } })
  })

  it('should only allow the defined query parameters', () => {
    $fetchApi('/pet/findByStatus', { params: { status: 'available' } })

    // FIXME: // @ts-expect-error
    $fetchApi('/pet/findByStatus', { params: { foo: 'bar' } })

    $fetchApi('/pet/3', { method: 'post', params: { status: 'available' } })

    // @ts-expect-error
    $fetchApi('/pet/3', { method: 'post', params: { foo: 'bar' } })
  })

  it('should specific returtn type if set responseType parameter', async () => {
    assertType<Blob>(responseData($fetchApi('/pet/3', { responseType: 'blob' })))

    assertType<string>(responseData($fetchApi('/pet/3', { responseType: 'text' })))

    assertType<ArrayBuffer>(responseData($fetchApi('/pet/3', { responseType: 'arrayBuffer' })))

    assertType<ReadableStream<Uint8Array>>(
      responseData($fetchApi('/pet/3', { responseType: 'stream' }))
    )
  })
})
