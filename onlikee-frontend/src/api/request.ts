import axios, { type AxiosRequestConfig } from 'axios'
import { useSystemStatusStore } from '@/stores/systemStatus'

import { API_BASE_URL } from './config'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from './types'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

request.interceptors.response.use(
  (response) => {
    response.data = unwrapApiResponse(response.data as ApiResponse<unknown>)
    return response
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      // 无可读取的响应时显示连接故障通知，同时保留调用方的失败处理。
      if (isConnectionError(error)) {
        useSystemStatusStore().setConnectionError(true)
      }

      const payload = error.response?.data
      if (isApiResponse(payload) && payload.message) {
        return Promise.reject(new Error(payload.message))
      }
    }
    return Promise.reject(error)
  },
)

const isApiResponse = (payload: unknown): payload is ApiResponse<unknown> => {
  if (!payload || typeof payload !== 'object') return false
  const maybeApiResponse = payload as Partial<ApiResponse<unknown>>
  return typeof maybeApiResponse.code === 'string' && typeof maybeApiResponse.message === 'string'
}

const isConnectionError = (error: unknown) => {
  return (
    axios.isAxiosError(error) &&
    error.code !== 'ERR_CANCELED' &&
    !error.response &&
    Boolean(error.request)
  )
}

export const get = async <T>(url: string, config?: AxiosRequestConfig) => {
  const response = await request.get<T>(url, config)
  return response.data
}

export const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
  const response = await request.post<T>(url, data, config)
  return response.data
}

export default request
