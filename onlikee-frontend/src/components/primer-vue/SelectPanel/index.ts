import Panel from './SelectPanel.vue'
import Message from './SelectPanelMessage.vue'
import SecondaryActionButton from './SecondaryActionButton.vue'
import SecondaryActionLink from './SecondaryActionLink.vue'
export const SelectPanel = Object.assign(Panel, {
  Message,
  SecondaryActionButton,
  SecondaryActionLink,
})
export { default as SelectPanelMessage } from './SelectPanelMessage.vue'
export type { SelectPanelProps, SelectPanelGesture, SelectPanelMessageProps } from './types'
export type {
  ItemInput,
  FilteredActionListItemProps as ItemProps,
  GroupedListProps,
  ListPropsBase,
} from '../FilteredActionList/types'
