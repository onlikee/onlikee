import UnderlineNavRoot from './UnderlineNav.vue'
import UnderlineNavItem from './UnderlineNavItem.vue'

export const UnderlineNav = Object.assign(UnderlineNavRoot, {
  Item: UnderlineNavItem,
})

export { UnderlineNavItem }
export type { UnderlineNavBreakpoint, UnderlineNavCurrent } from './context'
