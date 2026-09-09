import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'

export type ActionListVariant = 'inset' | 'horizontal-inset' | 'full'
export type ActionListSelectionVariant = 'single' | 'multiple'
export type ActionListItemVariant = 'default' | 'danger'
export type ActionListItemSize = 'medium' | 'large'
export type ActionListDescriptionVariant = 'inline' | 'block'

export interface ActionListContext {
  selectionVariant: ComputedRef<ActionListSelectionVariant | undefined>
  listRole: ComputedRef<string | undefined>
}

const actionListContextKey: InjectionKey<ActionListContext> = Symbol('ActionListContext')

export function createContext(context: ActionListContext): ActionListContext {
  return context
}

export function provideContext(context: ActionListContext) {
  provide(actionListContextKey, context)
}

export function useContext() {
  return inject(actionListContextKey, null)
}
