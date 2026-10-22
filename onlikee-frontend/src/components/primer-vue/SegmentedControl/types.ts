import type { ButtonHTMLAttributes, Component, CSSProperties, VNode } from 'vue'
import type { TooltipDirection } from '../Tooltip/types'
import type { ResponsiveValue } from '../Stack/types'

export interface SegmentedControlProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  fullWidth?: boolean | ResponsiveValue<boolean>
  onChange?: (selectedIndex: number) => void
  size?: 'small' | 'medium'
  variant?: 'default' | 'subtle' | ResponsiveValue<'hideLabels' | 'dropdown' | 'default' | 'subtle'>
  className?: string
}

export interface SegmentedControlButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  selected?: boolean
  defaultSelected?: boolean
  leadingVisual?: Component | VNode
  /** @deprecated Use leadingVisual instead. */
  leadingIcon?: Component | VNode
  disabled?: boolean
  count?: number | string
  className?: string
}

export interface SegmentedControlIconButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  'aria-label': string
  icon: Component | VNode
  selected?: boolean
  defaultSelected?: boolean
  description?: string
  tooltipDirection?: TooltipDirection
  disabled?: boolean
  className?: string
}

export interface SegmentedControlActionProps {
  label: string
  icon: Component
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export interface SegmentedControlDividerProps {
  className?: string
  style?: CSSProperties
}
