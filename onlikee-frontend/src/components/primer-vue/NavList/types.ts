import type { Component, HTMLAttributes, NativeElements, VNodeChild } from 'vue'
import type { PolymorphicProps } from '../Button/types'
import type {
  ActionListDescriptionProps,
  ActionListDividerProps,
  ActionListGroupHeadingProps,
  ActionListLeadingVisualProps,
  ActionListTrailingActionProps,
  ActionListTrailingVisualProps,
} from '../ActionList'

export interface NavListProps extends /* @vue-ignore */ HTMLAttributes {
  disableItemGap?: boolean
  className?: string
}

export interface NavListHeadingProps extends /* @vue-ignore */ HTMLAttributes {
  as?: 'h2' | 'h3'
  visuallyHidden?: boolean
  className?: string
}

interface NavListItemOptions {
  defaultOpen?: boolean
  href?: string
  inactiveText?: string
  tooltipText?: string
  className?: string
}

export type NavListItemProps<As extends keyof NativeElements | Component = 'a'> = PolymorphicProps<
  As,
  NavListItemOptions & { 'aria-current'?: HTMLAttributes['aria-current'] }
>

export type NavListItemComponentProps<As extends keyof NativeElements | Component = 'a'> =
  NavListItemOptions & { as?: As } & /* @vue-ignore */ Omit<
      NavListItemProps<NoInfer<As>>,
      keyof NavListItemOptions | 'as'
    >

export type NavListSubNavProps = Record<string, never>

export interface NavListGroupProps extends /* @vue-ignore */ HTMLAttributes {
  title?: string
  hideDivider?: boolean
  className?: string
}

export type NavListGroupHeadingProps = ActionListGroupHeadingProps
export type NavListDescriptionProps = ActionListDescriptionProps
export type NavListLeadingVisualProps = ActionListLeadingVisualProps
export type NavListTrailingVisualProps = ActionListTrailingVisualProps
export type NavListTrailingActionProps = ActionListTrailingActionProps
export type NavListDividerProps = ActionListDividerProps

export type NavListGroupItem = Omit<
  NavListItemProps<keyof NativeElements | Component>,
  'children'
> & {
  text: string
  trailingVisual?: Component | string
  leadingVisual?: Component
  trailingAction?: ActionListTrailingActionProps
  'data-expand-focus-target'?: string
}

export interface NavListGroupExpandProps {
  label?: string
  pages?: number
  items: NavListGroupItem[]
  renderItem?: (item: NavListGroupItem) => VNodeChild
}

export interface NavListInstance {
  element: HTMLElement | null
}

export interface NavListItemInstance {
  element: HTMLElement | null
}

export interface NavListSubNavInstance {
  element: HTMLUListElement | null
}

export interface NavListGroupExpandInstance {
  element: HTMLButtonElement | null
}
