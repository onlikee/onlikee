import TopicTagRoot from './TopicTag.vue'
import TopicTagGroupRoot from './TopicTagGroup.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { TopicTagComponentProps, TopicTagGroupProps } from './types'

const Root = TopicTagRoot as <As extends keyof NativeElements | Component = 'a'>(
  props: TopicTagComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof TopicTagRoot<As>>

export const TopicTagGroup = TopicTagGroupRoot as unknown as {
  new (): Omit<InstanceType<typeof TopicTagGroupRoot>, '$props'> & {
    $props: TopicTagGroupProps & AllowedComponentProps & VNodeProps
  }
}

export const TopicTag = Object.assign(Root, { Group: TopicTagGroup })
export default TopicTag
export type {
  TopicTagProps,
  TopicTagGroupProps,
  TopicTagElement,
  TopicTagInstance,
  TopicTagGroupInstance,
} from './types'
