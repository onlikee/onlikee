<script setup lang="ts">
import classes from './ActionList.module.css'
import { computed, h, ref, useAttrs, type Component } from 'vue'
import { Button, IconButton } from '../Button'
import type { ButtonProps, IconButtonProps } from '../Button'
import { exposeElement } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListTrailingActionProps } from './types'
defineOptions({
  name: 'ActionListTrailingAction',
  __SLOT__: Symbol('ActionList.TrailingAction'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionListTrailingActionProps>(), {
  as: 'button',
  tooltipDirection: 'w',
  loading: undefined,
  icon: undefined,
  className: undefined,
  style: undefined,
})
const attrs = useAttrs()
const button = ref<InstanceType<typeof Button> | null>(null)
const element = computed(() => button.value?.element ?? null)
function RenderButton() {
  const forwardedAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
  )
  const sharedProps = {
    ref: button,
    type: 'button' as const,
    variant: 'invisible' as const,
    class: [classes['action-list-trailing-action-button']],
  }

  if (props.as === 'a') {
    if (props.icon) {
      const iconButtonProps = {
        ...sharedProps,
        as: 'a',
        icon: props.icon,
        'aria-label': props.label,
        tooltipDirection: props.tooltipDirection,
        href: props.href,
        'data-loading': Boolean(props.loading),
        ...forwardedAttrs,
      } as IconButtonProps<'a'> & Record<string, unknown>
      return h(IconButton as unknown as Component, iconButtonProps)
    }
    const buttonProps = {
      ...sharedProps,
      as: 'a',
      href: props.href,
      'data-loading': Boolean(props.loading),
      'data-has-label': true,
      ...forwardedAttrs,
    } as ButtonProps<'a'> & Record<string, unknown>
    return h(Button as unknown as Component, buttonProps, { default: () => props.label })
  }

  if (props.icon) {
    const iconButtonProps = {
      ...sharedProps,
      as: 'button',
      icon: props.icon,
      'aria-label': props.label,
      tooltipDirection: props.tooltipDirection,
      loading: props.loading,
      'data-loading': Boolean(props.loading),
      ...forwardedAttrs,
    } as IconButtonProps<'button'> & Record<string, unknown>
    return h(IconButton as unknown as Component, iconButtonProps)
  }
  const buttonProps = {
    ...sharedProps,
    as: 'button',
    loading: props.loading,
    'data-loading': Boolean(props.loading),
    'data-has-label': true,
    ...forwardedAttrs,
  } as ButtonProps<'button'> & Record<string, unknown>
  return h(Button as unknown as Component, buttonProps, { default: () => props.label })
}
defineExpose(exposeElement(element))
</script>
<template>
  <span
    :class="[classes['action-list-trailing-action'], className, attrs.class]"
    data-component="ActionList.TrailingAction"
    :style="normalizeReactStyle(style ?? attrs.style)"
  >
    <RenderButton />
  </span>
</template>
