import type { AnchorAlignment, AnchorPosition, AnchorSide } from '@primer/behaviors'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  Ref,
  VNodeChild,
} from 'vue'
import type Button from '../SelectPanel/SelectPanelButton.vue'
import type { FocusZoneHookSettings } from '../composables/useFocusZone'
import type {
  CSSAnchorPositioningSettings,
  FocusTrapSettings,
  OverlayProps as InternalOverlayProps,
  OverlayWidth,
  OverlayHeight,
} from '../internal/components/overlayTypes'

export type OverlayProps = Pick<
  InternalOverlayProps,
  | 'as'
  | 'portalContainerName'
  | '_PrivateDisablePortal'
  | 'preventOverflow'
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'position'
  | 'overflow'
  | 'visibility'
  | 'maxHeight'
  | 'maxWidth'
  | 'width'
  | 'height'
  | 'preventFocusOnOpen'
  | 'initialFocusRef'
  | 'returnFocusRef'
  | 'ignoreClickRefs'
  | 'onEscape'
  | 'onClickOutside'
  | 'className'
  | 'style'
  | 'anchorSide'
  | 'responsiveVariant'
  | 'role'
> &
  HTMLAttributes & {
    'data-component'?: string
    'data-test-id'?: unknown
    ref?: Ref<HTMLElement | null> | ((element: HTMLElement | null) => void) | null
  }
type CloseButtonProps = Partial<
  Pick<
    InstanceType<typeof Button>['$props'],
    | 'as'
    | 'type'
    | 'variant'
    | 'size'
    | 'disabled'
    | 'block'
    | 'loading'
    | 'loadingAnnouncement'
    | 'inactive'
    | 'labelWrap'
    | 'icon'
    | 'className'
    | 'description'
    | 'tooltipDirection'
    | 'unsafeDisableTooltip'
    | 'keyshortcuts'
    | 'keybindingHint'
  >
> &
  ButtonHTMLAttributes &
  AnchorHTMLAttributes & { notificationIndicator?: 'button' | 'icon' }

export type AnchoredOverlayOpenGesture = 'anchor-click' | 'anchor-key-press'
export type AnchoredOverlayCloseGesture = 'anchor-click' | 'click-outside' | 'escape' | 'close'
export interface AnchorRenderProps extends HTMLAttributes {
  ref: (element: unknown) => void
  children?: VNodeChild
  popovertarget?: string
}
export type AnchoredOverlayWrapperAnchorProps =
  | {
      renderAnchor?: (props: AnchorRenderProps) => VNodeChild
      anchorRef?: Ref<HTMLElement | null>
      anchorId?: string
    }
  | { renderAnchor: null; anchorRef: Ref<HTMLElement | null>; anchorId?: string }

export interface AnchoredOverlayBaseProps {
  open: boolean
  onOpen?: (gesture: AnchoredOverlayOpenGesture, event?: KeyboardEvent) => unknown
  onClose?: (gesture: AnchoredOverlayCloseGesture) => unknown
  overlayProps?: Partial<OverlayProps>
  align?: AnchorAlignment
  side?: AnchorSide
  anchorOffset?: number
  alignmentOffset?: number
  width?: OverlayWidth
  height?: OverlayHeight
  variant?:
    'anchored' | { narrow?: 'anchored' | 'fullscreen'; regular?: 'anchored'; wide?: 'anchored' }
  displayInViewport?: boolean
  pinPosition?: boolean
  preventOverflow?: boolean
  className?: string
  displayCloseButton?: boolean
  closeButtonProps?: CloseButtonProps
  renderAs?: 'portal' | 'popover'
  cssAnchorPositioningSettings?: CSSAnchorPositioningSettings
  focusTrapSettings?: FocusTrapSettings
  focusZoneSettings?: FocusZoneHookSettings
  onPositionChange?: (event: { position: AnchorPosition }) => void
}
export type AnchoredOverlayComponentProps = AnchoredOverlayBaseProps &
  (
    | {
        renderAnchor: (props: AnchorRenderProps) => VNodeChild
        anchorRef?: Ref<HTMLElement | null>
        anchorId?: string
      }
    | { renderAnchor: null; anchorRef: Ref<HTMLElement | null>; anchorId?: string }
  )
export type AnchoredOverlayProps = AnchoredOverlayComponentProps
export type { CSSAnchorPositioningSettings, FocusTrapSettings, OverlayWidth, OverlayHeight }
