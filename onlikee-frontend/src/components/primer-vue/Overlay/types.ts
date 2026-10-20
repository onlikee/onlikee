import type { AnchorSide } from '@primer/behaviors'
import type { Component, CSSProperties, HTMLAttributes, NativeElements, Ref, StyleValue } from 'vue'
import type { heightMap, widthMap } from './constants'

export type OverlayWidth = keyof typeof widthMap
export type OverlayHeight = keyof typeof heightMap
export type TouchOrMouseEvent = MouseEvent | TouchEvent

export interface BaseOverlayOptions {
  as?: keyof NativeElements | Component
  width?: OverlayWidth
  height?: OverlayHeight
  maxHeight?: Exclude<OverlayHeight, 'auto' | 'initial'>
  maxWidth?: Exclude<OverlayWidth, 'auto'>
  visibility?: 'visible' | 'hidden'
  overflow?: 'auto' | 'hidden' | 'scroll' | 'visible'
  position?: CSSProperties['position']
  top?: CSSProperties['top']
  left?: CSSProperties['left']
  right?: CSSProperties['right']
  bottom?: CSSProperties['bottom']
  role?: HTMLAttributes['role']
  className?: string
  style?: StyleValue
  responsiveVariant?: 'fullscreen'
}

export interface OverlayOptions extends BaseOverlayOptions {
  anchorSide?: AnchorSide
  _PrivateDisablePortal?: boolean
  ignoreClickRefs?: Ref<HTMLElement | null>[]
  initialFocusRef?: Ref<HTMLElement | null>
  returnFocusRef: Ref<HTMLElement | null>
  onClickOutside: (event: TouchOrMouseEvent) => void
  onEscape: (event: KeyboardEvent) => void
  portalContainerName?: string
  preventOverflow?: boolean
  preventFocusOnOpen?: boolean
}

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export type OverlayElementProps<As> = As extends keyof NativeElements
  ? RemoveIndexSignature<NativeElements[As]>
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends (props: infer Props, ...args: never[]) => unknown
      ? Props
      : RemoveIndexSignature<HTMLAttributes>

export type OverlayProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  OverlayOptions,
  'as'
> & { as?: As; 'data-component'?: string; 'data-test-id'?: unknown } & Omit<
    OverlayElementProps<NoInfer<As>>,
    keyof OverlayOptions
  >

export type OverlayComponentProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  OverlayOptions,
  'as'
> & { as?: As }

export interface OverlayInstance {
  element: HTMLElement | null
}
