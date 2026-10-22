import Panel from './SelectPanel.vue'
import Message from './SelectPanelMessage.vue'
import SecondaryActionButton from './SecondaryActionButton.vue'
import SecondaryActionLink from './SecondaryActionLink.vue'
import type { Button, LinkButton } from '../Button'

type ButtonWrapper<
  Component extends abstract new (...args: never[]) => object,
  Props,
> = new () => Omit<InstanceType<Component>, '$props'> & { $props: Props }

export const SelectPanel = Object.assign(Panel, {
  Message,
  SecondaryActionButton: SecondaryActionButton as ButtonWrapper<
    typeof SecondaryActionButton,
    InstanceType<typeof Button>['$props']
  >,
  SecondaryActionLink: SecondaryActionLink as ButtonWrapper<
    typeof SecondaryActionLink,
    InstanceType<typeof LinkButton>['$props']
  >,
})
export { default as SelectPanelMessage } from './SelectPanelMessage.vue'
export type { SelectPanelProps, SelectPanelGesture, SelectPanelMessageProps } from './types'
export type {
  ItemInput,
  FilteredActionListItemProps as ItemProps,
  GroupedListProps,
  ListPropsBase,
} from '../FilteredActionList/types'
