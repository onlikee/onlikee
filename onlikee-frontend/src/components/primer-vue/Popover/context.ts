import type { ComputedRef, InjectionKey } from 'vue'

export const popoverContextKey: InjectionKey<ComputedRef<boolean>> = Symbol('Popover')
