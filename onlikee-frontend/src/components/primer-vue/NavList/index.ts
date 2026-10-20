import Root from './NavList.vue'
import Heading from './NavListHeading.vue'
import Item from './NavListItem.vue'
import SubNav from './NavListSubNav.vue'
import Group from './NavListGroup.vue'
import GroupExpand from './NavListGroupExpand.vue'
import GroupHeading from './NavListGroupHeading.vue'
import { ActionList } from '../ActionList'

export const NavList = Object.assign(Root, {
  Description: ActionList.Description,
  Heading,
  Item,
  SubNav,
  LeadingVisual: ActionList.LeadingVisual,
  TrailingVisual: ActionList.TrailingVisual,
  TrailingAction: ActionList.TrailingAction,
  Divider: ActionList.Divider,
  Group,
  GroupExpand,
  GroupHeading,
})
export { GroupExpand }
export type * from './types'
