import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Component,
  ComponentPublicInstance,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
  VNode,
} from 'vue'
import type { TooltipDirection } from '../TooltipV2/types'

export type VariantType = 'default' | 'primary' | 'invisible' | 'danger' | 'link'
export type Size = 'small' | 'medium' | 'large'
export type AlignContent = 'start' | 'center'
export type NotificationIndicatorPlacement = 'button' | 'leadingVisual' | 'icon'
export type ButtonVisual = Component | string | VNode | null

export interface ButtonBehaviorOptions {
  variant?: VariantType
  size?: Size
  disabled?: boolean
  block?: boolean
  loading?: boolean
  loadingAnnouncement?: string
  inactive?: boolean
  labelWrap?: boolean
  className?: string
}

export type ButtonBaseProps = ButtonBehaviorOptions & RemoveIndexSignature<ButtonHTMLAttributes>

export type ButtonOptions = ButtonBaseProps & {
  alignContent?: AlignContent
  icon?: ButtonVisual
  leadingVisual?: ButtonVisual
  trailingVisual?: ButtonVisual
  trailingAction?: Component | string | null
  count?: number | string
  notificationIndicator?: 'button' | 'leadingVisual'
}

export type IconButtonOptions = Omit<ButtonBaseProps, 'aria-label' | 'aria-labelledby'> & {
  icon: Component | string
  notificationIndicator?: 'button' | 'icon'
  unsafeDisableTooltip?: boolean
  description?: string
  tooltipDirection?: TooltipDirection
  /** @deprecated Use keybindingHint instead. */
  keyshortcuts?: string
  keybindingHint?: string | string[]
  'aria-label'?: string
  'aria-labelledby'?: string
}

type ElementProps<As> = As extends keyof NativeElements
  ? RemoveIndexSignature<NativeElements[As]>
  : As extends string
    ? HTMLAttributes & AnchorHTMLAttributes & ButtonHTMLAttributes
    : Component extends As
      ? HTMLAttributes
      : As extends new (...args: never[]) => { $props: infer Props }
        ? Props
        : As extends FunctionalComponent<infer Props>
          ? Props
          : HTMLAttributes

export type PolymorphicProps<As extends string | Component, OwnProps> = As extends unknown
  ? OwnProps extends unknown
    ? Omit<OwnProps, 'as'> & {
        as?: As
      } & Omit<ElementProps<As>, keyof OwnProps | 'as'>
    : never
  : never

type RemoveIndexSignature<T> = {
  [
    K in keyof T as string extends K
      ? never
      : number extends K
        ? never
        : symbol extends K
          ? never
          : K
  ]: T[K]
}

export type ButtonProps<As extends string | Component = 'button'> = PolymorphicProps<
  As,
  ButtonOptions
>

export type ButtonBaseOptions = Omit<ButtonOptions, 'notificationIndicator'> & {
  notificationIndicator?: NotificationIndicatorPlacement
}

export type ButtonBaseComponentOptions<As extends string | Component = 'button'> = PolymorphicProps<
  As,
  ButtonBaseOptions
>

export type ButtonA11yProps =
  | { 'aria-label': string; 'aria-labelledby'?: undefined }
  | { 'aria-label'?: undefined; 'aria-labelledby': string }

type AnchorOnlyAttributes = Partial<
  Record<Exclude<keyof AnchorHTMLAttributes, keyof ButtonHTMLAttributes>, never>
>

type IconButtonBaseOptions = Omit<IconButtonOptions, 'aria-label' | 'aria-labelledby'>
export type IconButtonOwnProps =
  | (IconButtonBaseOptions & { 'aria-label': string; 'aria-labelledby'?: undefined })
  | (IconButtonBaseOptions & { 'aria-label'?: undefined; 'aria-labelledby': string })

export type IconButtonProps<As extends string | Component = 'button'> = PolymorphicProps<
  As,
  IconButtonOwnProps
>

export type LinkButtonOwnOptions = ButtonOptions &
  Omit<ButtonHTMLAttributes, keyof AnchorHTMLAttributes> &
  Omit<AnchorHTMLAttributes, 'type'> &
  Pick<ButtonHTMLAttributes, 'type'>

export type LinkButtonProps<As extends string | Component = 'a'> = PolymorphicProps<
  As,
  LinkButtonOwnOptions
>

export interface ButtonBaseComponentProps
  extends /* @vue-ignore */ ButtonHTMLAttributes, /* @vue-ignore */ AnchorOnlyAttributes {
  as?: string | Component
  type?: 'button' | 'submit' | 'reset'
  variant?: VariantType
  size?: Size
  disabled?: boolean
  block?: boolean
  loading?: boolean
  loadingAnnouncement?: string
  inactive?: boolean
  labelWrap?: boolean
  className?: string
  id?: string
  alignContent?: AlignContent
  icon?: ButtonVisual
  leadingVisual?: ButtonVisual
  trailingVisual?: ButtonVisual
  trailingAction?: Component | string | null
  count?: number | string
  notificationIndicator?: NotificationIndicatorPlacement
}

export interface ButtonComponentProps extends ButtonBaseComponentProps {
  notificationIndicator?: 'button' | 'leadingVisual'
}

export interface IconButtonComponentProps extends ButtonBaseComponentProps {
  icon: Component | string
  notificationIndicator?: 'button' | 'icon'
  unsafeDisableTooltip?: boolean
  description?: string
  tooltipDirection?: TooltipDirection
  /** @deprecated Use keybindingHint instead. */
  keyshortcuts?: string
  keybindingHint?: string | string[]
  'aria-label'?: string
  'aria-labelledby'?: string
}

export type LinkButtonComponentProps = ButtonComponentProps

export interface ButtonInstance {
  element: HTMLElement | null
  focus: (options?: FocusOptions) => void
  blur: () => void
}

export type ButtonElement = HTMLElement | ComponentPublicInstance
