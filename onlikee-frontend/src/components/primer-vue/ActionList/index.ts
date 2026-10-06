import ActionListRoot from './ActionList.vue'
import ActionListItem from './ActionListItem.vue'
import ActionListLinkItem from './ActionListLinkItem.vue'
import ActionListDivider from './ActionListDivider.vue'
import ActionListGroup from './ActionListGroup.vue'
import ActionListHeading from './ActionListHeading.vue'
import GroupHeading from './ActionListGroupHeading.vue'
import ActionListLeadingVisual from './ActionListLeadingVisual.vue'
import ActionListTrailingVisual from './ActionListTrailingVisual.vue'
import ActionListDescription from './ActionListDescription.vue'
import ActionListTrailingAction from './ActionListTrailingAction.vue'
import ActionListGroupHeadingTrailingAction from './ActionListGroupHeadingTrailingAction.vue'
import { ActionListContainerContext, ActionListGroupContext } from './context'

export const ActionListGroupHeading = Object.assign(GroupHeading, { TrailingAction: ActionListGroupHeadingTrailingAction })
export const ActionList = Object.assign(ActionListRoot, {
  ContainerContext: ActionListContainerContext,
  GroupContext: ActionListGroupContext,
  Item: ActionListItem, LinkItem: ActionListLinkItem, Divider: ActionListDivider, Group: ActionListGroup,
  Heading: ActionListHeading, GroupHeading: ActionListGroupHeading, TrailingAction: ActionListTrailingAction,
  LeadingVisual: ActionListLeadingVisual, TrailingVisual: ActionListTrailingVisual, Description: ActionListDescription
})
export {
  ActionListDescription, ActionListDivider, ActionListGroup, ActionListHeading, ActionListGroupHeadingTrailingAction,
  ActionListItem, ActionListLeadingVisual, ActionListLinkItem, ActionListTrailingVisual, ActionListTrailingAction,
  ActionListContainerContext, ActionListGroupContext
}
export type * from './types'
