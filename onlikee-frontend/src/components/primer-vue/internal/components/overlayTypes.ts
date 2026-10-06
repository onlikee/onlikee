import type { AnchorAlignment, AnchorPosition, AnchorSide } from '@primer/behaviors'
import type { Component, HTMLAttributes, Ref, StyleValue, VNodeChild } from 'vue'
import type { FocusZoneHookSettings } from '../../composables/useFocusZone'
export type OverlayWidth = 'auto' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
export type OverlayHeight = 'auto' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'initial' | 'fit-content'
export type OverlayCloseGesture = 'escape' | 'click-outside'
export interface CSSAnchorPositioningSettings {
  disable?: boolean
  fallbackStrategy?: 'default' | 'none' | 'opposite-side'
}
/**
 * 对应 React hooks/useFocusTrap.ts:6-45 的 FocusTrapHookSettings 完整字段面。
 * AnchoredOverlay.tsx:87,290-293 以 `Partial<FocusTrapHookSettings>` 透传，故所有字段可选。
 * 审计偏差 #3：即便当前端口无消费者传 restoreFocusOnCleanUp/returnFocusRef/allowOutsideClick
 * （SelectPanel 仅传 initialFocusRef，Dialog 自带独立焦点管理），仍按“保持对齐”补全接口面，
 * 供后续补充消费者使用。
 *
 * 行为怪癖（登记，未在本端口合并式 Overlay 中复刻——React 用 useFocusTrap.disableTrap 做恢复，
 * Vue Overlay 合并了 useOpenAndCloseFocus 的恢复路径，见 Overlay.vue:83-104 注释）：
 * - previousFocusedElement 在渲染期捕获（`if (!prev && !disabled) prev = document.activeElement`）；
 * - disableTrap 恢复优先级：allowOutsideClick && outsideClicked → 跳过；否则 returnFocusRef →
 *   focus；否则 restoreFocusOnCleanUp && prev → focus 且置空 prev；
 * - outsideClicked 一旦置真永不复位（useFocusTrap.ts:70,100）；
 * - allowOutsideClick 时外点会 mutate settings（returnFocusRef=undefined、restoreFocusOnCleanUp=false）
 *   并 abort trap（:104-108）；
 * - useOnOutsideClick 的注册不以 open/disabled 为门（恒注册）。
 * 若未来移植依赖上述语义的消费者（如 Dialog 走 useFocusTrap 路径），须在 Overlay.vue trap watch
 * 中复刻 disableTrap 优先级与 outsideClicked/mutation 怪癖。
 */
export interface FocusTrapSettings {
  containerRef?: Ref<HTMLElement | null>
  initialFocusRef?: Ref<HTMLElement | null>
  disabled?: boolean
  restoreFocusOnCleanUp?: boolean
  returnFocusRef?: Ref<HTMLElement | null>
  allowOutsideClick?: boolean
}
export interface OverlayProps extends /* @vue-ignore */ HTMLAttributes {
  as?: string | Component
  portalContainerName?: string
  _PrivateDisablePortal?: boolean
  open?: boolean
  anchor?: HTMLElement | null
  side?: AnchorSide
  align?: AnchorAlignment
  anchorOffset?: number
  alignmentOffset?: number
  allowOutOfBounds?: boolean
  displayInViewport?: boolean
  pinPosition?: boolean
  preventOverflow?: boolean
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  overflow?: 'auto' | 'hidden' | 'scroll' | 'visible'
  visibility?: 'visible' | 'hidden'
  maxHeight?: Exclude<OverlayHeight, 'auto' | 'initial'>
  maxWidth?: Exclude<OverlayWidth, 'auto'>
  width?: OverlayWidth
  height?: OverlayHeight
  preventFocusOnOpen?: boolean
  initialFocusRef?: Ref<HTMLElement | null> | HTMLElement | null
  returnFocusRef?: Ref<HTMLElement | null> | HTMLElement | null
  trapFocus?: boolean
  focusTrapSettings?: FocusTrapSettings
  focusZoneSettings?: FocusZoneHookSettings
  ignoreClickRefs?: Ref<HTMLElement | null>[]
  onEscape?: (event: KeyboardEvent) => void
  onClickOutside?: (event: MouseEvent) => void
  onPositionChange?: (position: AnchorPosition | undefined) => void
  className?: string
  style?: StyleValue
  anchorSide?: AnchorSide
  /** React Overlay BaseOverlayProps.responsiveVariant —— 仅 'fullscreen'，样式由 narrow 媒体查询驱动。 */
  responsiveVariant?: 'fullscreen'
  role?: string
  cssAnchorPositioningSettings?: CSSAnchorPositioningSettings
}
export interface AnchorRenderProps extends HTMLAttributes {
  ref: (element: unknown) => void
  children?: VNodeChild
}
export interface AnchoredOverlayProps {
  open: boolean
  anchorId?: string
  anchorRef?: Ref<HTMLElement | null>
  renderAnchor?: ((props: AnchorRenderProps) => VNodeChild) | null
  overlayProps?: OverlayProps
  align?: AnchorAlignment
  /** React AnchoredOverlay.tsx:144,170-173 —— side 默认取 overlayProps.anchorSide || 'outside-bottom' */
  side?: AnchorSide
  anchorOffset?: number
  alignmentOffset?: number
  width?: OverlayWidth
  height?: OverlayHeight
  variant?: 'anchored' | 'fullscreen' | { narrow?: 'anchored' | 'fullscreen'; regular?: 'anchored' | 'fullscreen' }
  displayInViewport?: boolean
  pinPosition?: boolean
  preventOverflow?: boolean
  className?: string
  displayCloseButton?: boolean
  closeButtonProps?: HTMLAttributes
  cssAnchorPositioningSettings?: CSSAnchorPositioningSettings
  focusTrapSettings?: FocusTrapSettings
  focusZoneSettings?: FocusZoneHookSettings
  /** React AnchoredOverlay.tsx:114,248-252 —— 仅在 position 真值时以 {position} 包装回调 */
  onPositionChange?: (event: { position: AnchorPosition }) => void
}
