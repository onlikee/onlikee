import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError } from 'axios'
import { useSystemStatusStore } from '@/stores/systemStatus'
import request, { get } from './request'

const originalAdapter = request.defaults.adapter

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  request.defaults.adapter = originalAdapter
})

describe('connection error notifications', () => {
  it.each(['ERR_NETWORK', 'ECONNABORTED'])(
    'records a system notice for %s and still rejects the request',
    async (code) => {
      const error = new AxiosError('No response', code, undefined, {})
      request.defaults.adapter = async () => {
        throw error
      }

      await expect(get('/auth/me')).rejects.toBe(error)
      expect(useSystemStatusStore().hasConnectionError).toBe(true)
    },
  )

  it.each([400, 500])('keeps HTTP %s responses out of the connection notice', async (status) => {
    request.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Request failed',
        'ERR_BAD_RESPONSE',
        config,
        {},
        {
          status,
          statusText: '',
          headers: {},
          config,
          data: { code: 'REQUEST_FAILED', message: '操作失败', data: null },
        },
      )
    }

    await expect(get('/application')).rejects.toThrow('操作失败')
    expect(useSystemStatusStore().hasConnectionError).toBe(false)
  })

  it('does not show a connection notice for a business error in an HTTP 200 response', async () => {
    request.defaults.adapter = async (config) => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: { code: 'NOT_LOGIN', message: '未登录', data: null },
    })

    await expect(get('/auth/me')).rejects.toThrow('未登录')
    expect(useSystemStatusStore().hasConnectionError).toBe(false)
  })

  it.each([
    ['canceled request', new AxiosError('Canceled', 'ERR_CANCELED', undefined, {})],
    ['setup error', new AxiosError('Invalid option', 'ERR_BAD_OPTION')],
  ])('preserves a %s without displaying a connection notice', async (_name, error) => {
    request.defaults.adapter = async () => {
      throw error
    }

    await expect(get('/auth/me')).rejects.toBe(error)
    expect(useSystemStatusStore().hasConnectionError).toBe(false)
  })
})
