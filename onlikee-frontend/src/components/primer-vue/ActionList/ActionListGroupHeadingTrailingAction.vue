<script setup lang="ts">
import { computed, h, ref, useAttrs } from 'vue'
import { IconButton as Button } from '../Button'
import { exposeElement } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListGroupHeadingTrailingActionProps } from './types'
defineOptions({
  name: 'ActionListGroupHeadingTrailingAction',
  __SLOT__: Symbol('ActionList.GroupHeading.TrailingAction'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionListGroupHeadingTrailingActionProps>(), {
  as: 'button',
  tooltipDirection: 'w',
  loading: undefined,
  className: undefined,
  style: undefined,
})
const attrs = useAttrs()
const button = ref<InstanceType<typeof Button> | null>(null)
const element = computed(() => button.value?.element ?? null)
const RenderButton = () => {
  const sharedProps = {
    ref: button,
    type: 'button' as const,
    icon: props.icon,
    loading: props.loading,
    'aria-label': props.label,
    variant: 'invisible' as const,
    size: 'small' as const,
    tooltipDirection: props.tooltipDirection,
    'data-component': 'ActionList.GroupHeading.TrailingAction',
    ...attrs,
    class: [props.className, attrs.class],
    style: normalizeReactStyle(props.style ?? attrs.style),
  }
  return props.as === 'a'
    ? h(Button, { ...sharedProps, as: 'a', href: props.href })
    : h(Button, { ...sharedProps, as: 'button' })
}
defineExpose(exposeElement(element))
</script>
<template>
  <RenderButton />
</template>
