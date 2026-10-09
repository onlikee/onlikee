import { post } from '@/api'

export interface ConnectApplicationRequest {
  appName: string
  appUrl: string
  visibility: string
  appDescription: string
}

export interface ConnectApplicationResponse {
  appUrl: string
}

export const applicationCreateConnect = (request: ConnectApplicationRequest) => {
  return post<ConnectApplicationResponse>('/application/create/connect', request, {
    withCredentials: true,
  })
}
