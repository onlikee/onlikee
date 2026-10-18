import type { HTMLAttributes, LiHTMLAttributes, OlHTMLAttributes } from 'vue'
import type { TimelineBadgeVariants } from './constants'

export interface TimelineProps extends /* @vue-ignore */ Omit<OlHTMLAttributes, 'role'> {
  clipSidebar?: boolean | 'start' | 'end' | 'both'
  className?: string
}
export interface TimelineItemProps extends /* @vue-ignore */ LiHTMLAttributes {
  condensed?: boolean
  className?: string
}
/** @deprecated Use TimelineItemProps. */
export type TimelineItemsProps = TimelineItemProps
export type TimelineBadgeVariant = (typeof TimelineBadgeVariants)[number]
export interface TimelineBadgeProps extends /* @vue-ignore */ HTMLAttributes {
  className?: string
  variant?: TimelineBadgeVariant
}
export interface TimelineBodyProps extends /* @vue-ignore */ HTMLAttributes {
  className?: string
}
export interface TimelineBreakProps extends /* @vue-ignore */ Omit<LiHTMLAttributes, 'role'> {
  className?: string
}
export type TimelineActionsProps = TimelineBodyProps
export type TimelineAvatarProps = TimelineBodyProps
export interface TimelineInstance {
  element: HTMLDivElement | HTMLOListElement | null
}
export interface TimelineItemInstance {
  element: HTMLDivElement | HTMLLIElement | null
}
export type TimelineBreakInstance = TimelineItemInstance
export interface TimelineSectionInstance {
  element: HTMLDivElement | null
}
