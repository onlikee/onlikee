import { inject, type ComputedRef, type InjectionKey } from 'vue'

type BlankslateContext = { size: ComputedRef<'small' | 'medium' | 'large'> }
export const blankslateContextKey: InjectionKey<BlankslateContext> = Symbol('Blankslate')

export function useBlankslate(): BlankslateContext {
  const context = inject(blankslateContextKey, null)
  if (!context) throw new Error('useBlankslate must be used within a BlankslateProvider')
  return context
}
