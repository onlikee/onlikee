import type { Component, Ref } from 'vue'
import type { NodeProp } from '../internal/renderNode'
import type { TextInputProps } from '../TextInput'
import type { OverlayProps } from '../internal/components/overlayTypes'

export interface AutocompleteProps {
  id?: string
}
export interface AutocompleteInputProps extends TextInputProps {
  as?: Component
  openOnFocus?: boolean
  value?: string | number
  defaultValue?: string | number
  size?: 'small' | 'medium' | 'large'
  leadingVisual?: NodeProp
  trailingVisual?: NodeProp
  validationStatus?: 'error' | 'success'
  className?: string
}
export interface AutocompleteMenuItem {
  id: string
  text?: string
  children?: NodeProp
  leadingVisual?: NodeProp
  trailingVisual?: NodeProp
  disabled?: boolean
  inactiveText?: string
  loading?: boolean
  variant?: 'default' | 'danger'
  size?: 'medium' | 'large'
  className?: string
  metadata?: unknown
  [key: string]: unknown
}
export interface AutocompleteMenuProps<T extends AutocompleteMenuItem = AutocompleteMenuItem> {
  items: T[]
  selectedItemIds: string[]
  selectionVariant?: 'single' | 'multiple'
  loading?: boolean
  emptyStateText?: NodeProp | false | null
  filterFn?: (item: T, index: number) => boolean
  sortOnCloseFn?: (itemIdA: string, itemIdB: string) => number
  addNewItem?: T & { handleAddItem: (item: Omit<T, 'onAction' | 'leadingVisual'>) => void }
  onOpenChange?: (open: boolean) => void
  onSelectedChange?: (items: T | T[]) => void
  customScrollContainerRef?: Ref<HTMLElement | null> | HTMLElement
  'aria-labelledby': string
}
export type AutocompleteMenuInternalProps<T extends AutocompleteMenuItem = AutocompleteMenuItem> =
  AutocompleteMenuProps<T>
export interface AutocompleteOverlayProps extends Partial<OverlayProps> {
  menuAnchorRef?: Ref<HTMLElement | null> | HTMLElement
  overlayProps?: Partial<OverlayProps>
  className?: string
  'aria-labelledby'?: string
}
