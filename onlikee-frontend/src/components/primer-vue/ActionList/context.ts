import { inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type {
  ActionListContainerContextValue,
  ActionListGroupContextValue,
  ActionListSelectionVariant,
  ActionListVariant,
} from './types'
export type {
  ActionListDescriptionVariant,
  ActionListItemSize,
  ActionListItemVariant,
  ActionListSelectionVariant,
  ActionListVariant,
} from './types'

export interface ActionListContext {
  selectionVariant: ComputedRef<ActionListSelectionVariant | undefined>
  listRole: ComputedRef<string | undefined>
  variant: ComputedRef<ActionListVariant>
  headingId: string
}
export interface ActionListItemContext {
  variant: ComputedRef<import('./types').ActionListItemVariant>
  size: ComputedRef<import('./types').ActionListItemSize>
  disabled: ComputedRef<boolean>
  inactive: ComputedRef<boolean>
  inlineDescriptionId: ComputedRef<string>
  blockDescriptionId: ComputedRef<string>
  trailingVisualId: ComputedRef<string>
  setTruncatedText?: (text: string | undefined) => void
}
export const ActionListContainerContext: InjectionKey<Readonly<ActionListContainerContextValue>> =
  Symbol('ActionListContainerContext')
export const ActionListGroupContext: InjectionKey<Readonly<ActionListGroupContextValue>> =
  Symbol('ActionListGroupContext')
export const actionListItemContextKey: InjectionKey<ActionListItemContext> =
  Symbol('ActionListItemContext')
const actionListContextKey: InjectionKey<ActionListContext> = Symbol('ActionListContext')
export function provideContext(context: ActionListContext) {
  provide(actionListContextKey, context)
}
export function useContext() {
  return inject(actionListContextKey, null)
}
export function useContainerContext() {
  return inject(ActionListContainerContext, {})
}
export function useGroupContext() {
  return inject(ActionListGroupContext, {})
}
export function useItemContext() {
  return inject(actionListItemContextKey, null)
}
export function exposeElement(element: Ref<HTMLElement | null>) {
  return {
    element,
    focus: (options?: FocusOptions) => element.value?.focus(options),
    blur: () => element.value?.blur(),
  }
}
