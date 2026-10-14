import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

export interface PortalContextValue {
  portalContainerName?: string
}

export const portalContextKey: InjectionKey<ComputedRef<PortalContextValue>> =
  Symbol('PortalContext')

export function usePortalContext() {
  return inject(
    portalContextKey,
    computed<PortalContextValue>(() => ({})),
  )
}
