import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { ActionMenuProps, MenuCloseHandler } from './types'

export interface MenuContext {
  open: ComputedRef<boolean>
  anchor: ComputedRef<HTMLElement | null>
  anchorRefIdentity: ComputedRef<ActionMenuProps['anchorRef']>
  anchorId: Ref<string>
  isSubmenu: boolean
  fullscreen: Ref<boolean>
  openingGesture: Ref<'mouse' | 'first' | 'last'>
  setAnchor: (element: HTMLElement | null) => void
  onOpen: () => void
  onClose: MenuCloseHandler
  onAnchorClick: (event: MouseEvent, wasOpen: boolean) => void
  onAnchorKeydown: (event: KeyboardEvent) => void
  setFocusItem: (handler: (last: boolean) => void) => void
}
export const actionMenuContextKey: InjectionKey<MenuContext> = Symbol('ActionMenu')
export function useMenuContext() {
  const context = inject(actionMenuContextKey)
  if (!context) throw new Error('ActionMenu parts must be rendered within ActionMenu.')
  return context
}
