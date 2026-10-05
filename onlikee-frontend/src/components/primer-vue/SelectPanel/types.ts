import type { VNodeChild } from 'vue'
import type { NodeProp } from '../internal/renderNode'
import type { FilteredActionListProps, ItemInput, Visual } from '../FilteredActionList/types'
import type { AnchorRenderProps, AnchoredOverlayProps, OverlayProps } from '../internal/components/overlayTypes'
export type SelectPanelGesture = 'anchor-click' | 'anchor-key-press' | 'click-outside' | 'escape' | 'selection' | 'cancel'
export type InitialLoadingType = 'spinner' | 'skeleton'
export interface SelectPanelMessageProps {
  title: string
  variant: 'empty' | 'error' | 'warning'
  body?: NodeProp
  className?: string
  icon?: Visual
  action?: NodeProp
}
export interface SelectPanelComponentProps extends Omit<FilteredActionListProps, 'selectionVariant' | 'variant' | 'message'> {
  open: boolean
  selected?: ItemInput | ItemInput[]
  title?: NodeProp
  subtitle?: NodeProp
  secondaryAction?: NodeProp
  placeholder?: string
  inputLabel?: string
  overlayProps?: Partial<OverlayProps>
  initialLoadingType?: InitialLoadingType
  notice?: { text: NodeProp; variant: 'info' | 'warning' | 'error' }
  message?: SelectPanelMessageProps
  footer?: NodeProp
  showSelectedOptionsFirst?: boolean
  disableFullscreenOnNarrow?: boolean
  showSelectAll?: boolean
  variant?: 'anchored' | 'modal'
  renderAnchor?: ((props: AnchorRenderProps) => VNodeChild) | null
  anchorRef?: AnchoredOverlayProps['anchorRef']
  height?: AnchoredOverlayProps['height']
  width?: AnchoredOverlayProps['width']
  align?: AnchoredOverlayProps['align']
  displayInViewport?: boolean
  cssAnchorPositioningSettings?: AnchoredOverlayProps['cssAnchorPositioningSettings']
  disabled?: boolean
  required?: boolean
  validationStatus?: 'error' | 'success'
  onCancel?: () => void
  onOpenChange?: (open: boolean, gesture: SelectPanelGesture) => void
  onSelectedChange?: (selected: ItemInput | ItemInput[] | undefined) => void
}
/** Source discriminated contracts for consumers composing panel configuration. */
export type SelectPanelProps = Omit<SelectPanelComponentProps, 'selected' | 'onSelectedChange' | 'variant' | 'onCancel' | 'renderAnchor' | 'anchorRef'> &
  ({ selected: ItemInput | undefined; onSelectedChange?: (selected: ItemInput | undefined) => void } | { selected: ItemInput[]; onSelectedChange?: (selected: ItemInput[]) => void }) &
  ({ variant?: 'anchored'; onCancel?: () => void } | { variant: 'modal'; onCancel: () => void }) &
  ({ renderAnchor?: Exclude<SelectPanelComponentProps['renderAnchor'], null>; anchorRef?: SelectPanelComponentProps['anchorRef'] } |
   { renderAnchor: null; anchorRef: NonNullable<SelectPanelComponentProps['anchorRef']> })
