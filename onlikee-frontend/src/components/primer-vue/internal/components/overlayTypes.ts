import type { AnchorAlignment, AnchorPosition, AnchorSide } from '@primer/behaviors'
import type { Component, HTMLAttributes, Ref, StyleValue } from 'vue'
import type { FocusZoneHookSettings } from '../../composables/useFocusZone'
export type OverlayWidth = 'auto' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
export type OverlayHeight =
  'auto' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'initial' | 'fit-content'
export type OverlayCloseGesture = 'escape' | 'click-outside'
export interface CSSAnchorPositioningSettings {
  disable?: boolean
  fallbackStrategy?: 'default' | 'none' | 'opposite-side'
}
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
  responsiveVariant?: 'fullscreen'
  role?: string
  cssAnchorPositioningSettings?: CSSAnchorPositioningSettings
}
