import { post } from '@/api'

export const logout = () => post<void>('/auth/logout', undefined, { withCredentials: true })
export const logoutAll = () => post<void>('/auth/logout-all', undefined, { withCredentials: true })
