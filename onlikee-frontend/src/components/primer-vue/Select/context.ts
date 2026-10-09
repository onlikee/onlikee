import type { ComputedRef, InjectionKey } from 'vue'

/** Native option selection for SSR; no registration or generated DOM substitutes. */
export const selectValueKey: InjectionKey<ComputedRef<string | undefined>> = Symbol('SelectValue')
