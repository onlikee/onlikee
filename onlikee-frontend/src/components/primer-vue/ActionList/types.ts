import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Component, CSSProperties, HTMLAttributes, VNode, VNodeChild } from 'vue'
import type { TooltipDirection } from '../TooltipV2/types'

export type ActionListVariant = 'inset' | 'horizontal-inset' | 'full'
export type ActionListSelectionVariant = 'single' | 'radio' | 'multiple'
export type ActionListItemVariant = 'default' | 'danger'
export type ActionListItemSize = 'medium' | 'large'
export type ActionListDescriptionVariant = 'inline' | 'block'
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type SelectEvent = MouseEvent | KeyboardEvent
export interface ActionListProps extends /* @vue-ignore */ HTMLAttributes {
  as?: string | Component
  variant?: ActionListVariant
  selectionVariant?: ActionListSelectionVariant
  showDividers?: boolean
  role?: HTMLAttributes['role']
  disableFocusZone?: boolean
  disableItemGap?: boolean
  className?: string
}
export interface ActionListItemProps extends Omit<HTMLAttributes, 'onSelect'> {
  selected?: boolean
  active?: boolean
  variant?: ActionListItemVariant
  size?: ActionListItemSize
  disabled?: boolean
  inactiveText?: string
  loading?: boolean
  id?: string
  onSelect?: (event: SelectEvent) => void
  className?: string
  groupId?: string
  renderItem?: (item: Component) => VNodeChild
  handleAddItem?: (item: Component) => void
  /** Deprecated in the source: has no effect on Item. */
  as?: string | Component
  /** Vue names for the source's private wrapper and tooltip APIs. */
  privateItemWrapper?: (props: Record<string, unknown>, children: VNodeChild[]) => VNode
  privateTooltipText?: string
}
export interface ActionListLinkItemProps extends /* @vue-ignore */ AnchorHTMLAttributes {
  as?: string | Component
  active?: boolean
  inactiveText?: string
  variant?: ActionListItemVariant
  size?: ActionListItemSize
  className?: string
  privateTooltipText?: string
}
export interface ActionListGroupProps extends /* @vue-ignore */ HTMLAttributes {
  variant?: 'filled' | 'subtle'
  /** Source compatibility API; prefer GroupHeading. */
  title?: string
  auxiliaryText?: string
  selectionVariant?: ActionListSelectionVariant | false
  className?: string
}
export interface ActionListHeadingProps extends /* @vue-ignore */ HTMLAttributes {
  as: HeadingLevel
  size?: 'large' | 'medium' | 'small'
  visuallyHidden?: boolean
  className?: string
}
export interface ActionListGroupHeadingProps extends /* @vue-ignore */ HTMLAttributes {
  as?: HeadingLevel
  variant?: 'filled' | 'subtle'
  auxiliaryText?: string
  headingWrapElement?: 'div' | 'li'
  internalBackwardCompatibleTitle?: string
  className?: string
}
export interface ActionListDescriptionProps {
  variant?: ActionListDescriptionVariant
  truncate?: boolean
  className?: string
  style?: CSSProperties
}
export interface ActionListDividerProps { className?: string; style?: CSSProperties }
export interface ActionListLeadingVisualProps extends /* @vue-ignore */ HTMLAttributes { className?: string }
export type ActionListTrailingVisualProps = ActionListLeadingVisualProps
export interface ActionListTrailingActionCommonProps extends /* @vue-ignore */ HTMLAttributes {
  icon?: Component
  label: string
  className?: string
  style?: CSSProperties
  tooltipDirection?: TooltipDirection
}
interface TrailingButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  as?: 'button'
  href?: never
  loading?: boolean
}
interface TrailingLinkProps extends /* @vue-ignore */ AnchorHTMLAttributes {
  as: 'a'
  href: string
  loading?: never
}
export type ActionListTrailingActionProps = ActionListTrailingActionCommonProps & (TrailingButtonProps | TrailingLinkProps)
export type ActionListGroupHeadingTrailingActionProps = Omit<ActionListTrailingActionProps, 'icon' | 'as' | 'href' | 'loading'> &
  { icon: Component } & ({ as?: 'button'; href?: never; loading?: boolean } | { as: 'a'; href: string; loading?: never })
export interface ActionListContainerContextValue {
  container?: string
  listRole?: HTMLAttributes['role']
  selectionVariant?: ActionListSelectionVariant
  selectionAttribute?: 'aria-selected' | 'aria-checked'
  listLabelledBy?: string
  afterSelect?: (event: SelectEvent) => void
  enableFocusZone?: boolean
  defaultTrailingVisual?: VNodeChild
}
export interface ActionListGroupContextValue {
  selectionVariant?: ActionListSelectionVariant | false
  groupHeadingId?: string
}
