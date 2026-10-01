import type { Component } from 'vue'

export type ResponsiveValue<T> = { narrow?: T; regular?: T; wide?: T }
export type StackResponsive<T> = T | ResponsiveValue<T>
export type StackSpacing = 'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'
export type StackDirection = 'horizontal' | 'vertical'
export type StackAlign = 'stretch' | 'start' | 'center' | 'end' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-evenly'
export type StackWrap = 'wrap' | 'nowrap'

export interface StackProps {
  as?: string | Component
  gap?: StackResponsive<StackSpacing>
  direction?: StackResponsive<StackDirection>
  align?: StackResponsive<StackAlign>
  wrap?: StackResponsive<StackWrap>
  justify?: StackResponsive<StackJustify>
  padding?: StackResponsive<StackSpacing>
  paddingBlock?: StackResponsive<StackSpacing>
  paddingInline?: StackResponsive<StackSpacing>
}

export interface StackItemProps {
  as?: string | Component
  grow?: StackResponsive<boolean>
  shrink?: StackResponsive<boolean>
}
