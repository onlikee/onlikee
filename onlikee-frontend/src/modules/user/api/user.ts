import { get, post } from '@/api'
import { uploadWithPresignedTicket, type PresignedUploadTicket } from '@/api/common/presigned-upload'

export type UserProfile = {
  uuid: string
  nickname: string
  email: string
  avatarUrl: string
  bio: string | null
  pronoun: string | null
  location: string | null
  socialAccount0: string | null
  socialAccount1: string | null
  socialAccount2: string | null
}

export type SaveCurrentUserMarkdownRequest = {
  content: string
}

export type UserProfileMarkdown = {
  markdown: string | null
}

export type CurrentUserProfile = {
  uuid: string
  nickname: string
  email: string
  avatarUrl: string
  bio: string | null
  pronoun: string | null
  location: string | null
  socialAccount0: string | null
  socialAccount1: string | null
  socialAccount2: string | null
}

export type SaveCurrentUserProfileRequest = {
  bio: string
  pronoun: string
  location: string
  socialAccount0: string
  socialAccount1: string
  socialAccount2: string
}

export const getPublicUserProfile = (nickname: string) =>
  get<UserProfile>(`/users/${encodeURIComponent(nickname)}/profile`)

export const getPublicUserMarkdown = (nickname: string) =>
  get<UserProfileMarkdown>(`/users/${encodeURIComponent(nickname)}/markdown`)

export const saveCurrentUserMarkdown = (request: SaveCurrentUserMarkdownRequest) =>
  post<void>('/users/me/markdown', request, { withCredentials: true })

export const saveCurrentUserProfile = (request: SaveCurrentUserProfileRequest) =>
  post<CurrentUserProfile>('/users/me/profile', request, { withCredentials: true })

export type AvatarUploadTicketRequest = {
  originalFilename: string
  contentType: string
  sizeBytes: number
}

export type AvatarUploadTicket = PresignedUploadTicket & {
  expiresAt: number
  bucket: string
  objectKey: string
}

export const createAvatarUploadTicket = (request: AvatarUploadTicketRequest) =>
  post<AvatarUploadTicket>('/resources/images/avatars/upload-tickets', request, { withCredentials: true })

export const saveCurrentUserAvatar = (avatarUrl: string) =>
  post<CurrentUserProfile>('/users/me/avatar', { avatarUrl }, { withCredentials: true })

export const uploadCurrentUserAvatar = async (file: File) => {
  const ticket = await createAvatarUploadTicket({
    originalFilename: file.name,
    contentType: file.type,
    sizeBytes: file.size
  })
  await uploadWithPresignedTicket(ticket, file)
  // 上传凭证的查询参数只用于 PUT 签名，公开资源地址只保留对象路径。
  const resourceUrl = new URL(ticket.uploadUrl)
  resourceUrl.search = ''
  return saveCurrentUserAvatar(resourceUrl.toString())
}
