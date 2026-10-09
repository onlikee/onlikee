import { API_BASE_URL, get, post } from '@/api'
import type { UserInfo } from '@/stores/user'

export type OAuthCallbackStatus = 'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'

export type OAuthLoginResponse = {
  loginSource: string
  userInfo: UserInfo
}

export type OAuthCallbackResponse = {
  status: OAuthCallbackStatus
  loginSource?: string
  userInfo?: UserInfo
  pendingSignupToken?: string
  provider?: string
  avatarUrl?: string
  suggestedNickname?: string
  email?: string
}

export type OAuthCallbackParams = {
  code: string
  state: string
}

export type OAuthSignupCompleteRequest = {
  pendingSignupToken: string
  nickname: string
  email: string
}

export const getOAuthRenderUrl = (provider: string) =>
  new URL(`/oauth/${provider}/render`, API_BASE_URL).toString()

export const loginWithOAuthCallback = (provider: string, params: OAuthCallbackParams) => {
  const query = { code: params.code, state: params.state }
  return get<OAuthCallbackResponse>(`/oauth/${provider}/callback`, {
    params: query,
    withCredentials: true,
  })
}

export const completeOAuthSignup = (request: OAuthSignupCompleteRequest) =>
  post<OAuthLoginResponse>('/oauth/signup/complete', request, { withCredentials: true })
