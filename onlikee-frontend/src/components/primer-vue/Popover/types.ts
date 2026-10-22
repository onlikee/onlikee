import type { HTMLAttributes, Ref } from 'vue'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export interface PopoverComponentProps extends /* @vue-ignore */ HTMLAttributes {
  as?: string
  className?: string
  caret?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-left'
    | 'top-right'
    | 'left-bottom'
    | 'left-top'
    | 'right-bottom'
    | 'right-top'
  relative?: boolean
  open?: boolean
}

export interface PopoverContentComponentProps extends /* @vue-ignore */ HTMLAttributes {
  as?: string
  className?: string
  width?: 'xsmall' | 'small' | 'large' | 'medium' | 'auto' | 'xlarge'
  height?: 'small' | 'large' | 'medium' | 'auto' | 'xlarge' | 'fit-content'
  overflow?: 'auto' | 'hidden' | 'scroll' | 'visible'
  onClickOutside?: (event: MouseEvent | TouchEvent) => void
  onEscape?: (event: KeyboardEvent) => void
  ignoreClickRefs?: Ref<HTMLElement | null>[]
}

export type PopoverProps = RemoveIndexSignature<PopoverComponentProps>
export type PopoverContentProps = RemoveIndexSignature<PopoverContentComponentProps>

/** Vue component refs expose the root DOM node through element. */
export interface PopoverInstance {
  element: HTMLDivElement | null
}
