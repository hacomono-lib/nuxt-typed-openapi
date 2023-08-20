import { describe, it } from 'vitest'
import { Entity, $fetchApi } from '#imports'

describe('$fetchApi (nuxt composable) type check', () => {
  it('should not throw an error if the path contains parameters (used for vscode surface)', () => {
    $fetchApi('/pet/{petId}')
    $fetchApi('/pet/{petId}', { method: 'get' })
    $fetchApi('/pet/{petId}', { method: 'post', body: { name: 'hoge', photoUrls: [] } })

    // put method is not defined in OpenAPI.
    // @ts-expect-error
    $fetchApi('/pet/{petId}', { method: 'put', body: { name: 'hoge', photoUrls: [] } })
  })

  it('should not throw an error if the path contains appropriate parameters', () => {
    // {petId} is defined as a number in OpenAPI.
    $fetchApi('/pet/3')

    // @ts-expect-error
    $fetchApi('/pet/hoge')
  })

  it('should return the correct type response', async () => {
    const data1 = await $fetchApi('/pet/3')

    data1 satisfies Entity<'Pet'> | null

    // Of course, an error will not occur even if the second argument is not omitted.
    const data2 = await $fetchApi('/pet/3', { method: 'get' })

    data2 satisfies Entity<'Pet'> | null
  })

  it('should only allow the defined request body', () => {
    $fetchApi('/store/order', {
      method: 'post',
      body: { id: 3, petId: 4, quantity: 3 }
    })

    // @ts-expect-error
    $fetchApi('/store/order', { method: 'post', body: { foo: 'bar' } })
  })

  it('should only allow the defined query parameters', () => {
    $fetchApi('/pet/findByStatus', { params: { status: 'available' } })

    // @ts-expect-error
    $fetchApi('/pet/findByStatus', { params: { foo: 'bar' } })

    $fetchApi('/pet/3', { method: 'post', params: { status: 'available' } })

    // @ts-expect-error
    $fetchApi('/pet/3', { method: 'post', params: { foo: 'bar' } })
  })

  it('should specific returtn type if set responseType parameter', async () => {
    const data1 = await $fetchApi('/pet/3', { responseType: 'blob' })

    data1 satisfies Blob | null

    const data2 = await $fetchApi('/pet/3', { responseType: 'text' })

    data2 satisfies string | null

    const data3 = await $fetchApi('/pet/3', { responseType: 'arrayBuffer' })

    data3 satisfies ArrayBuffer | null

    const data4 = await $fetchApi('/pet/3', { responseType: 'stream' })

    data4 satisfies ReadableStream<Uint8Array> | null
  })
})
