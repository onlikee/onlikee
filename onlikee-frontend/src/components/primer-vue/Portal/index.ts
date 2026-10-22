import PortalProvider from './PortalProvider.vue'

export { default, default as Portal } from './Portal.vue'
export type { PortalProps } from './Portal.vue'
export { registerPortalRoot } from './portalRoot'
export type { PortalContextValue } from './context'
export const PortalContext = { Provider: PortalProvider }
