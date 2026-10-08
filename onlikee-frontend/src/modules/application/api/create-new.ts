import { post } from '@/api'

export interface CreateApplicationRequest {
  framework: string
  appFile: File
  appName: string
  appSubDomain: string
  visibility: string
  appDescription: string
}

export interface CreateApplicationResponse {
  appUrl: string
}

function buildCreateApplicationFormData(request: CreateApplicationRequest): FormData {
  const payload = new FormData()

  payload.append('framework', request.framework)
  payload.append('appFile', request.appFile)
  payload.append('appName', request.appName)
  payload.append('appSubDomain', request.appSubDomain)
  payload.append('visibility', request.visibility)
  payload.append('appDescription', request.appDescription)

  return payload
}

export const applicationCreateNew = (request: CreateApplicationRequest) => {
  const data = buildCreateApplicationFormData(request)

  return post<CreateApplicationResponse>('/application/create/new', data, {
    withCredentials: true,
  })
}
