import type { HTMLAttributes } from 'vue'

export type TooltipDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
export type TooltipType = 'label' | 'description'
export type TooltipDelay = 'short' | 'medium' | 'long'
export type TooltipForwardedRef =
  null | { current: HTMLElement | null } | ((element: HTMLElement | null) => void | (() => void))

export interface TooltipOptions {
  direction?: TooltipDirection
  text: string
  type?: TooltipType
  keybindingHint?: string | string[]
  delay?: TooltipDelay
  _privateDisableTooltip?: boolean
  id?: string
  className?: string
  /** Vue adapter for React's forwarded trigger ref. */
  forwardedRef?: TooltipForwardedRef
}

export type TooltipProps = TooltipOptions & HTMLAttributes
