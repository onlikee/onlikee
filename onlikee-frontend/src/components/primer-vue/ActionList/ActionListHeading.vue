<script setup lang="ts">
import classes from './ActionList.module.css'
import { computed, ref, useAttrs } from 'vue'
import { useContainerContext, useContext, exposeElement } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListHeadingProps } from './types'
defineOptions({ name: 'ActionListHeading', __SLOT__: Symbol('ActionList.Heading'), inheritAttrs: false })
const props = withDefaults(defineProps<Pick<ActionListHeadingProps, 'as' | 'size' | 'visuallyHidden' | 'className'>>(), { visuallyHidden: false, size: undefined, className: undefined })
const context = useContext()
const container = useContainerContext()
const attrs = useAttrs()
const element = ref<HTMLElement | null>(null)
const bindings = computed(() => {
  if (container.container === 'ActionMenu') throw new Error("ActionList.Heading shouldn't be used within an ActionMenu container. Menus are labelled by the menu button's name.")
  return {
    id: attrs.id ?? context?.headingId,
    'data-variant': props.size, 'data-component': 'ActionList.Heading', 'data-list-variant': context?.variant.value,
    ...attrs, class: [classes['action-list-heading'], classes['action-list-header'], props.className, attrs.class, props.visuallyHidden && classes['action-list-visually-hidden']], style: normalizeReactStyle(attrs.style)
  }
})
defineExpose(exposeElement(element))
</script>
<template>
  <component
    :is="as"
    ref="element"
    v-bind="bindings"
  >
    <slot />
  </component>
</template>
