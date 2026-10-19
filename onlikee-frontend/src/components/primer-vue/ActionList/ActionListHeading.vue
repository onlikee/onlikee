<script setup lang="ts">
import classes from './ActionList.module.css'
import { computed, shallowRef, useAttrs, type HTMLAttributes } from 'vue'
import { useContainerContext, useContext, exposeElement } from './context'
import { Heading } from '../Heading'
import type { ActionListHeadingProps } from './types'
defineOptions({
  name: 'ActionListHeading',
  __SLOT__: Symbol('ActionList.Heading'),
  inheritAttrs: false,
})
const props = withDefaults(
  defineProps<Pick<ActionListHeadingProps, 'as' | 'size' | 'visuallyHidden' | 'className'>>(),
  { visuallyHidden: false, size: undefined, className: undefined },
)
const context = useContext()
const container = useContainerContext()
const attrs = useAttrs() as HTMLAttributes
const heading = shallowRef<InstanceType<typeof Heading> | null>(null)
const element = computed(() => heading.value?.element ?? null)
function bindings() {
  if (container.container === 'ActionMenu')
    throw new Error(
      "ActionList.Heading shouldn't be used within an ActionMenu container. Menus are labelled by the menu button's name.",
    )
  return {
    id: attrs.id ?? context?.headingId,
    'data-component': 'ActionList.Heading',
    'data-list-variant': context?.variant.value,
    ...attrs,
    class: [
      classes['action-list-header'],
      props.className,
      attrs.class,
      props.visuallyHidden && classes['action-list-visually-hidden'],
    ],
  }
}
defineExpose(exposeElement(element))
</script>
<template>
  <Heading ref="heading" :as="as" :variant="size" v-bind="bindings()">
    <slot />
  </Heading>
</template>
