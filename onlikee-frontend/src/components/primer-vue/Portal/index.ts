import PortalProvider from './PortalProvider.vue'

export { default, default as Portal } from './Portal.vue'
export type { PortalProps } from './Portal.vue'
export { registerPortalRoot, getPortalRoot, ensureDefaultPortal } from './portalRoot'
export { usePortalContext } from './context'
export type { PortalContextValue } from './context'
export const PortalContext = { Provider: PortalProvider }
