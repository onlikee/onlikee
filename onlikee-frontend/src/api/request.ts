import axios, { type AxiosRequestConfig } from 'axios'

import { Banner } from '@/components/primer-vue/Banner'
import { API_BASE_URL } from './config'
import { unwrapApiResponse } from './response'
import type { ApiResponse } from './types'

const NETWORK_ERROR_MESSAGE = '网络连接失败，请确认网络连接正常。'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

request.interceptors.response.use((response) => {
  response.data = unwrapApiResponse(response.data as ApiResponse<unknown>)
  return response
}, (error) => {
  if (axios.isAxiosError(error)) {
    if (isNetworkError(error)) {
      Banner.error(NETWORK_ERROR_MESSAGE)
      return Promise.reject(new Error(NETWORK_ERROR_MESSAGE))
    }

    const payload = error.response?.data
    if (isApiResponse(payload) && payload.message) {
      Banner.error(payload.message)
      return Promise.reject(new Error(payload.message))
    }
  }
  return Promise.reject(error)
})

const isApiResponse = (payload: unknown): payload is ApiResponse<unknown> => {
  if (!payload || typeof payload !== 'object') return false
  const maybeApiResponse = payload as Partial<ApiResponse<unknown>>
  return typeof maybeApiResponse.code === 'string' && typeof maybeApiResponse.message === 'string'
}

const isNetworkError = (error: unknown) => {
  return axios.isAxiosError(error) && error.code !== 'ERR_CANCELED' && !error.response && Boolean(error.request)
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
