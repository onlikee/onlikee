import { post } from '@/api'

export interface CollectApplicationRequest {
  appName: string
  appUrl: string
  visibility: string
  appDescription: string
}

export interface CollectApplicationResponse {
  appUrl: string
}

export const applicationCreateCollect = (request: CollectApplicationRequest) => {
  return post<CollectApplicationResponse>('/application/create/collect', request, {
    withCredentials: true,
  })
}
