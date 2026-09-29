export interface AvatarResponsiveSize {
  narrow?: number
  regular?: number
  wide?: number
}

export interface AvatarProps {
  src?: string
  alt?: string
  placeholder?: string
  size?: number | AvatarResponsiveSize
  square?: boolean
}
