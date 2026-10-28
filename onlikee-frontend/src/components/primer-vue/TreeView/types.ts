import type {
  Component,
  ComponentPublicInstance,
  CSSProperties,
  FunctionalComponent,
  NativeElements,
} from 'vue'

export interface TreeViewProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  flat?: boolean
  truncate?: boolean
  className?: string
  style?: CSSProperties
}

export type TreeViewComponentProps = Omit<TreeViewProps, 'aria-label' | 'aria-labelledby'> &
  /* @vue-ignore */ Pick<TreeViewProps, 'aria-label' | 'aria-labelledby'>

export interface TreeViewSecondaryActions {
  label: string
  onClick: () => void
  icon: Component
  count?: number | string
  className?: string
}

export interface TreeViewItemBaseProps {
  id: string
  'aria-label'?: string
  'aria-labelledby'?: string
  containIntrinsicSize?: string
  current?: boolean
  defaultExpanded?: boolean
  expanded?: boolean | null
  onExpandedChange?: (expanded: boolean) => void
  onSelect?: (event: MouseEvent | KeyboardEvent) => void
  className?: string
  secondaryActions?: TreeViewSecondaryActions[]
}

type NativeProps<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}
type ElementProps<As> = As extends keyof NativeElements
  ? NativeProps<NativeElements[As]>
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : object

export type TreeViewItemProps<As extends keyof NativeElements | Component = 'li'> =
  As extends unknown
    ? TreeViewItemBaseProps & { as?: As } & Omit<
          ElementProps<As>,
          keyof TreeViewItemBaseProps | 'as'
        >
    : never

export type TreeViewItemComponentProps<As extends keyof NativeElements | Component = 'li'> =
  TreeViewItemBaseProps & { as?: As } & /* @vue-ignore */ Omit<
      ElementProps<NoInfer<As>>,
      keyof TreeViewItemBaseProps | 'as'
    >

export interface TreeViewItemInstance {
  element: Element | ComponentPublicInstance | null
}

export type SubTreeState = 'initial' | 'loading' | 'done' | 'error'
export interface TreeViewSubTreeProps {
  state?: SubTreeState
  count?: number
  'aria-label'?: string
}
export interface TreeViewVisualProps {
  label?: string
}
export interface TreeViewTrailingAction {
  items: TreeViewSecondaryActions[]
  shortcutText: string
}
export interface TreeViewActionDialogProps {
  items: TreeViewSecondaryActions[]
  onClose?: () => void
}
export interface TreeViewErrorDialogProps {
  title?: string
  onRetry?: () => void
  onDismiss?: () => void
}
