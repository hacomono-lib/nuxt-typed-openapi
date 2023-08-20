import { describe, it } from 'vitest'
import { Entity, useFetchApi } from '#imports'

describe('useFetchApi type check', () => {
  it('should not throw an error if the path contains parameters (used for vscode surface)', () => {
    useFetchApi('/pet/{petId}')
    useFetchApi('/pet/{petId}', { method: 'get' })
    useFetchApi('/pet/{petId}', { method: 'post' })
    useFetchApi('/pet/{petId}', { method: 'delete' })

    // put method is not defined in OpenAPI.
    // @ts-expect-error
    useFetchApi('/pet/{petId}', { method: 'put' })
  })

  it('should not throw an error if the path contains appropriate parameters', () => {
    // {petId} is defined as a number in OpenAPI.
    useFetchApi('/pet/3')

    // @ts-expect-error
    useFetchApi('/pet/hoge')
  })

  it('should return the correct type response', async () => {
    const { data: data1 } = await useFetchApi('/pet/3')

    data1.value satisfies Entity<'Pet'> | null

    // Of course, an error will not occur even if the second argument is not omitted.
    const { data: data2 } = await useFetchApi('/pet/3', { method: 'get' })

    data2.value satisfies Entity<'Pet'> | null
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

    // @ts-expect-error
    useFetchApi('/pet/findByStatus', { params: { foo: 'bar' } })

    useFetchApi('/pet/3', { method: 'post', params: { status: 'available' } })

    // @ts-expect-error
    useFetchApi('/pet/3', { method: 'post', params: { foo: 'bar' } })
  })

  it('should specific returtn type if set responseType parameter', async () => {
    const { data: data1 } = await useFetchApi('/pet/3', { responseType: 'blob' })

    data1.value satisfies Blob | null

    const { data: data2 } = await useFetchApi('/pet/3', { responseType: 'text' })

    data2.value satisfies string | null

    const { data: data3 } = await useFetchApi('/pet/3', { responseType: 'arrayBuffer' })

    data3.value satisfies ArrayBuffer | null

    const { data: data4 } = await useFetchApi('/pet/3', { responseType: 'stream' })

    data4.value satisfies ReadableStream<Uint8Array> | null
  })
})
