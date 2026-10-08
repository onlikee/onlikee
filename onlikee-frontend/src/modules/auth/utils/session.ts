import type { OAuthCallbackResponse } from '../api/login'

export const oauthProviderKey = 'oauth_provider'
export const loginReturnToKey = 'login_return_to'
export const oauthSignupContextKey = 'oauth_pending_signup_context'

export type OAuthSignupContext = Pick<
  OAuthCallbackResponse,
  'provider' | 'avatarUrl' | 'suggestedNickname' | 'email'
> & {
  pendingSignupToken: string
}

export const saveOAuthSignupContext = (response: OAuthCallbackResponse) => {
  if (!response.pendingSignupToken) return
  const context: OAuthSignupContext = {
    pendingSignupToken: response.pendingSignupToken,
    provider: response.provider,
    avatarUrl: response.avatarUrl,
    suggestedNickname: response.suggestedNickname,
    email: response.email,
  }
  sessionStorage.setItem(oauthSignupContextKey, JSON.stringify(context))
}

export const readOAuthSignupContext = (): OAuthSignupContext | null => {
  const rawContext = sessionStorage.getItem(oauthSignupContextKey)
  if (!rawContext) return null
  try {
    const context = JSON.parse(rawContext) as OAuthSignupContext
    return context.pendingSignupToken ? context : null
  } catch {
    return null
  }
}

export const clearOAuthSignupContext = () => {
  sessionStorage.removeItem(oauthSignupContextKey)
}
