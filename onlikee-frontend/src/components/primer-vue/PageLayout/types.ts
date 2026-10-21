import type { Component, CSSProperties, Ref } from 'vue'

export type ResponsiveValue<TRegular, TNarrow = TRegular, TWide = TRegular> = {
  narrow?: TNarrow
  regular?: TRegular
  wide?: TWide
}
export type Spacing = 'none' | 'condensed' | 'normal'
export type ContainerWidth = 'full' | 'medium' | 'large' | 'xlarge'
export type Divider = 'none' | 'line' | ResponsiveValue<'none' | 'line', 'none' | 'line' | 'filled'>
export type Position = 'start' | 'end' | ResponsiveValue<'start' | 'end'>
export type PaneWidth = 'small' | 'medium' | 'large'
export type CustomWidthOptions = { min: `${number}px`; default: `${number}px`; max: `${number}px` }
export type PaneWidthValue = PaneWidth | CustomWidthOptions
export interface PageLayoutElementProps {
  className?: string
  style?: CSSProperties
  'data-component'?: string
}
export interface PageLayoutProps extends PageLayoutElementProps {
  containerWidth?: ContainerWidth
  padding?: Spacing
  rowGap?: Spacing
  columnGap?: Spacing
  _slotsConfig?: Record<'header' | 'footer' | 'sidebar', Component>
}
export interface PageLayoutHeaderProps extends PageLayoutElementProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  padding?: Spacing
  divider?: Divider
  /** @deprecated Use divider with a responsive value. */
  dividerWhenNarrow?: 'inherit' | 'none' | 'line' | 'filled'
  hidden?: boolean | ResponsiveValue<boolean>
}
export type PageLayoutFooterProps = PageLayoutHeaderProps
export interface PageLayoutContentProps extends PageLayoutElementProps {
  as?: string | Component
  'aria-label'?: string
  'aria-labelledby'?: string
  width?: ContainerWidth
  padding?: Spacing
  hidden?: boolean | ResponsiveValue<boolean>
}
export interface PageLayoutPaneBaseProps extends PageLayoutElementProps {
  position?: Position
  /** @deprecated Use position with a responsive value. */
  positionWhenNarrow?: 'inherit' | 'start' | 'end'
  'aria-label'?: string
  'aria-labelledby'?: string
  width?: PaneWidthValue
  minWidth?: number
  widthStorageKey?: string
  padding?: Spacing
  divider?: Divider
  /** @deprecated Use divider with a responsive value. */
  dividerWhenNarrow?: 'inherit' | 'none' | 'line' | 'filled'
  sticky?: boolean
  offsetHeader?: string | number
  hidden?: boolean | ResponsiveValue<boolean>
  resizable?: boolean
  id?: string
}
export type ControlledWidthProps =
  | { onResizeEnd: (width: number) => void; currentWidth: number | undefined }
  | { onResizeEnd?: never; currentWidth?: never }
export type PageLayoutPaneProps = PageLayoutPaneBaseProps & ControlledWidthProps
export interface PageLayoutSidebarBaseProps extends PageLayoutElementProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  position?: 'start' | 'end'
  width?: PaneWidthValue
  minWidth?: number
  resizable?: boolean
  widthStorageKey?: string
  padding?: Spacing
  divider?: 'none' | 'line'
  sticky?: boolean
  responsiveVariant?: 'default' | 'fullscreen'
  hidden?: boolean | ResponsiveValue<boolean>
  id?: string
}
export type PageLayoutSidebarProps = PageLayoutSidebarBaseProps & ControlledWidthProps
export interface PageLayoutPaneComponentProps extends PageLayoutPaneBaseProps {
  onResizeEnd?: (width: number) => void
  currentWidth?: number
}
export interface PageLayoutSidebarComponentProps extends PageLayoutSidebarBaseProps {
  onResizeEnd?: (width: number) => void
  currentWidth?: number
}
/** Vue component refs expose the inner pane/sidebar DOM node through element. */
export interface PageLayoutPaneInstance {
  element: HTMLDivElement | null
}
export interface DragHandleProps {
  handleRef: Ref<HTMLDivElement | null>
  onDragStart: (clientX: number) => void
  onDrag: (value: number, isKeyboard: boolean) => void
  onDragEnd: () => void
  onDoubleClick?: (event: MouseEvent) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-valuemin'?: number
  'aria-valuemax'?: number
  'aria-valuenow'?: number
  dragTargetRef?: Ref<HTMLElement | null>
  contentWrapperRef?: Ref<HTMLElement | null>
  formatValueText?: (valueNow: number) => string
  'data-component'?: string
}
