import CircleBadgeRoot from './CircleBadge.vue'
import CircleBadgeIcon from './CircleBadgeIcon.vue'

/** @deprecated The React reference recommends direct icon imports with custom styling. */
export const CircleBadge = Object.assign(CircleBadgeRoot, { Icon: CircleBadgeIcon })
export { CircleBadgeIcon }
export type { CircleBadgeProps, CircleBadgeIconProps, CircleBadgeInstance } from './types'
export default CircleBadge
