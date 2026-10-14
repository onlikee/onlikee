import type {
  Component,
  ComponentPublicInstance,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
  Ref,
  VNodeChild,
  CSSProperties,
} from 'vue'
import type { ButtonProps } from '../Button/types'

type NativeProps<T> = {
  [Key in keyof T as string extends Key ? never : Key]: T[Key]
}
type ElementProps<As> = As extends keyof NativeElements
  ? NativeProps<NativeElements[As]>
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : object

export type DialogSectionProps<As extends keyof NativeElements | Component = 'div'> = {
  as?: As
  className?: string
} & Omit<ElementProps<As>, 'as' | 'className'>

export type DialogSectionComponentProps<As extends keyof NativeElements | Component = 'div'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, 'as' | 'className'>

export type DialogHeadingProps = { className?: string } & NativeProps<HTMLAttributes>
export type DialogHeadingComponentProps = {
  className?: string
} & /* @vue-ignore */ NativeProps<HTMLAttributes>

export interface DialogSectionInstance {
  element: Element | ComponentPublicInstance | null
}

export type DialogButtonProps = Omit<ButtonProps, 'content'> & {
  content: VNodeChild
  buttonType?: 'default' | 'normal' | 'primary' | 'danger'
  autoFocus?: boolean
  ref?: Ref<HTMLButtonElement | null>
}

export type DialogCloseGesture = 'close-button' | 'escape'
export type DialogWidth =
  'small' | 'medium' | 'large' | 'xlarge' | Exclude<CSSProperties['width'], undefined> | number
export type DialogHeight = 'small' | 'large' | 'auto'
type DialogPosition = 'left' | 'right' | 'bottom' | 'fullscreen' | 'center'
export interface DialogProps {
  'data-component'?: string
  title?: VNodeChild
  subtitle?: VNodeChild
  renderHeader?: (props: DialogHeaderProps & { children?: VNodeChild }) => VNodeChild
  renderBody?: (props: DialogProps & { children?: VNodeChild }) => VNodeChild
  renderFooter?: (props: DialogProps & { children?: VNodeChild }) => VNodeChild
  footerButtons?: DialogButtonProps[]
  onClose: (gesture: DialogCloseGesture) => void
  role?: 'dialog' | 'alertdialog'
  width?: DialogWidth
  height?: DialogHeight
  position?:
    | 'center'
    | 'left'
    | 'right'
    | { narrow?: DialogPosition; regular?: DialogPosition; wide?: DialogPosition }
  align?: 'top' | 'center' | 'bottom'
  returnFocusRef?: Ref<HTMLElement | null>
  initialFocusRef?: Ref<HTMLElement | null>
  className?: string
  style?: CSSProperties
}
export type DialogComponentProps = Omit<DialogProps, 'data-component'> &
  /* @vue-ignore */ Pick<DialogProps, 'data-component'>
export interface DialogHeaderProps extends DialogProps {
  dialogLabelId: string
  dialogDescriptionId: string
}
export interface DialogInstance {
  element: HTMLDivElement | null
}
