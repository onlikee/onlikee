import type { ButtonHTMLAttributes, Component, Ref } from 'vue'
import type { SelectEvent } from '../ActionList/types'
import type { TooltipDirection } from '../TooltipV2/types'

export type ActionBarSize = 'small' | 'medium' | 'large'
export type ActionBarGap = 'none' | 'condensed'
export interface ActionBarProps {
  size?: ActionBarSize
  flush?: boolean
  gap?: ActionBarGap
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}
export interface ActionBarButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  disabled?: boolean
  size?: ActionBarSize
  as?: string
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  loading?: boolean
  loadingAnnouncement?: string
  inactive?: boolean
  labelWrap?: boolean
  alignContent?: 'start' | 'center'
  leadingVisual?: Component
  trailingVisual?: Component
  trailingAction?: Component
  count?: number | string
  notificationIndicator?: 'button' | 'leadingVisual' | 'icon'
  description?: string
  tooltipDirection?: TooltipDirection
  unsafeDisableTooltip?: boolean
  keyshortcuts?: string
  keybindingHint?: string | string[]
  className?: string
}
export interface ActionBarIconButtonProps extends ActionBarButtonProps {
  icon: Component
  'aria-label': string
}
export type ActionBarMenuItemProps =
  | {
      type?: 'action'
      label: string
      disabled?: boolean
      leadingVisual?: Component
      trailingVisual?: Component | string
      variant?: 'default' | 'danger'
      onClick?: (event: SelectEvent) => void
      items?: ActionBarMenuItemProps[]
    }
  | { type: 'divider' }
export interface ActionBarMenuProps extends ActionBarIconButtonProps {
  items: ActionBarMenuItemProps[]
  overflowIcon?: Component | 'none'
  returnFocusRef?: Ref<HTMLElement | null> | HTMLElement | null
}
