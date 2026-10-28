import { shallowRef, type InjectionKey, type Ref } from 'vue'

export interface TreeViewRootContext {
  announceUpdate: (message: string) => void
  expandedStateCache: Map<string, boolean>
  scrollElementIntoView: (element: Element | null | undefined) => void
}
export interface TreeViewItemContext {
  itemId: Ref<string>
  level: number
  isSubTreeEmpty: Readonly<Ref<boolean>>
  setIsSubTreeEmpty: (empty: boolean) => void
  isExpanded: Readonly<Ref<boolean>>
  setIsExpanded: (expanded: boolean) => void
  leadingVisualId: string
  trailingVisualId: string
  trailingActionId: string
}
export const treeViewRootKey: InjectionKey<TreeViewRootContext> = Symbol('TreeView')
export const treeViewItemKey: InjectionKey<TreeViewItemContext> = Symbol('TreeView.Item')
export const loadingPlaceholderKey: InjectionKey<boolean> = Symbol('TreeView.LoadingPlaceholder')

// Match the source defaults for components rendered outside a tree item.
export const defaultItemContext: TreeViewItemContext = {
  itemId: shallowRef(''),
  level: 1,
  isSubTreeEmpty: shallowRef(false),
  setIsSubTreeEmpty: () => {},
  isExpanded: shallowRef(false),
  setIsExpanded: () => {},
  leadingVisualId: '',
  trailingVisualId: '',
  trailingActionId: '',
}
