import type { ComputedRef, InjectionKey } from 'vue'

export const cardContextKey: InjectionKey<{ titleId: ComputedRef<string | undefined> }> =
  Symbol('CardContext')
