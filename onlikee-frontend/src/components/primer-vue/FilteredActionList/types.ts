import type { Component, HTMLAttributes, Ref, VNodeChild } from 'vue'
import type { TextInputOptions } from '../TextInput/types'
export type Visual = VNodeChild | Component
export interface FilteredActionListItemProps extends Omit<HTMLAttributes, 'id' | 'children'> {
  text?: string
  description?: string
  descriptionVariant?: 'inline' | 'block'
  leadingVisual?: Visual
  trailingIcon?: Visual
  trailingText?: string
  trailingVisual?: Visual
  variant?: 'default' | 'danger'
  selected?: boolean
  groupId?: string
  disabled?: boolean
  inactiveText?: string
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
  onAction?: (item: FilteredActionListItemProps, event: MouseEvent | KeyboardEvent) => void
  id?: number | string
  key?: string | number
  children?: VNodeChild
  role?: string
  item?: ItemInput
  className?: string
  renderItem?: RenderItemFn
}
export type ItemInput = FilteredActionListItemProps
export type RenderItemFn = (props: FilteredActionListItemProps) => VNodeChild
export interface GroupMetadata {
  groupId: string
  header?: { title?: VNodeChild; variant?: 'subtle' | 'filled'; auxiliaryText?: VNodeChild }
  renderItem?: RenderItemFn
  renderGroup?: (props: GroupMetadata & { children: VNodeChild }) => VNodeChild
  className?: string
}
export interface ListPropsBase {
  items: ItemInput[]
  role?: string
  id?: string
  'aria-label'?: string
  renderItem?: RenderItemFn
  renderGroup?: GroupMetadata['renderGroup']
  variant?: 'inset' | 'horizontal-inset' | 'full'
  selectionVariant?: 'single' | 'multiple' | 'radio'
  showItemDividers?: boolean
}
export interface GroupedListProps extends ListPropsBase { groupMetadata: GroupMetadata[] }
export interface FilteredActionListProps extends ListPropsBase {
  groupMetadata?: GroupMetadata[]
  loading?: boolean
  loadingType?: FilteredActionListLoadingType
  placeholderText?: string
  filterValue?: string
  scrollContainerRef?: Ref<HTMLDivElement | null> | ((element: HTMLDivElement | null) => void)
  textInputProps?: Record<string, unknown>
  inputRef?: Ref<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void)
  message?: VNodeChild
  messageText?: { title: string; description: string }
  className?: string
  announcementsEnabled?: boolean
  fullScreenOnNarrow?: boolean
  showSelectAll?: boolean
  onFilterChange?: (value: string, event: Event | null) => void
  onSelectAllChange?: (checked: boolean) => void
  onInputRefChanged?: (element: HTMLInputElement | null) => void
  onListContainerRefChanged?: (element: HTMLElement | null) => void
  onActiveDescendantChanged?: (current: HTMLElement | undefined, previous: HTMLElement | undefined, directlyActivated: boolean) => void
  actionListProps?: HTMLAttributes & { className?: string; variant?: ListPropsBase['variant']; selectionVariant?: ListPropsBase['selectionVariant'] | false; showDividers?: boolean }
  focusOutBehavior?: 'stop' | 'wrap'
  _PrivateFocusManagement?: 'roving-tabindex' | 'active-descendant'
  disableSelectOnHover?: boolean
  setInitialFocus?: boolean
  focusPrependedElements?: boolean
  scrollBehavior?: ScrollBehavior
  virtualized?: boolean
}
export class FilteredActionListLoadingType {
  name: string
  appearsInBody: boolean
  constructor(name: string, appearsInBody: boolean) { this.name = name; this.appearsInBody = appearsInBody }
}
export const FilteredActionListLoadingTypes = {
  bodySpinner: new FilteredActionListLoadingType('body-spinner', true),
  bodySkeleton: new FilteredActionListLoadingType('body-skeleton', true),
  input: new FilteredActionListLoadingType('input', false)
}
/* 源 FilteredActionListInput.tsx:7-18 FilteredActionListInputProps
   （TextInputProps → Vue 侧 TextInputOptions 命名适配；React.Ref → Ref | 回调）。 */
export interface FilteredActionListInputProps extends Partial<Omit<TextInputOptions, 'onChange' | 'onKeydown'>> {
  inputRef: Ref<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void)
  onInputChange?: (event: Event) => void
  onInputFocus?: (event: FocusEvent) => void
  onInputKeyPress?: (event: KeyboardEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  placeholderText?: string
  listId: string
  inputDescriptionTextId: string
  loading: boolean
  fullScreenOnNarrow?: boolean
}
