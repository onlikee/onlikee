import type { Component, HTMLAttributes, NativeElements } from 'vue'
import type { HeaderElement, HeaderProps, HeaderLinkProps } from '../Header/types'

export type ResponsiveValue<T> = { narrow?: T; regular?: T; wide?: T }
export type ChildrenPropTypes = {
  className?: string
  hidden?: boolean | ResponsiveValue<boolean>
}
export type PageHeaderProps<As extends keyof NativeElements | Component = 'div'> =
  HeaderProps<As> & {
    hasBorder?: boolean
  }
export type PageHeaderComponentProps<As extends keyof NativeElements | Component = 'div'> = {
  as?: As
  className?: string
  hasBorder?: boolean
} & /* @vue-ignore */ Omit<HeaderProps<NoInfer<As>>, 'as' | 'className' | 'hasBorder'>
export type PageHeaderChildProps = ChildrenPropTypes &
  /* @vue-ignore */ Omit<HTMLAttributes, 'hidden'>
export type TitleAreaProps = ChildrenPropTypes & {
  variant?: 'subtitle' | 'medium' | 'large' | ResponsiveValue<'subtitle' | 'medium' | 'large'>
}
export type TitleProps = ChildrenPropTypes & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
export type NavigationProps = ChildrenPropTypes & {
  as?: 'nav' | 'div'
  'aria-label'?: string
  'aria-labelledby'?: string
}
export type ParentLinkProps<As extends keyof NativeElements | Component = 'a'> = ChildrenPropTypes &
  Omit<HeaderLinkProps<As>, 'hidden'>
export type ParentLinkComponentProps<As extends keyof NativeElements | Component = 'a'> = {
  as?: As
  className?: string
  hidden?: boolean | ResponsiveValue<boolean>
} & /* @vue-ignore */ Omit<HeaderLinkProps<NoInfer<As>>, 'hidden' | 'as' | 'className'>
export type ActionsProps = ChildrenPropTypes
export interface PageHeaderInstance<As extends keyof NativeElements | Component = 'div'> {
  element: HeaderElement<As> | null
}
export interface TitleAreaInstance {
  element: HTMLDivElement | null
}
export interface ParentLinkInstance {
  element: HTMLElement | SVGElement | null
}
