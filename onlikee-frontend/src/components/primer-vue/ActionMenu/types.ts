import type { ButtonHTMLAttributes, Component, HTMLAttributes, Ref } from 'vue'
import type { AnchorPosition } from '@primer/behaviors'
import type { OverlayProps } from '../internal/components/overlayTypes'
import type { TooltipDirection } from '../TooltipV2/types'

export type MenuCloseGesture = 'anchor-click' | 'click-outside' | 'escape' | 'tab' | 'item-select' | 'arrow-left' | 'close'
export type MenuCloseHandler = (gesture: MenuCloseGesture) => void
export interface ActionMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  anchorRef?: Ref<HTMLElement | null> | HTMLElement | null
}
export interface ActionMenuAnchorProps extends /* @vue-ignore */ HTMLAttributes {
  id?: string
  className?: string
}
export interface ActionMenuButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  as?: string
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'invisible' | 'danger' | 'link'
  alignContent?: 'start' | 'center'
  disabled?: boolean
  loading?: boolean
  loadingAnnouncement?: string
  inactive?: boolean
  labelWrap?: boolean
  leadingVisual?: Component
  trailingVisual?: Component
  trailingAction?: Component
  count?: number | string
  notificationIndicator?: 'button' | 'leadingVisual' | 'icon'
  className?: string
  description?: string
  tooltipDirection?: TooltipDirection
  unsafeDisableTooltip?: boolean
  keyshortcuts?: string
  keybindingHint?: string | string[]
}
export type ActionMenuVariant = { regular?: 'anchored'; narrow?: 'anchored' | 'fullscreen'; wide?: 'anchored' }
export interface ActionMenuOverlayProps extends Omit<OverlayProps, 'open' | 'anchor' | 'onPositionChange'> {
  variant?: ActionMenuVariant
  onPositionChange?: (event: { position: AnchorPosition }) => void
}
